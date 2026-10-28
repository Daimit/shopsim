import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { CheckoutWizard } from '../components/checkout/CheckoutWizard';
import { useAuthStore } from '../store/authStore';
import { Lock, User as UserIcon, Shield, ArrowRight, ShoppingCart } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { user, demoLogin, isLoading } = useAuthStore();

  useEffect(() => {
    document.title = 'Checkout - ShopSim';
  }, []);

  const breadcrumbs = [
    { label: 'Cart', href: '/cart' },
    { label: 'Checkout', href: '/checkout' },
  ];

  // If user is not authenticated, require login before checkout
  if (!user) {
    return (
      <div className="space-y-6 pb-20">
        <Breadcrumb items={breadcrumbs} />

        <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm text-center">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-2">
            Sign In Required to Buy
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
            You must be signed in with a Shopper or Administrator account before completing checkout and placing your order.
          </p>

          <div className="space-y-3 text-left">
            {/* 1-Click Shopper Login */}
            <button
              type="button"
              onClick={() => demoLogin('user')}
              disabled={isLoading}
              className="w-full p-4 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <span>1-Click Sign In as Shopper</span>
                    <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-blue-200 text-blue-800">
                      Jane Doe
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-700/80 mt-0.5">user@shopsim.test</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* 1-Click Admin Login */}
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

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              to="/cart"
              className="text-slate-500 hover:text-slate-700 font-semibold flex items-center gap-1"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Back to Cart</span>
            </Link>

            <Link
              to="/login?redirect=/checkout"
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>Full Sign In / Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <Breadcrumb items={breadcrumbs} />

      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete the guided steps below to verify your study scenario checkout flow.
        </p>
      </div>

      <CheckoutWizard />
    </div>
  );
};
