import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Navbar from '../Home/Navbar';

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

    // Simulate small delay for editorial feel
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('adm_auth_session', 'true');
        onLoginSuccess();
        navigate('/admin');
      } else {
        setError('Incorrect authorization key. Please try again.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <Navbar onSearch={() => {}} />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white editorial-card p-10 text-center animate-fade-in shadow-xl relative z-10">
          <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-brand-accent" />
          </div>
          
          <div className="logo font-display font-bold text-3xl text-brand-accent tracking-tighter mb-2">
            Admin Portal
          </div>
          <p className="text-xs uppercase tracking-widest text-brand-muted font-bold mb-8">
            Management Authorization
          </p>

          {error && (
            <div className="mb-6 p-4 bg-pink-50 border border-brand-accent/20 text-brand-accent text-xs rounded-sm leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-brand-muted" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Manager Password"
                className="editorial-input pl-12 pr-12 py-4 bg-pink-50/30 border-brand-accent/10 focus:bg-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-brand-muted hover:text-brand-accent transition-colors" /> : <Eye className="h-4 w-4 text-brand-muted hover:text-brand-accent transition-colors" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full editorial-btn-primary py-4 transition-all active:scale-[0.98] shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>

          <p className="mt-10 text-[10px] text-brand-muted leading-relaxed italic opacity-75">
            Restricted System. Authorization required for Riya Cosmetics.
          </p>
        </div>
      </div>
    </div>
  );
}
