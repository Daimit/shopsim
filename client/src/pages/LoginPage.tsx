import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { tracker } from '../lib/tracker';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '';
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'user';

  const {
    user,
    isLoading,
    error,
    login,
    demoLogin,
    register,
    clearError,
    demoUsers
  } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin'>(initialRole);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      if (redirectUrl) {
        navigate(redirectUrl);
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate, redirectUrl]);

  // Sync role switch with preset form values for convenience
  useEffect(() => {
    clearError();
    setValidationError(null);
    if (selectedRole === 'admin') {
      setEmail('admin@shopsim.test');
      setPassword('admin123');
    } else {
      setEmail('user@shopsim.test');
      setPassword('user123');
    }
  }, [selectedRole, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    clearError();

    if (!email.trim() || !password.trim()) {
      setValidationError('Please enter both email and password');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setValidationError('Please enter your full name');
        return;
      }
      const success = await register(name, email, password, selectedRole);
      if (success) {
        navigate(redirectUrl || (selectedRole === 'admin' ? '/admin' : '/'));
      }
    } else {
      const success = await login(email, password);
      if (success) {
        navigate(redirectUrl || (selectedRole === 'admin' ? '/admin' : '/'));
      }
    }
  };

  const handleQuickDemo = async (role: 'user' | 'admin') => {
    clearError();
    setValidationError(null);
    setSelectedRole(role);
    const success = await demoLogin(role);
    if (success) {
      navigate(redirectUrl || (role === 'admin' ? '/admin' : '/'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-2xl shadow-lg shadow-blue-500/30 mb-4">
          S
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {mode === 'signin' ? 'Sign in to ShopSim' : 'Create a ShopSim Account'}
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
          Usability testing simulator portal. Log in as a <span className="font-semibold text-blue-600">Shopper</span> to run test scenarios or as an <span className="font-semibold text-purple-600">Administrator</span> to inspect UX telemetry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Quick 1-Click Role Logins */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold">1-Click Evaluation Logins</h2>
          </div>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            Instantly switch personas to evaluate multi-step purchasing workflows from both user and researcher perspectives.
          </p>

          <div className="space-y-3.5">
            {/* Quick Shopper Login */}
            <button
              type="button"
              onClick={() => handleQuickDemo('user')}
              disabled={isLoading}
              className="w-full text-left p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 hover:border-blue-400/50 transition-all flex items-start gap-3.5 group cursor-pointer"
              data-track="quick_login_user"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
                    Participant Shopper
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Shopper
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">Jane Doe (user@shopsim.test)</p>
                <div className="mt-2 text-[11px] text-blue-400 font-medium flex items-center gap-1 group-hover:underline">
                  Sign in as Participant <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </button>

            {/* Quick Admin Login */}
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={isLoading}
              className="w-full text-left p-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 hover:border-purple-400/50 transition-all flex items-start gap-3.5 group cursor-pointer"
              data-track="quick_login_admin"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                    Research Administrator
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    Admin
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">Dr. Sarah Chen (admin@shopsim.test)</p>
                <div className="mt-2 text-[11px] text-purple-400 font-medium flex items-center gap-1 group-hover:underline">
                  Sign in as Admin <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 flex items-start gap-2.5 text-xs text-slate-300">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Both personas interact with the same SQLite backend and record metrics into the usability telemetry stream.
            </span>
          </div>
        </div>

        {/* Right Column: Standard Auth Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          {/* Tab Selector: Shopper vs Admin Role */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('user');
                tracker.track('login_role_tab_click', 'role_selector', { role: 'user' });
              }}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedRole === 'user'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Shopper (User)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                tracker.track('login_role_tab_click', 'role_selector', { role: 'admin' });
              }}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-white text-purple-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Administrator</span>
            </button>
          </div>

          {/* Error Banner */}
          {(error || validationError) && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1">
                <span className="font-semibold">Authentication Error: </span>
                {validationError || error}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'admin' ? 'admin@shopsim.test' : 'user@shopsim.test'}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                {mode === 'signin' && (
                  <span className="text-xs text-slate-400">
                    (Preset: {selectedRole === 'admin' ? 'admin123' : 'user123'})
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signin' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember my login</span>
                </label>
                <span className="text-slate-400 italic">Usability Simulation Mode</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRole === 'admin'
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/25'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25'
                }`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'signin'
                        ? `Sign In as ${selectedRole === 'admin' ? 'Administrator' : 'Shopper'}`
                        : `Create ${selectedRole === 'admin' ? 'Admin' : 'Shopper'} Account`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Toggle between Sign In and Register */}
          <div className="mt-6 pt-5 border-t border-slate-200 text-center text-xs text-slate-600">
            {mode === 'signin' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    clearError();
                  }}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    clearError();
                  }}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
