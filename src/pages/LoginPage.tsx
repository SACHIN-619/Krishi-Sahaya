import { useState } from 'react';
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoginPageProps {
  onLogin: (user: { name: string; phone: string; email: string }) => void;
}

// Supabase config from env
const SUPA_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

async function supabaseAuth(email: string, password: string, mode: 'login' | 'signup', name?: string) {
  if (!SUPA_URL || !SUPA_KEY) return null;
  const endpoint = mode === 'signup'
    ? `${SUPA_URL}/auth/v1/signup`
    : `${SUPA_URL}/auth/v1/token?grant_type=password`;
  const body: Record<string, string> = { email, password };
  if (mode === 'signup' && name) body.data = JSON.stringify({ full_name: name });
  try {
    const r = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPA_KEY },
      body: JSON.stringify(mode === 'signup' ? { email, password, data: { full_name: name } } : { email, password }),
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Email and password required'); return; }
    if (mode === 'signup' && form.password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      // Try Supabase if configured
      if (SUPA_URL && SUPA_KEY) {
        const result = await supabaseAuth(form.email, form.password, mode, form.name);
        if (result && (result.access_token || result.user)) {
          const user = result.user || result;
          localStorage.setItem('krishi_user', JSON.stringify({
            name: user.user_metadata?.full_name || form.name || form.email.split('@')[0],
            email: form.email,
            phone: form.phone,
            token: result.access_token,
          }));
          onLogin({
            name: user.user_metadata?.full_name || form.name || form.email.split('@')[0],
            email: form.email,
            phone: form.phone,
          });
          return;
        }
        // Supabase returned error
        setError(mode === 'login' ? 'Invalid email or password' : 'Could not create account. Try again.');
      } else {
        // No Supabase configured — local auth (demo mode)
        await new Promise(r => setTimeout(r, 800));
        const user = { name: form.name || form.email.split('@')[0], email: form.email, phone: form.phone };
        localStorage.setItem('krishi_user', JSON.stringify(user));
        onLogin(user);
      }
    } catch {
      setError('Connection error. Check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    const guest = { name: 'Guest Farmer', email: 'guest@krishisahay.in', phone: '' };
    localStorage.setItem('krishi_user', JSON.stringify(guest));
    onLogin(guest);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-neon">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold neon-text">KrishiSahay</h1>
          <p className="text-muted-foreground text-sm mt-1">AI Agricultural Intelligence Platform</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 rounded-2xl">
          {/* Tab toggle */}
          <div className="flex rounded-xl bg-accent/50 p-1 mb-6">
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={cn(
                  'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                  mode === m
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name — signup only */}
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Ramesh Kumar"
                  className="w-full px-4 py-2.5 rounded-xl bg-accent/50 border border-border focus:border-primary/50 focus:outline-none text-sm text-foreground placeholder:text-muted-foreground transition-colors"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="farmer@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-accent/50 border border-border focus:border-primary/50 focus:outline-none text-sm text-foreground placeholder:text-muted-foreground transition-colors"
                />
              </div>
            </div>

            {/* Phone — signup only */}
            {mode === 'signup' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone (for WhatsApp alerts)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-accent/50 border border-border focus:border-primary/50 focus:outline-none text-sm text-foreground placeholder:text-muted-foreground transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                  required
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-accent/50 border border-border focus:border-primary/50 focus:outline-none text-sm text-foreground placeholder:text-muted-foreground transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-neon"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Leaf className="w-4 h-4" />}
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Guest access */}
            <button
              type="button"
              onClick={handleGuest}
              className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            >
              Continue as Guest
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            {mode === 'signup'
              ? 'Phone number used only for WhatsApp price alerts'
              : 'Access real-time mandi prices, AI disease detection & more'}
          </p>
        </div>

        {/* Bottom tag */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Empowering 140M+ Indian farmers with AI • Free to use
        </p>
      </div>
    </div>
  );
}
