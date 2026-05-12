import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import Navbar from '../Home/Navbar';
import { loginWithGoogle } from '../../firebase';

interface LoginProps {
  onLoginSuccess: () => void;
}

const ADMIN_PASSWORD = 'adm_raj%7979';

export default function Login({ onLoginSuccess }: LoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adm_auth_session', 'true');
        onLoginSuccess();
        navigate('/admin');
      } else {
        setError('Incorrect password. Please try again.');
        setLoading(false);
      }
    }, 500);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      // Rules will handle the actual permission check on write
      // But we can check if it's the expected email for a better UI flow
      if (user?.email === "tarzanmaurya1234@gmail.com") {
        localStorage.setItem('adm_auth_session', 'true');
        onLoginSuccess();
        navigate('/admin');
      } else {
        setError("You are not authorized as an admin.");
      }
    } catch (err) {
      setError("Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Navbar onSearch={() => {}} />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white editorial-card p-10 text-center animate-fade-in shadow-xl relative z-10">
          <div className="logo font-display font-bold text-3xl text-brand-accent tracking-tighter mb-2">
            Admin Login
          </div>
          <p className="text-xs uppercase tracking-widest text-brand-muted font-bold mb-8">
            Riya Cosmetics
          </p>

          {error && (
            <div className="mb-6 p-3 bg-pink-50 border border-brand-accent/20 text-brand-accent text-xs rounded-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 text-black">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-brand-border py-3 rounded-sm font-semibold text-sm hover:bg-pink-50/50 transition-all active:scale-[0.98]"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              {loading ? 'Connecting...' : 'Sign in with Google'}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-brand-muted font-bold tracking-widest">or password</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-brand-muted" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  className="editorial-input pl-10 pr-10 py-3"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-brand-muted" /> : <Eye className="h-4 w-4 text-brand-muted" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full editorial-btn-primary py-3 transition-transform active:scale-95"
              >
                {loading ? 'Verifying...' : 'Access via Password'}
              </button>
            </form>
          </div>

          <p className="mt-8 text-[10px] text-brand-muted leading-relaxed italic">
            Restricted Area. Admin authorization required for Riya Cosmetics Management.
          </p>
        </div>
      </div>
    </div>
  );
}
