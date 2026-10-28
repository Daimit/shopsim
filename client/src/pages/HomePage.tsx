import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import { Product, Category } from '../types';
import { api } from '../lib/api';
import { tracker } from '../lib/tracker';
import {
  Laptop,
  Shirt,
  Home as HomeIcon,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle2
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    document.title = 'ShopSim - Next-Gen Tech & Premium Essentials';
    Promise.all([
      api.getProducts(),
      api.getCategories()
    ]).then(([prods, cats]) => {
      if (Array.isArray(prods)) setProducts(prods.slice(0, 8));
      if (Array.isArray(cats)) setCategories(cats);
    }).catch((err) => {
      console.warn('Error fetching homepage data:', err);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const copyPromo = async () => {
    try {
      await navigator.clipboard.writeText('SAVE20');
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1600);
    } catch {
      setCopiedCode(false);
    }
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      tracker.track('search_query', 'hero_search_input', { query: heroSearch.trim() });
      navigate(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'electronics':
        return <Laptop className="w-6 h-6 text-blue-600" />;
      case 'clothing':
        return <Shirt className="w-6 h-6 text-indigo-600" />;
      case 'home-kitchen':
        return <HomeIcon className="w-6 h-6 text-emerald-600" />;
      default:
        return <Sparkles className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-12 pb-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-6 text-white shadow-xl sm:p-12 lg:p-14">
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="pointer-events-none absolute top-0 left-1/3 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl"></div>

        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-12">
          <div className="max-w-2xl space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-100 backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              <span>Spring Mega Sale &bull; Up to 40% Off</span>
            </div>

            <h1 className="text-3xl leading-tight font-black tracking-tight sm:text-5xl">
              Next-Generation Tech & <span className="text-blue-200">Everyday Essentials</span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-blue-100 sm:text-base">
              Discover smartphones, laptops, headphones, and apparel with free express delivery and a price-match guarantee.
            </p>

            <form onSubmit={handleHeroSearch} className="flex max-w-lg gap-2 pt-1">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Try 'wireless headphones' or 'Galaxy S24'..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  className="w-full rounded-xl bg-white py-3 pr-4 pl-10 text-sm text-slate-900 shadow-md transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-blue-300 focus:outline-hidden"
                  data-track="hero_search_input"
                  aria-label="Search the catalog"
                />
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-blue-500 px-5 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-blue-400"
                data-track="hero_search_btn"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 text-xs text-blue-200">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Free Express Delivery over $50</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>30-Day Money-Back Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>2-Year Full Warranty</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:col-span-5 lg:block">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
              <p className="text-xs font-bold tracking-wider text-blue-200 uppercase">Study catalog</p>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-white/10 px-2 py-4">
                  <p className="text-2xl font-black">42</p>
                  <p className="mt-1 text-[11px] text-blue-200">Products</p>
                </div>
                <div className="rounded-xl bg-white/10 px-2 py-4">
                  <p className="text-2xl font-black">3</p>
                  <p className="mt-1 text-[11px] text-blue-200">Categories</p>
                </div>
                <div className="rounded-xl bg-white/10 px-2 py-4">
                  <p className="text-2xl font-black">5</p>
                  <p className="mt-1 text-[11px] text-blue-200">Study tasks</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-blue-100">
                Search, filter, compare, and check out — every click is recorded for usability research.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Categories Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Featured Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Explore curated catalogs across electronics, apparel, and home essentials.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
              data-track={`home_category_card_${cat.slug}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                  {getCategoryIcon(cat.slug)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-blue-600 text-base transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {cat._count?.products || 6} Products available
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Featured Products
            </h2>
          </div>
          <Link
            to="/category/electronics"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <ProductGrid
          products={products}
          isLoading={isLoading}
        />
      </section>

      <section className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 sm:flex-row sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">
              Special Shopper Discount
            </h3>
            <p className="mt-1 max-w-xl text-xs text-slate-600">
              Take 20% off your cart at checkout with coupon code{' '}
              <strong className="font-mono text-slate-900">SAVE20</strong>.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={copyPromo}
            className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 font-mono text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-50"
            data-track="home_copy_save20"
          >
            {copiedCode ? 'Copied!' : 'Copy SAVE20'}
          </button>
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs transition-colors hover:bg-slate-50"
          >
            <span>Compare Flagships</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
