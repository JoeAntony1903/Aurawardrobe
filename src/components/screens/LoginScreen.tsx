import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ShieldAlert, 
  WifiOff, 
  ArrowRight, 
  Sparkles, 
  Shirt,
  Database,
  Cloud,
  UserPlus,
  LogIn,
  Eye,
  EyeOff
} from 'lucide-react';
import { useWardrobe } from '../../context/WardrobeContext';

export const LoginScreen: React.FC = () => {
  const { 
    loginWithEmail, 
    signupWithEmail,
    isOfflineWarningOpen, 
    openOfflineWarning, 
    confirmOfflineMode, 
    cancelOfflineWarning 
  } = useWardrobe();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    if (authMode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setLoading(true);
      const res = await signupWithEmail(email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Failed to create account.');
      }
    } else {
      setLoading(true);
      const res = await loginWithEmail(email, password);
      setLoading(false);
      if (!res.success) {
        setError(res.error || 'Invalid credentials or network error.');
      }
    }
  };

  const handleDemoFill = () => {
    setEmail('curator@aurawardrobe.studio');
    setPassword('atelier2026!');
    setConfirmPassword('atelier2026!');
    setError('');
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center p-4 z-10">
      <div className="w-full max-w-md bg-white/[0.07] backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 space-y-6">
        
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 border border-white/20 shadow-inner mb-1">
            <Shirt className="w-8 h-8 text-indigo-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            AuraWardrobe
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-300">
            <Cloud size={13} className="text-emerald-400" />
            <span className="font-mono text-[11px]">Cloud Database Linked & Offline Ready</span>
          </div>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
              authMode === 'signin'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn size={14} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
              authMode === 'signup'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus size={14} />
            <span>Sign Up (Cloud)</span>
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@aurawardrobe.studio"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400/50"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {authMode === 'signup' && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="block text-xs font-medium text-slate-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400/50"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-indigo-300 hover:text-indigo-200 underline decoration-indigo-400/40 text-[11px]"
            >
              Fill Sample Credentials
            </button>
            <span className="text-slate-400 font-mono text-[11px]">
              {authMode === 'signup' ? 'Creates Firestore Profile' : 'Cloud Syncs Vault'}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>{loading ? 'Connecting to Cloud...' : authMode === 'signup' ? 'Create Account & Cloud Database' : 'Sign In to Wardrobe'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-slate-900/80 px-3 text-[11px] font-mono tracking-widest uppercase text-slate-400 absolute backdrop-blur-md rounded-full border border-white/10">
            OR
          </span>
        </div>

        {/* Offline Mode Skip Button */}
        <div className="space-y-3 pt-1">
          <button
            type="button"
            onClick={openOfflineWarning}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-medium shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] group"
          >
            <WifiOff size={16} className="text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>Skip Login (Offline Mode)</span>
          </button>

          <p className="text-center text-[11px] text-slate-400 leading-relaxed">
            Privacy-first option. Data is stored solely on this browser device without cloud synchronization.
          </p>
        </div>
      </div>

      {/* Warning Modal */}
      {isOfflineWarningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="offline-modal-title"
            className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 shrink-0">
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h3 id="offline-modal-title" className="text-lg font-bold text-white">
                  Offline Mode Notice
                </h3>
                <p className="text-xs font-mono text-amber-300">
                  Local Isolation Active
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-slate-300 leading-relaxed space-y-2">
              <p className="font-medium text-white">
                You are entering Offline Mode.
              </p>
              <p className="text-xs text-slate-300">
                Data will only be saved locally and won't sync to the cloud/laptop.
              </p>
              <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400">
                <Database size={14} />
                <span>Simulated Offline Database Ready</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={cancelOfflineWarning}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                Back to Login
              </button>
              <button
                type="button"
                onClick={confirmOfflineMode}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
              >
                <span>Proceed in Offline Mode</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
