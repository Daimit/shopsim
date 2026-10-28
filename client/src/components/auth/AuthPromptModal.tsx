import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  Lock,
  User as UserIcon,
  Shield,
  ArrowRight,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const AuthPromptModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAuthModalOpen,
    authModalReason,
    closeAuthModal,
    demoLogin,
    isLoading,
    error
  } = useAuthStore();

  const [localLoading, setLocalLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleQuickLogin = async (role: 'user' | 'admin') => {
    setLocalLoading(true);
    await demoLogin(role);
    setLocalLoading(false);
  };

  const handleGoToLogin = () => {
    closeAuthModal();
    navigate('/login');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs duration-150 animate-in fade-in"
      role="presentation"
      onClick={closeAuthModal}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-prompt-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl duration-150 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Close authentication prompt"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h3 id="auth-prompt-title" className="text-xl font-black tracking-tight text-slate-900">
            Sign In Required
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            {authModalReason || 'You must be signed in with an account to add items to your cart or proceed to checkout.'}
          </p>
        </div>

        {/* Error notification if any */}
        {error && (
          <div className="mx-6 mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick 1-Click Role Login Options */}
        <div className="px-6 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>1-Click Study Login (Instant Access)</span>
          </div>

          {/* Quick Shopper */}
          <button
            type="button"
            onClick={() => handleQuickLogin('user')}
            disabled={localLoading || isLoading}
            className="w-full text-left p-3.5 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <span>Sign In as Shopper</span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-200/80 text-blue-800">
                    Jane Doe
                  </span>
                </div>
                <p className="text-[11px] text-blue-700/80 mt-0.5">user@shopsim.test</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          {/* Quick Admin */}
          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            disabled={localLoading || isLoading}
            className="w-full text-left p-3.5 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200 transition-all flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <span>Sign In as Administrator</span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-purple-200/80 text-purple-800">
                    Dr. Sarah Chen
                  </span>
                </div>
                <p className="text-[11px] text-purple-700/80 mt-0.5">admin@shopsim.test</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>

        {/* Modal Footer / Navigation to full page */}
        <div className="p-6 pt-5 mt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={closeAuthModal}
            className="text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleGoToLogin}
            className="font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Or Enter Credentials / Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
