import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-sm text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                S
              </div>
              <span>ShopSim</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An advanced E-Commerce Usability Simulator engineered to study customer interactions, conversion funnels, and cognitive workflows.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Shop Categories</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/category/electronics" className="hover:text-white transition-colors">Electronics</Link></li>
              <li><Link to="/category/clothing" className="hover:text-white transition-colors">Clothing & Apparel</Link></li>
              <li><Link to="/category/home-kitchen" className="hover:text-white transition-colors">Home & Kitchen</Link></li>
              <li><Link to="/compare" className="hover:text-white transition-colors">Product Comparison</Link></li>
            </ul>
          </div>

          {/* Study Tools */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Research & Admin</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link to="/checkout" className="hover:text-white transition-colors">Checkout Wizard</Link></li>
              <li className="flex items-center gap-1 text-slate-500">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Study Task Switcher in top banner</span>
              </li>
            </ul>
          </div>

          {/* Usability Info */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Telemetry Status</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Telemetry Active & Recording</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-tight">
                All navigation clicks, searches, filters, and checkout steps are automatically analyzed for research purposes.
              </p>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Simulated Mock Environment</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ShopSim Usability Simulator. All test data recorded for research.</p>
          <div className="flex gap-4">
            <span className="text-slate-600">React 18</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-600">TypeScript</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-600">Tailwind CSS</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-600">Zustand</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
