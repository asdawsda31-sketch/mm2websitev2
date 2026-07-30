import { useState, useEffect, useRef } from 'react';
import Dashboard from '@/Dashboard';
import Login from '@/Login';

/* ── Live counter hooks ── */
function useLiveHits(initial: number) {
  const [hits, setHits] = useState(initial);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    function schedule() {
      // 2-5 hits per minute → one hit every 12–30 seconds
      const delay = (12 + Math.random() * 18) * 1000;
      return setTimeout(() => {
        setHits(h => h + 1);
        setFlash(true);
        setTimeout(() => setFlash(false), 400);
        schedule();
      }, delay);
    }
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  return { hits, flash };
}

function useLiveUsers(initial: number) {
  const [users, setUsers] = useState(initial);

  useEffect(() => {
    function schedule() {
      const delay = (45 + Math.random() * 75) * 1000;
      return setTimeout(() => {
        setUsers(u => u + 1);
        schedule();
      }, delay);
    }
    const t = schedule();
    return () => clearTimeout(t);
  }, []);

  return users;
}

/* ── Odometer digit ── */
function Digit({ value }: { value: string }) {
  const [display, setDisplay] = useState(value);
  const [animating, setAnimating] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (value !== prev.current) {
      setAnimating(true);
      const t = setTimeout(() => {
        setDisplay(value);
        prev.current = value;
        setAnimating(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span
      className="inline-block tabular-nums transition-transform duration-200"
      style={{ transform: animating ? 'translateY(-30%) scaleY(0.6)' : 'translateY(0) scaleY(1)', opacity: animating ? 0 : 1 }}
    >
      {display}
    </span>
  );
}

function AnimatedNumber({ value }: { value: number }) {
  const str = value.toLocaleString();
  return (
    <span className="inline-flex">
      {str.split('').map((ch, i) => (
        ch === ',' ? <span key={i}>,</span> : <Digit key={`${i}-${ch}`} value={ch} />
      ))}
    </span>
  );
}

/* ── Marquee ticker ── */
function Ticker({ hits }: { hits: number }) {
  const items = ['MM2 Fastest Stealer', `${hits.toLocaleString()} Total Hits`, 'Undualhook Protected', 'Proxied Webhooks', 'The Future of MM2', '1 Supported Game', '99% Uptime'];
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-white/[0.06] py-3 select-none">
      <div className="flex gap-12 animate-[ticker_22s_linear_infinite] w-max">
        {row.map((item, i) => (
          <span key={i} className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/25 whitespace-nowrap flex items-center gap-4">
            {item}
            <span className="w-1 h-1 rounded-full bg-purple-500/50 inline-block" />
          </span>
        ))}
      </div>
    </div>
  );
}

const DISCORD = 'https://discord.gg/AChPVVKxV4';

/* ── Main ── */
export default function App() {
  const { hits, flash } = useLiveHits(7485);
  const users = useLiveUsers(45);
  const [scrolled, setScrolled] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('authToken');
  });
  const [showDashboard, setShowDashboard] = useState(() => {
    return !!localStorage.getItem('authToken');
  });

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLoginSuccess = (token: string) => {
    setAuthToken(token);
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthToken(null);
    setShowDashboard(false);
  };

  if (!authToken) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  if (showDashboard) return <Dashboard onExit={() => setShowDashboard(false)} onLogout={handleLogout} />;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-purple-500/30">

      {/* ── Navbar ── */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#050505]/85 backdrop-blur-xl border-b border-white/[0.05]' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/3d2ce9ea-84e6-4fca-8f2c-59feb56d1143_(2).png" alt="SH" className="w-8 h-8 rounded-full" />
            <span className="text-xs font-black tracking-[0.15em] uppercase">Status<span className="text-purple-400">Hub</span></span>
          </div>
          <div className="flex items-center gap-8 text-[11px] font-semibold tracking-widest uppercase">
            <a href="#stats" className="text-white/30 hover:text-white transition-colors hidden md:block">Stats</a>
            <a href="#why" className="text-white/30 hover:text-white transition-colors hidden md:block">Why</a>
            <button
              onClick={() => setShowDashboard(true)}
              className="px-4 py-2 text-xs font-black rounded-lg border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 transition-colors tracking-widest uppercase"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen pt-14 px-6 overflow-hidden">

        {/* Background noise texture via CSS */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(124,58,237,0.10) 0%, transparent 70%)' }}
        />

        {/* Horizontal rule lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[15, 35, 55, 75, 90].map(pct => (
            <div key={pct} className="absolute inset-x-0 h-px bg-white/[0.025]" style={{ top: `${pct}%` }} />
          ))}
          {[10, 30, 50, 70, 90].map(pct => (
            <div key={pct} className="absolute inset-y-0 w-px bg-white/[0.02]" style={{ left: `${pct}%` }} />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center text-center">

          {/* Logo + live badge */}
          <div className="relative mb-10">
            <div className="absolute inset-0 rounded-full" style={{ boxShadow: '0 0 80px 30px rgba(124,58,237,0.18)' }} />
            <img
              src="/3d2ce9ea-84e6-4fca-8f2c-59feb56d1143_(2).png"
              alt="StatusHub"
              className="relative w-24 h-24 md:w-32 md:h-32 rounded-full"
            />
            <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-black border border-white/10 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] font-bold tracking-widest uppercase text-white/50">Live</span>
            </div>
          </div>

          {/* Main headline — editorial split */}
          <div className="w-full mb-4">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-purple-500/80 mb-5">The future of MM2</p>
            <h1 className="font-black leading-none tracking-tight">
              <span className="block text-[clamp(3.5rem,12vw,9rem)] text-white">THE #1</span>
              <span
                className="block text-[clamp(3rem,10vw,7.5rem)]"
                style={{ background: 'linear-gradient(100deg,#c4b5fd,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                MM2 STEALER
              </span>
            </h1>
          </div>

          {/* Live hits pill */}
          <div
            className={`inline-flex items-center gap-3 border rounded-full px-5 py-2.5 mb-10 transition-all duration-300 ${flash ? 'border-purple-400/60 bg-purple-500/10' : 'border-white/10 bg-white/[0.03]'}`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-white/50">
              <span className={`text-white transition-colors ${flash ? 'text-purple-300' : ''}`}>
                <AnimatedNumber value={hits} />
              </span>
              {' '}total hits and counting
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href={DISCORD}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-black text-white transition-all duration-200 hover:scale-[1.02] active:scale-95"
              style={{ background: 'linear-gradient(135deg,#6d28d9,#a855f7)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Join Discord
            </a>
            <button
              onClick={() => setShowDashboard(true)}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-black text-white/70 border border-white/10 bg-transparent hover:bg-white/[0.05] hover:text-white transition-all duration-200 active:scale-95"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <Ticker hits={hits} />

      {/* ── Stats ── */}
      <section id="stats" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">

          <div className="mb-12">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-purple-500/70">Numbers</p>
            <h2 className="text-4xl font-black mt-1">Live stats</h2>
          </div>

          {/* Stats as modern cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Hits card */}
            <div className="group relative bg-gradient-to-b from-purple-950/30 to-[#0a0a0c] border border-purple-500/20 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-purple-500/40 hover:bg-purple-950/40">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-purple-500/30" />
              <div className="relative">
                <p className="text-[10px] font-bold tracking-widest uppercase text-purple-400/60 mb-3">Total Hits</p>
                <p className="text-xs text-white/40 mb-4">All-time executions</p>
                <div className={`text-4xl lg:text-5xl font-black tabular-nums transition-colors duration-300 ${flash ? 'text-purple-300' : 'text-white'}`}>
                  <AnimatedNumber value={hits} />
                </div>
              </div>
            </div>

            {/* Users card */}
            <div className="group relative bg-gradient-to-b from-blue-950/30 to-[#0a0a0c] border border-blue-500/20 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-blue-500/40 hover:bg-blue-950/40">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-blue-500/30" />
              <div className="relative">
                <p className="text-[10px] font-bold tracking-widest uppercase text-blue-400/60 mb-3">Registered Users</p>
                <p className="text-xs text-white/40 mb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Growing live
                </p>
                <div className="text-4xl lg:text-5xl font-black tabular-nums text-white mt-2">
                  <AnimatedNumber value={users} />
                </div>
              </div>
            </div>

            {/* Games card */}
            <div className="group relative bg-gradient-to-b from-emerald-950/30 to-[#0a0a0c] border border-emerald-500/20 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-950/40">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-emerald-500/30" />
              <div className="relative">
                <p className="text-[10px] font-bold tracking-widest uppercase text-emerald-400/60 mb-3">Games Supported</p>
                <p className="text-xs text-white/40 mb-4">Murder Mystery 2</p>
                <div className="text-4xl lg:text-5xl font-black tabular-nums text-white">1</div>
              </div>
            </div>

            {/* Uptime card */}
            <div className="group relative bg-gradient-to-b from-green-950/30 to-[#0a0a0c] border border-green-500/20 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-green-500/40 hover:bg-green-950/40">
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-green-500/30" />
              <div className="relative">
                <p className="text-[10px] font-bold tracking-widest uppercase text-green-400/60 mb-3">Uptime</p>
                <p className="text-xs text-white/40 mb-4">Service availability</p>
                <div className="text-4xl lg:text-5xl font-black tabular-nums text-white">99%</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Why ── */}
      <section id="why" className="py-20 px-6 border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto">

          <div className="mb-16">
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-purple-500/70">Why us</p>
            <h2 className="text-4xl font-black mt-1">Built different</h2>
          </div>

          <div className="flex flex-col gap-0">
            {[
              {
                n: '01',
                title: 'Undualhook Protected',
                desc: 'Your items go straight to you. No middlemen, no loss, no drama.',
              },
              {
                n: '02',
                title: 'Faster Than Everything Else',
                desc: 'First hit, every time. No cap. Outpaces every other stealer running right now.',
              },
              {
                n: '03',
                title: 'Proxied Webhooks',
                desc: "Your webhook link never touches the script. We proxy everything — it stays private.",
              },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-8 md:gap-16 py-10 border-b border-white/[0.05] group">
                <span className="shrink-0 text-[10px] font-black tracking-widest text-white/10 pt-1.5">{n}</span>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-black text-white mb-2 group-hover:text-purple-200 transition-colors duration-300">{title}</h3>
                  <p className="text-sm text-white/35 leading-relaxed max-w-lg">{desc}</p>
                </div>
                <div className="hidden md:flex shrink-0 items-start pt-1">
                  <div className="w-2 h-2 rounded-full border border-white/10 group-hover:border-purple-400/60 group-hover:bg-purple-500/20 transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <img src="/3d2ce9ea-84e6-4fca-8f2c-59feb56d1143_(2).png" alt="SH" className="w-16 h-16 rounded-full mb-6 opacity-80" />
          <h2 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-6">
            <span className="text-white/10 [-webkit-text-stroke:1px_rgba(255,255,255,0.12)]">START</span>
            <br />
            <span style={{ background: 'linear-gradient(120deg,#c4b5fd,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>STEALING</span>
          </h2>
          <p className="text-white/30 text-sm mb-8 max-w-xs">One game. Zero competition. Join the only MM2 stealer worth using.</p>
          <a
            href={DISCORD}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-black text-white transition-all duration-200 hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg,#6d28d9,#a855f7)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
            </svg>
            Join the Discord
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.05] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-white/20">
          <span className="font-black tracking-widest uppercase">Status<span className="text-purple-400/60">Hub</span></span>
          <span>The future of MM2 &copy; {new Date().getFullYear()}</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
