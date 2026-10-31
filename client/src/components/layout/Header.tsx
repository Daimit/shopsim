import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Scale,
  Search,
  ChevronDown,
  Activity,
  Layers,
  LogIn,
  LogOut,
  Shield,
  User as UserIcon,
  Package,
  ArrowRight,
  ArrowUpRight,
  X,
  Menu,
  Heart
} from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useCompareStore } from '../../store/compareStore';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';
import { Category, Product } from '../../types';
import { tracker } from '../../lib/tracker';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCartStore();
  const compareItems = useCompareStore((state) => state.items);
  const { user, logout, demoLogin } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCart();
    api.getCategories().then((res) => {
      if (Array.isArray(res)) setCategories(res);
    }).catch(() => {});

    api.getProducts().then((res) => {
      if (Array.isArray(res)) setAllProducts(res);
    }).catch(() => {});
  }, [fetchCart]);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCatOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
        setIsCatOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      setIsSearchFocused(false);
      tracker.track('search_query', 'search_form', { query });
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleSelectAutocompleteProduct = (prod: Product) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    tracker.track('search_autocomplete_select', `product_${prod.id}`, {
      productId: prod.id,
      slug: prod.slug,
      name: prod.name,
      query: searchQuery.trim(),
    });
    navigate(`/product/${prod.slug}`);
  };

  // Autocomplete filtered products
  const filteredProducts = searchQuery.trim()
    ? allProducts
        .filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 4)
    : allProducts.slice(0, 3);

  // User initials
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'JD';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* Left: Brand Logo & Main Nav */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                S
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">ShopSim</span>
            </Link>

            {/* Desktop Navigation Links */}
            {isMobileNavOpen && (
              <div className="absolute top-full left-0 w-full bg-white border-t border-slate-200 shadow-lg md:hidden">
                <nav className="flex flex-col p-4 space-y-2">
                  <Link to="/" className="text-slate-700 hover:text-blue-600" onClick={() => setIsMobileNavOpen(false)}>Home</Link>
                  <Link to="/compare" className="text-slate-700 hover:text-blue-600" onClick={() => setIsMobileNavOpen(false)}>Compare</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="text-purple-700 hover:text-purple-600" onClick={() => setIsMobileNavOpen(false)}>Admin Dashboard</Link>
                  )}
                  {user ? (
                    <button onClick={() => { logout(); setIsMobileNavOpen(false); }} className="text-rose-600 hover:text-rose-800 text-left">Sign Out</button>
                  ) : (
                    <Link to="/login" className="text-blue-600 hover:text-blue-800" onClick={() => setIsMobileNavOpen(false)}>Sign In</Link>
                  )}
                </nav>
              </div>
            )}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-700">
              {/* Categories Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsCatOpen(!isCatOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
                >
                  <span>Categories</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCatOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCatOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Shop Categories
                    </div>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/category/${cat.slug}`}
                        onClick={() => setIsCatOpen(false)}
                        className="block px-3.5 py-2 text-xs font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Compare Link with counter badge */}
              <Link
                to="/compare"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:text-blue-600 hover:bg-slate-50 transition-colors"
              >
                <Scale className="w-4 h-4 text-slate-400" />
                <span>Compare</span>
                {compareItems.length > 0 && (
                  <span className="ml-0.5 inline-flex items-center justify-center px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-blue-100 text-blue-700">
                    {compareItems.length}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* Center: Search Bar with Figma-Matched Autocomplete Popover */}
          <div className="flex-1 max-w-lg mx-2 relative" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="headphones"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 bg-slate-50/90 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-800 rounded-xl border border-slate-200/80 focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Figma-Style Autocomplete Floating Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 py-3 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                {/* Suggested Searches Header */}
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Suggested Searches</span>
                  <span className="normal-case font-normal text-slate-400">ESC to close</span>
                </div>

                <div className="py-2 px-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('wireless headphones');
                      setIsSearchFocused(false);
                      navigate('/search?q=wireless+headphones');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <span>{searchQuery.trim() ? searchQuery : 'Wireless headphones'}</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>

                {/* Top Matches Header */}
                <div className="px-4 py-1.5 bg-slate-50/60 border-y border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Top Matches
                </div>

                {/* Product Match Items */}
                <div className="divide-y divide-slate-50 p-2">
                  {filteredProducts.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleSelectAutocompleteProduct(prod)}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50/60 flex items-center justify-between gap-3 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                        />
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 truncate transition-colors">
                            {prod.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {prod.specs ? Object.values(JSON.parse(prod.specs || '{}'))[0] as string || 'Premium flagship' : 'Wireless noise canceling'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-black text-slate-900">
                          ${prod.price.toFixed(2)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Bottom View All Results Button */}
                <div className="pt-2 px-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 bg-blue-50/70 hover:bg-blue-100/70 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View all {allProducts.length} results</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: User Avatar + Dark Pill Cart Button (Matching Figma) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Admin Dashboard shortcut icon for researchers */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-colors"
                title="Admin Dashboard"
              >
                <Activity className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin</span>
              </Link>
            )}

            {/* User Profile Avatar Circle (Figma: JD avatar) */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs border border-blue-200 hover:ring-2 hover:ring-blue-200 transition-all cursor-pointer"
                aria-label="User account menu"
              >
                {initials}
              </button>

              {/* User dropdown menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Jane Doe'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || 'user@shopsim.test'}</p>
                  </div>

                  <div className="py-1 text-xs">
                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-slate-50 text-slate-700"
                    >
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Orders & Tracking</span>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-purple-50 text-purple-700"
                      >
                        <Activity className="w-3.5 h-3.5 text-purple-600" />
                        <span>Usability Dashboard</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    {user ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/account/saved"
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              aria-label="View saved items"
              data-track="header_saved_items"
            >
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Saved</span>
            </Link>

            {/* Figma-Style Dark Pill Cart Button */}
            <Link
              to="/cart"
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-4 py-2 flex items-center gap-2 text-xs font-semibold shadow-xs transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>Cart</span>
              <span className="w-4 h-4 rounded-full bg-white text-slate-900 font-black text-[10px] flex items-center justify-center shrink-0">
                {cart.itemCount}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
