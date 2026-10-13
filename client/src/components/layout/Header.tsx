import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Scale,
  Search,
  ChevronDown,
  Activity,
  Layers
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useCompareStore } from '../../store/compareStore';
import { api } from '../../lib/api';
import { Category } from '../../types';
import { tracker } from '../../lib/tracker';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCartStore();
  const compareItems = useCompareStore((state) => state.items);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCart();
    api.getCategories().then((res) => {
      if (Array.isArray(res)) setCategories(res);
    }).catch(() => {});
  }, [fetchCart]);

  // Close categories dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCatOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      tracker.track('search_query', 'search_form', { query });
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-2xl font-black text-blue-600 hover:text-blue-700 tracking-tight transition-colors"
              data-track="nav_logo"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-blue-500/30">
                S
              </div>
              <span>ShopSim</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                data-track="nav_home"
              >
                Home
              </Link>

              {/* Categories Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsCatOpen(!isCatOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                  data-track="nav_categories_toggle"
                  aria-expanded={isCatOpen}
                >
                  <Layers className="w-4 h-4 text-slate-500" />
                  <span>Categories</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCatOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Browse All Categories
                    </div>
                    {(Array.isArray(categories) ? categories : []).map((cat) => (
                      <div key={cat.id} className="py-1">
                        <Link
                          to={`/category/${cat.slug}`}
                          onClick={() => setIsCatOpen(false)}
                          className="block px-4 py-1.5 text-sm font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          data-track={`nav_cat_${cat.slug}`}
                        >
                          {cat.name}
                        </Link>
                        {cat.children && cat.children.length > 0 && (
                          <div className="pl-6 space-y-0.5">
                            {cat.children.map((sub) => (
                              <Link
                                key={sub.id}
                                to={`/category/${sub.slug}`}
                                onClick={() => setIsCatOpen(false)}
                                className="block px-3 py-1 text-xs text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded transition-colors"
                                data-track={`nav_subcat_${sub.slug}`}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Compare Page Link */}
              <Link
                to="/compare"
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                data-track="nav_compare"
              >
                <Scale className="w-4 h-4 text-slate-500" />
                <span>Compare</span>
                {compareItems.length > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                    {compareItems.length}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* Search Bar in center */}
          <div className="flex-1 max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-50 focus:bg-white text-sm text-slate-800 rounded-full border border-slate-200 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                data-track="search_input"
              />
              <button
                type="submit"
                className="absolute left-3 top-2.5 text-slate-400 hover:text-blue-600 transition-colors"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right Action Icons: Admin, Cart */}
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200 transition-colors"
              title="Admin Usability Dashboard"
              data-track="nav_admin_dashboard"
            >
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <span>Admin</span>
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-blue-600 transition-colors flex items-center justify-center"
              aria-label="View shopping cart"
              data-track="nav_cart_button"
            >
              <ShoppingCart className="w-5 h-5" />
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in-75">
                  {cart.itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
