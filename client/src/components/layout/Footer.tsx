import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-white border-t border-slate-200/80 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
          {/* Logo & Subtitle */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                S
              </div>
              <span className="text-lg font-black text-slate-900 tracking-tight">ShopSim</span>
            </Link>
            <p className="text-slate-400 text-xs">Better things. Everyday living.</p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-600">
            <Link to="/about" className="hover:text-blue-600 transition-colors">About ShopSim</Link>
            <Link to="/shipping" className="hover:text-blue-600 transition-colors">Shipping & returns</Link>
            <Link to="/orders" className="hover:text-blue-600 transition-colors">Help center</Link>
            <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact us</Link>
          </nav>

          {/* Secure checkout badge */}
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50/80 px-3 py-1.5 rounded-full border border-emerald-100 font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Safe & secure checkout</span>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            &copy; 2026 ShopSim. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Link to="/privacy" className="hover:text-slate-600 transition-colors">Privacy policy</Link>
            <Link to="/terms" className="hover:text-slate-600 transition-colors">Terms of service</Link>
            <span className="flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              United States &middot; USD $
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
