import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NeuralCanvas from '@/components/NeuralCanvas';

type AuthMode = 'signin' | 'signup' | 'magic';

const Auth = () => {
  const { user, signInWithMagicLink, signInWithPassword, signUpWithPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    const userEmail = user.email?.toLowerCase();
    const adminEmails = ['admin@openminds.ai', 'victoria@inspire-live.com'];
    if (userEmail && adminEmails.includes(userEmail)) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/choose-path" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');

    if (mode === 'magic') {
      const { error } = await signInWithMagicLink(email.trim());
      if (error) setError(error.message);
      else setSent(true);
    } else if (mode === 'signup') {
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      const { error } = await signUpWithPassword(email.trim(), password);
      if (error) setError(error.message);
      else setSent(true);
    } else {
      if (!password) { setLoading(false); return; }
      const { error } = await signInWithPassword(email.trim(), password);
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setPassword('');
  };

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
      <NeuralCanvas />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="card-surface rounded-2xl p-8 md:p-10">
          {/* Wordmark */}
          <div className="mb-8">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              OpenMinds AI
            </h1>
            <p className="text-sm text-muted-foreground mt-1">The Living Network</p>
          </div>

          {!sent ? (
            <>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
                {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Magic Link'}
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                {mode === 'signin'
                  ? 'Welcome back. Sign in to continue.'
                  : mode === 'signup'
                  ? 'Create your account to get started.'
                  : 'Enter your email to receive a magic link.'}
              </p>

              {/* Mode toggle */}
              <div className="flex gap-1 p-1 bg-muted/30 rounded-lg mb-5">
                <button
                  onClick={() => switchMode('signin')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'signin' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Sign in
                </button>
                <button
                  onClick={() => switchMode('signup')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'signup' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Sign up
                </button>
                <button
                  onClick={() => switchMode('magic')}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${mode === 'magic' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Magic Link
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
                  />
                </div>

                {/* Password (signin & signup only) */}
                {mode !== 'magic' && (
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Create a password (min 6 chars)' : 'Password'}
                      required
                      className="w-full bg-background border border-border rounded-lg pl-10 pr-10 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-body text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {error && (
                  <p className="text-destructive text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 glow-violet disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === 'magic' ? 'Send Magic Link' : mode === 'signup' ? 'Create account' : 'Sign in'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-muted-foreground text-xs mt-6 text-center">
                Selective by merit. Borderless by design.
              </p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-heading text-xl font-semibold text-foreground mb-2">
                Check your inbox
              </h2>
              <p className="text-muted-foreground text-sm">
                We sent {mode === 'signup' ? 'a confirmation email' : 'a magic link'} to <span className="text-foreground font-medium">{email}</span>.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); setPassword(''); }}
                className="text-primary text-sm mt-4 hover:underline"
              >
                Use a different email
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
