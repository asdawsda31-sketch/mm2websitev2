import { useState } from 'react';
import { LogIn, Loader, CheckCircle, Copy } from 'lucide-react';

export default function Login({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState<'input' | 'verify'>('input');
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);

  const generateCode = () => {
    const words = ['Phoenix', 'Shadow', 'Nexus', 'Cipher', 'Vortex', 'Prism', 'Eclipse', 'Apex'];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    return `StatusHub---${randomWord}`;
  };

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Enter your Roblox username');
      return;
    }
    setVerificationCode(generateCode());
    setStage('verify');
    setError('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    setLoading(true);
    setError('');

    try {
      const apiBase = window.location.origin === 'http://localhost:5173'
        ? 'http://127.0.0.1:4000'
        : window.location.origin;

      const response = await fetch(`${apiBase}/api/auth/verify-roblox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, verificationCode }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onSuccess(data.token);
      } else {
        setError(data.message || 'Verification code not found in bio. Make sure to add it and try again!');
      }
    } catch (err) {
      setError('Verification failed. Try again!');
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
          <p className="text-white/40">Secure Roblox Verification</p>
        </div>

        <div className="bg-gradient-to-b from-purple-950/20 to-[#0a0a0c] border border-purple-500/20 rounded-2xl p-8">
          {stage === 'input' ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-black mb-2">Enter Roblox Username</h2>
                <p className="text-sm text-white/50">We'll verify your account ownership</p>
              </div>

              <form onSubmit={handleStartVerification} className="space-y-4">
                {error && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300">
                    {error}
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/20 text-white placeholder-white/30 focus:border-purple-500/50 focus:outline-none transition"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-sm font-black text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg,#6d28d9,#a855f7)' }}
                >
                  {loading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      Continue
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-black mb-2">Add Code to Bio</h2>
                <p className="text-sm text-white/50">Paste this in your Roblox bio, then click Verify</p>
              </div>

              {error && (
                <div className="mb-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-sm text-rose-300">
                  {error}
                </div>
              )}

              <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-3">
                <div className="flex items-center gap-2 justify-between">
                  <code className="text-purple-300 font-mono text-sm">{verificationCode}</code>
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-purple-500/20 rounded-lg transition"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                {copied && <p className="text-xs text-green-400">✓ Copied!</p>}
              </div>

              <div className="space-y-3 mb-6">
                <a
                  href="https://www.roblox.com/account"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-3 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-center text-sm font-semibold hover:bg-blue-600/30 transition"
                >
                  Go to Roblox Settings →
                </a>
              </div>

              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-sm font-black text-white transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg,#10b981,#34d399)' }}
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Verify Account
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setStage('input');
                  setError('');
                }}
                className="w-full mt-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-semibold hover:bg-white/10 transition"
              >
                Back
              </button>
            </>
          )}

          <div className="mt-8 space-y-3 text-xs text-white/40">
            <div className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span>Secure Roblox account verification</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span>No API key or login required</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/30">
          <p>Your privacy is protected</p>
          <p className="mt-2">We only check your Roblox bio</p>
        </div>
      </div>
    </div>
  );
}
