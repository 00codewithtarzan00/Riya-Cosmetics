import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck } from 'lucide-react';
import Navbar from '../Home/Navbar';
import { loginWithGoogle } from '../../firebase';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        setError("You are not authorized as an admin. Please use the registered admin email.");
      }
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
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
            Secure Management Access
          </p>

          {error && (
            <div className="mb-6 p-4 bg-pink-50 border border-brand-accent/20 text-brand-accent text-xs rounded-sm leading-relaxed">
              {error}
            </div>
          )}

          <div className="space-y-4 text-black">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border border-brand-accent/20 bg-white py-4 rounded-lg font-bold text-sm hover:bg-pink-50/50 transition-all active:scale-[0.98] shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              {loading ? 'Authenticating...' : 'Sign in with Google Admin Account'}
            </button>
          </div>

          <p className="mt-10 text-[10px] text-brand-muted leading-relaxed italic opacity-75">
            This area is restricted to authorized personnel only. 
            All access logs are recorded for Riya Cosmetics security.
          </p>
        </div>
      </div>
    </div>
  );
}
