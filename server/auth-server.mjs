import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import axios from 'axios';
import rateLimit from 'express-rate-limit';
import geoip from 'geoip-lite';
import { readFileSync } from 'node:fs';
import { config } from 'dotenv';

// Load .env.local only in development, not in production
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' });
}

const app = express();
const PORT = Number(process.env.AUTH_PORT || 4001);

// ── Config ──
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || 'test_client_id';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'test_client_secret';
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:5173/auth/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const IPQS_API_KEY = process.env.IPQUALITYSCORE_API_KEY;
const DEV_MODE = process.env.NODE_ENV === 'development';

// ── In-memory user sessions (use Redis in production) ──
const userSessions = new Map();
const blockedIPs = new Set();
const suspiciousIPs = new Map(); // IP -> count

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ── Rate Limiting ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  skip: (req) => req.user, // Don't rate limit authenticated users as much
});

// ── VPN/Proxy Detection ──
async function checkIPReputation(ip) {
  if (!IPQS_API_KEY) {
    console.warn('IPQS API key not set, skipping IP reputation check');
    return { isVpn: false, isBotThreat: false };
  }

  try {
    const response = await axios.get(`https://ipqualityscore.com/api/json/ip`, {
      params: {
        ip,
        key: IPQS_API_KEY,
        strictness: 1, // 0-3, higher = stricter
      },
      timeout: 3000,
    });

    return {
      isVpn: response.data.is_vpn || response.data.is_proxy,
      isBotThreat: response.data.is_bot_threat || false,
      fraudScore: response.data.fraud_score || 0,
    };
  } catch (error) {
    console.error('IP reputation check failed:', error.message);
    // Fail open - don't block on API failure
    return { isVpn: false, isBotThreat: false };
  }
}

// ── Middleware: IP validation ──
app.use(async (req, res, next) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

  if (blockedIPs.has(ip)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Check geoip for obvious proxies/VPNs
  const geo = geoip.lookup(ip);
  if (geo && ['T1', 'T2'].includes(geo.type)) {
    // T1/T2 are datacenter/vpn IPs
    const ipReputation = await checkIPReputation(ip);
    if (ipReputation.isVpn) {
      blockedIPs.add(ip);
      return res.status(403).json({ message: 'VPN/Proxy access not allowed' });
    }
  }

  req.clientIp = ip;
  next();
});

// ── Discord OAuth Login ──
app.get('/api/auth/login', authLimiter, (req, res) => {
  // Check if Discord is properly configured
  if (!DISCORD_CLIENT_ID || DISCORD_CLIENT_ID === 'test_client_id') {
    // Dev mode: Return test token directly
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionData = {
      userId: 'dev-user-123',
      username: 'TestUser',
      email: 'test@example.com',
      avatar: null,
      createdAt: new Date().toISOString(),
      ip: req.clientIp,
      lastActivity: Date.now(),
    };
    userSessions.set(`user:${sessionToken}`, sessionData);
    return res.json({
      success: true,
      devMode: true,
      token: sessionToken,
      message: 'Dev mode login successful'
    });
  }

  const state = crypto.randomBytes(16).toString('hex');
  const scope = ['identify', 'email'].join('%20');

  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&scope=${scope}&state=${state}`;

  // Store state in session (in production, use Redis with TTL)
  userSessions.set(`state:${state}`, { createdAt: Date.now() });

  res.json({ authUrl });
});

// ── Discord OAuth Callback ──
app.post('/api/auth/callback', authLimiter, async (req, res) => {
  const { code, state } = req.body;

  // Validate state
  if (!userSessions.has(`state:${state}`) || !code) {
    return res.status(400).json({ message: 'Invalid state or code' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      {
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI,
      },
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenResponse.data.access_token;

    // Get user info
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const discordUser = userResponse.data;

    // Security checks
    if (!discordUser.verified && !discordUser.email) {
      return res.status(400).json({ message: 'Discord account must be verified' });
    }

    // Create session token (JWT-like)
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionData = {
      userId: discordUser.id,
      username: discordUser.username,
      email: discordUser.email,
      avatar: discordUser.avatar,
      createdAt: new Date().toISOString(),
      ip: req.clientIp,
      lastActivity: Date.now(),
    };

    userSessions.set(`user:${sessionToken}`, sessionData);

    // Register user in webhook server for global tracking
    try {
      await axios.post('http://127.0.0.1:4000/api/users/register', {
        userId: discordUser.id,
        username: discordUser.username,
        email: discordUser.email,
      });
    } catch (e) {
      console.log('User registration in webhook server failed (non-critical):', e.message);
    }

    // Clean up state
    userSessions.delete(`state:${state}`);

    res.json({
      success: true,
      token: sessionToken,
      user: {
        id: discordUser.id,
        username: discordUser.username,
        avatar: discordUser.avatar,
        email: discordUser.email,
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error.message);

    // Track suspicious activity
    suspiciousIPs.set(req.clientIp, (suspiciousIPs.get(req.clientIp) || 0) + 1);
    if (suspiciousIPs.get(req.clientIp) > 10) {
      blockedIPs.add(req.clientIp);
    }

    res.status(400).json({ message: 'Failed to authenticate with Discord' });
  }
});

// ── Middleware: Verify session token ──
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const session = userSessions.get(`user:${token}`);
  if (!session) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // Check if session is too old (24 hours)
  if (Date.now() - new Date(session.createdAt).getTime() > 24 * 60 * 60 * 1000) {
    userSessions.delete(`user:${token}`);
    return res.status(401).json({ message: 'Session expired' });
  }

  // Update last activity
  session.lastActivity = Date.now();

  req.user = session;
  req.token = token;
  next();
}

// ── Protected route: Verify session ──
app.get('/api/auth/verify', verifyToken, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: req.user.userId,
      username: req.user.username,
      avatar: req.user.avatar,
    },
  });
});

// ── Logout ──
app.post('/api/auth/logout', verifyToken, (req, res) => {
  userSessions.delete(`user:${req.token}`);
  res.json({ success: true });
});

// ── Protected API endpoint example ──
app.get('/api/protected-test', verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}!` });
});

// ── Health check ──
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'auth-server' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🔐 Auth Server listening on http://127.0.0.1:${PORT}`);
  console.log(`Discord OAuth configured: ${DISCORD_CLIENT_ID ? '✓' : '✗'}`);
  console.log(`IP reputation checking: ${IPQS_API_KEY ? '✓' : '✗'}`);
});
