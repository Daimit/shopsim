import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
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
  Menu,
  X
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
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCart();
    api.getCategories().then((res) => {
      if (Array.isArray(res)) setCategories(res);
    }).catch(() => {});

    api.getProducts().then((res) => {
      if (Array.isArray(res)) setAllProducts(res);
    }).catch(() => {});
  }, [fetchCart]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCatOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
      const inDesktopSearch = searchContainerRef.current?.contains(e.target as Node);
      const inMobileSearch = mobileSearchRef.current?.contains(e.target as Node);
      if (!inDesktopSearch && !inMobileSearch) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  // Filter products for autocomplete
  const filteredProducts = searchQuery.trim().length >= 2
    ? allProducts
        .filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const searchForm = (
    <form onSubmit={handleSearchSubmit} className="relative">
      <input
        type="search"
        placeholder="Search headphones, Galaxy S24, laptops..."
        value={searchQuery}
        onFocus={() => setIsSearchFocused(true)}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-full border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-4 text-sm text-slate-800 transition-all placeholder:text-slate-400 hover:bg-slate-50 focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100"
        data-track="search_input"
        aria-label="Search products"
      />
      <button
        type="submit"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-blue-600"
        aria-label="Search"
      >
        <Search className="h-4 w-4" />
      </button>
    </form>
  );

  const autocomplete = isSearchFocused && searchQuery.trim().length >= 2 && (
    <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200/90 bg-white py-2 shadow-2xl duration-150 animate-in fade-in zoom-in-95">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
        <span>Product Suggestions</span>
        <span>{filteredProducts.length} results</span>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="divide-y divide-slate-50">
          {filteredProducts.map((prod) => (
            <button
              key={prod.id}
              type="button"
              onClick={() => handleSelectAutocompleteProduct(prod)}
              className="group flex w-full cursor-pointer items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-blue-50/70"
            >
              <img
                src={prod.image}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800 transition-colors group-hover:text-blue-600 sm:text-sm">
                  {prod.name}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  {prod.category?.name && <span>{prod.category.name}</span>}
                  <span>&bull;</span>
                  <span className="font-bold text-slate-700">${prod.price.toFixed(2)}</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600" />
            </button>
          ))}

          <button
            type="button"
            onClick={handleSearchSubmit}
            className="block w-full border-t border-slate-100 bg-slate-50 py-2.5 text-center text-xs font-bold text-blue-600 transition-colors hover:bg-slate-100"
          >
            Press Enter to view all results for "{searchQuery}" &rarr;
          </button>
        </div>
      ) : (
        <div className="px-4 py-6 text-center text-xs text-slate-500">
          No products found matching "<strong className="text-slate-800">{searchQuery}</strong>".
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 shadow-xs backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3 md:gap-6">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 md:hidden"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open menu"
              data-track="nav_mobile_menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-black tracking-tight text-blue-600 transition-colors hover:text-blue-700 md:text-2xl"
              data-track="nav_logo"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm shadow-blue-500/30">
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

          <div className="relative mx-2 hidden max-w-xl flex-1 md:block" ref={searchContainerRef}>
            {searchForm}
            {autocomplete}
          </div>

          {/* Right Action Icons: Admin Shortcut, Auth Profile / Login Button, Cart */}
          <div className="flex items-center gap-2.5">
            {/* Admin Usability Dashboard Shortcut - Strictly ONLY for Admin accounts */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 transition-colors shadow-2xs"
                title="Admin Usability Dashboard"
                data-track="nav_admin_dashboard"
              >
                <Activity className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {/* Auth Component: Sign In Button or User/Admin Pill */}
            {!user ? (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer"
                data-track="nav_signin_button"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span>Sign In</span>
              </Link>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    user.role === 'admin'
                      ? 'bg-purple-50/80 border-purple-200 text-purple-800 hover:bg-purple-100/80'
                      : 'bg-slate-100/80 border-slate-200 text-slate-800 hover:bg-slate-200/70'
                  }`}
                  data-track="nav_user_menu_toggle"
                  aria-expanded={isUserMenuOpen}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${
                        user.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                      }`}
                    >
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] uppercase font-extrabold bg-purple-600 text-white px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                  <ChevronDown
                    className={`w-3 h-3 text-slate-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-800 truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                      <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider bg-slate-100 text-slate-700">
                        {user.role === 'admin' ? (
                          <>
                            <Shield className="w-3 h-3 text-purple-600" />
                            <span className="text-purple-700">Administrator</span>
                          </>
                        ) : (
                          <>
                            <UserIcon className="w-3 h-3 text-blue-600" />
                            <span className="text-blue-700">Shopper</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      {/* My Orders link for all users */}
                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        data-track="nav_menu_orders"
                      >
                        <Package className="w-3.5 h-3.5 text-blue-600" />
                        <span>My Orders & Tracking</span>
                      </Link>

                      {user.role === 'admin' ? (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                          data-track="nav_menu_admin_dashboard"
                        >
                          <Activity className="w-3.5 h-3.5 text-purple-600" />
                          <span>Usability Dashboard</span>
                        </Link>
                      ) : (
                        <Link
                          to="/cart"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          data-track="nav_menu_cart"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                          <span>My Shopping Cart</span>
                        </Link>
                      )}

                      {/* Only Admin can switch to Shopper simulation view */}
                      {user.role === 'admin' && (
                        <button
                          type="button"
                          onClick={async () => {
                            setIsUserMenuOpen(false);
                            await demoLogin('user');
                            navigate('/');
                          }}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                          data-track="nav_menu_switch_role"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-blue-500" />
                          <span>Switch to Shopper View</span>
                        </button>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        data-track="nav_menu_logout"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

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

        <div className="relative pb-3 md:hidden" ref={mobileSearchRef}>
          {searchForm}
          {autocomplete}
        </div>
      </div>

      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            aria-label="Close menu"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <nav className="absolute top-0 left-0 flex h-full w-72 max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <span className="text-sm font-bold text-slate-900">Browse ShopSim</span>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-3">
              <Link
                to="/"
                onClick={() => setIsMobileNavOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                data-track="nav_home"
              >
                Home
              </Link>
              <Link
                to="/compare"
                onClick={() => setIsMobileNavOpen(false)}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                data-track="nav_compare"
              >
                <span className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-slate-500" />
                  Compare
                </span>
                {compareItems.length > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                    {compareItems.length}
                  </span>
                )}
              </Link>
              <div className="mt-3 px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Categories
              </div>
              {(Array.isArray(categories) ? categories : []).map((cat) => (
                <div key={cat.id} className="mt-1">
                  <Link
                    to={`/category/${cat.slug}`}
                    onClick={() => setIsMobileNavOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-blue-50 hover:text-blue-700"
                    data-track={`nav_cat_${cat.slug}`}
                  >
                    {cat.name}
                  </Link>
                  {cat.children?.map((sub) => (
                    <Link
                      key={sub.id}
                      to={`/category/${sub.slug}`}
                      onClick={() => setIsMobileNavOpen(false)}
                      className="block rounded-lg py-1.5 pr-3 pl-6 text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                      data-track={`nav_subcat_${sub.slug}`}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
