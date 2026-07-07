import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { API_URL } from '../../../store';
import { LogIn, Mail, Lock, Hexagon } from 'lucide-react';
import { DBZLoader } from '../../../components/DBZLoader';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

      setIsSuccess(true);
      setAuth(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Google login failed');
      }

      setIsSuccess(true);
      setAuth(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return <DBZLoader />;
  }

  return (
    <div className="min-h-screen bg-bg-app text-text-main flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-bg-card p-8 rounded-2xl border border-border-subtle shadow-2xl backdrop-blur-sm min-h-[460px] flex flex-col justify-center relative overflow-hidden">
          <div className="flex justify-center mb-6">
            <Hexagon className="w-14 h-14 text-text-main" strokeWidth={1} />
          </div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome Back</h1>
            <p className="text-text-muted text-sm">Sign in to your WORKBENCH workspace</p>
          </div>

              {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleManualLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-text-muted uppercase tracking-wider font-semibold ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-bg-app border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-text-muted uppercase tracking-wider font-semibold ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-bg-app border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-accent transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-accent text-white font-semibold rounded-xl py-2.5 text-sm hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
                >
                  {isLoading ? 'Signing in...' : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-4">
                <div className="h-px bg-border-subtle flex-1"></div>
                <span className="text-xs text-text-muted uppercase tracking-wider">or continue with</span>
                <div className="h-px bg-border-subtle flex-1"></div>
              </div>

              <div className="mt-6 flex justify-center">
                {isLoading ? (
                  <div className="h-10 w-full rounded-md bg-bg-app animate-pulse"></div>
                ) : (
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => { setError('Google login failed'); setIsLoading(false); }}
                    theme="outline"
                    shape="rectangular"
                    size="large"
                    text="signin_with"
                  />
                )}
              </div>

              <p className="mt-8 text-center text-sm text-text-muted">
                Don't have an account?{' '}
                <Link to="/register" className="text-accent hover:underline">
                  Sign up
                </Link>
              </p>
        </div>
      </motion.div>
    </div>
  );
};
