import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ShieldAlert, ArrowLeft, Shield, ArrowRight } from 'lucide-react';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user, demoLogin, isLoading } = useAuthStore();

  // Only allow access if user is logged in AND has role 'admin'
  if (user?.role === 'admin') {
    return <>{children}</>;
  }

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 mb-3 uppercase tracking-wider">
        <span>403 Access Denied</span>
      </div>

      <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
        Admin Privileges Required
      </h1>

      <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
        {user ? (
          <>
            You are currently signed in as a Shopper (<strong>{user.name}</strong>). The Usability Research Dashboard and Telemetry Analytics are restricted to Administrator accounts.
          </>
        ) : (
          <>
            You are currently not signed in. The Usability Research Dashboard is strictly restricted to authorized Administrator / Researcher accounts.
          </>
        )}
      </p>

      {/* Action to switch/login as Admin */}
      <div className="space-y-3 mb-6 text-left">
        <button
          type="button"
          onClick={() => demoLogin('admin')}
          disabled={isLoading}
          className="w-full p-4 rounded-xl bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                <span>Sign In as Administrator</span>
                <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-purple-200 text-purple-800">
                  Dr. Sarah Chen
                </span>
              </div>
              <p className="text-[11px] text-purple-700/80 mt-0.5">admin@shopsim.test</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
        <Link
          to="/"
          className="text-slate-500 hover:text-slate-700 font-semibold flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Store</span>
        </Link>

        <Link
          to="/login?role=admin&redirect=/admin"
          className="font-bold text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-1"
        >
          <span>Admin Login Page</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
