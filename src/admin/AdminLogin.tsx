import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router';
import { useStore } from '../store';
import { Button } from '../components/ui';
import logo from '../assets/raw-stitches-logo.png';

export default function AdminLogin() {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  if (state.adminAuthed) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 800));
    if (email === 'admin@rawstitches.ng' && password === 'admin123') {
      dispatch({ type: 'ADMIN_LOGIN' });
      navigate('/admin/dashboard');
    } else {
      setError('Invalid email or password. Use admin@rawstitches.ng / admin123 to demo.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Image panel */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&h=1600&fit=crop&auto=format&q=80"
          alt="Raw Stitches"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
        <div className="absolute bottom-16 left-12">
          <p className="font-serif text-3xl text-ivory italic leading-tight max-w-xs">
            "Fashion is not just clothing. It is identity."
          </p>
          <div className="w-12 h-0.5 bg-gold mt-4" />
        </div>
      </div>

      {/* Login panel */}
      <div className="w-full lg:w-[440px] flex flex-col items-center justify-center px-8 py-12 bg-ivory">
        <div className="w-full max-w-sm">
          <div className="mb-10 text-center">
            <img src={logo} alt="Raw Stitches" className="h-12 mx-auto mb-4" />
            <p className="text-xs text-stone uppercase tracking-widest font-sans">Admin Panel</p>
          </div>

          {showForgot ? (
            <div>
              <h2 className="font-serif text-2xl text-charcoal mb-2">Reset Password</h2>
              <p className="text-stone text-sm font-sans mb-6">Enter your email and we'll send reset instructions.</p>
              <label className="flex flex-col gap-1.5 mb-4">
                <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">Email</span>
                <input type="email" className="px-4 py-3 border border-border focus:border-gold focus:outline-none text-sm font-sans" placeholder="admin@rawstitches.ng" />
              </label>
              <Button className="w-full mb-3">Send Reset Link</Button>
              <button onClick={() => setShowForgot(false)} className="text-xs text-stone hover:text-charcoal font-sans underline">Back to login</button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <h2 className="font-serif text-2xl text-charcoal mb-1">Sign In</h2>
                <p className="text-stone text-sm font-sans">Access your Raw Stitches admin panel.</p>
              </div>

              {error && (
                <div className="bg-error/10 border border-error/30 px-4 py-3 text-sm text-error font-sans">
                  {error}
                </div>
              )}

              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">Email Address</span>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@rawstitches.ng"
                  className="px-4 py-3 border border-border focus:border-gold focus:outline-none text-sm font-sans"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs uppercase tracking-widest font-medium text-charcoal font-sans">Password</span>
                <input
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="px-4 py-3 border border-border focus:border-gold focus:outline-none text-sm font-sans"
                />
              </label>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-gold" />
                  <span className="text-xs text-stone font-sans">Remember me</span>
                </label>
                <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-stone hover:text-gold transition-colors font-sans">Forgot password?</button>
              </div>

              <Button type="submit" size="lg" loading={loading} className="w-full">
                Sign In
              </Button>

              <div className="pt-2 border-t border-border text-center">
                <p className="text-xs text-stone font-sans">Demo credentials: admin@rawstitches.ng / admin123</p>
              </div>
            </form>
          )}

          <div className="mt-10 pt-6 border-t border-border text-center">
            <p className="text-[10px] text-stone/50 font-sans">
              🔒 This is a private admin panel. Unauthorised access is prohibited.
            </p>
            <Link to="/" className="text-[10px] text-stone/40 hover:text-gold transition-colors font-sans mt-2 inline-block">
              ← Return to store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
