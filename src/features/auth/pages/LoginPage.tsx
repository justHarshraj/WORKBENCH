import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { API_URL } from '../../../store';
import { LogIn, Mail, Lock } from 'lucide-react';
import logoImg from '../../../assets/logo.png';
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

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
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
    },
    onError: () => {
      setError('Google login failed');
      setIsLoading(false);
    }
  });

  if (isSuccess) {
    return <DBZLoader />;
  }

  return (
    <div className="min-h-screen bg-bg-app text-text-main flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Dragon Background framing the login card */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-15"
        style={{
          backgroundImage: `url('/dragon-wide.png')`,
          backgroundPosition: 'center',
          backgroundSize: 'max(1600px, 130vw)',
          backgroundRepeat: 'no-repeat',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 75%)',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 75%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-bg-card p-8 rounded-2xl border border-border-subtle shadow-2xl backdrop-blur-md min-h-[460px] flex flex-col justify-center relative overflow-hidden">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-text-main scale-[1.35] flex-shrink-0" style={{ WebkitMaskImage: `url(${logoImg})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskImage: `url(${logoImg})`, maskSize: 'contain', maskRepeat: 'no-repeat', maskPosition: 'center' }} />
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
                  <button
                    type="button"
                    onClick={() => loginWithGoogle()}
                    className="w-full bg-bg-app border border-border-subtle text-text-main font-semibold rounded-xl py-2.5 text-sm hover:bg-bg-hover transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Sign in with Google
                  </button>
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
