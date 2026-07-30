import { useEffect, useState } from 'react';
import { LogIn, Loader } from 'lucide-react';

export default function Login({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDiscordLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:4001/api/auth/login');
      const data = await response.json();

      if (data.devMode && data.token) {
        // Dev mode: Direct login
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify({
          id: 'dev-user-123',
          username: 'TestUser',
          avatar: null
        }));
        onSuccess(data.token);
      } else if (data.authUrl) {
        // Production: Redirect to Discord
        window.location.href = data.authUrl;
      } else {
        setError(data.message || 'Login failed');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to start login process');
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      handleCallback(code, state);
    }
  }, []);

  const handleCallback = async (code: string, state: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:4001/api/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onSuccess(data.token);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Failed to complete authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-purple-500/30 flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(124,58,237,0.10) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-md w-full mx-6">
        <div className="text-center mb-12">
          <div className="relative mb-6 flex justify-center">
            <div className="absolute inset-0 rounded-full flex justify-center items-center" style={{ boxShadow: '0 0 80px 30px rgba(124,58,237,0.18)' }} />
            <img
              src="/3d2ce9ea-84e6-4fca-8f2c-59feb56d1143_(2).png"
              alt="StatusHub"
              className="relative w-24 h-24 rounded-full"
            />
          </div>
          <h1 className="text-4xl font-black mb-2">StatusHub</h1>
          <p className="text-white/40">Secure Dashboard Access</p>
        </div>

        <div className="bg-gradient-to-b from-purple-950/20 to-[#0a0a0c] border border-purple-500/20 rounded-2xl p-8">
          <div className="mb-6">
            <h2 className="text-xl font-black mb-2">Login Required</h2>
            <p className="text-sm text-white/50">Verify with Discord to access the dashboard and prevent unauthorized access.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300">
              {error}
            </div>
          )}

          <button
            onClick={handleDiscordLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-sm font-black text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg,#6d28d9,#a855f7)' }}
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Login with Discord
              </>
            )}
          </button>

          <div className="mt-8 space-y-3 text-xs text-white/40">
            <div className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span>VPN/Proxy detection enabled</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/30">
          <p>We only access your Discord username and email</p>
          <p className="mt-2">Your data is never sold or shared</p>
        </div>
      </div>
    </div>
  );
}
