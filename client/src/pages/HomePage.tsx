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

  useEffect(() => {
    document.title = 'ShopSim - E-Commerce Usability Simulator';
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
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 text-white p-8 sm:p-14 shadow-xl">
        {/* Background decorative shapes */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -top-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/30 text-xs font-semibold text-blue-100 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Usability Study Environment v1.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Welcome to <span className="text-blue-200">ShopSim</span>
          </h1>

          <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-xl">
            Experience our simulated e-commerce laboratory designed to analyze navigation friction, multi-step checkout ease, and comparative decision making.
          </p>

          {/* Hero Quick Search */}
          <form onSubmit={handleHeroSearch} className="flex gap-2 max-w-md pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Try 'wireless headphones' or 'Galaxy S24'..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm shadow-md focus:outline-hidden focus:ring-2 focus:ring-blue-300 transition-all placeholder:text-slate-400"
                data-track="hero_search_input"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold rounded-xl shadow-md transition-colors shrink-0"
              data-track="hero_search_btn"
            >
              Search
            </button>
          </form>

          {/* Quick study highlights */}
          <div className="pt-4 flex flex-wrap gap-4 text-xs text-blue-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full interaction logging</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Side-by-side comparison matrix</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Multi-step checkout wizard</span>
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
              className="group p-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all duration-300 flex items-center justify-between"
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

      {/* Study Scenario Hint Box */}
      <section className="bg-slate-100/70 border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Participating in the Usability Study?
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Follow instructions provided in the dark banner above. Use promo code <strong>SAVE20</strong> at checkout to test discount validations.
            </p>
          </div>
        </div>

        <Link
          to="/compare"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 shadow-2xs transition-colors shrink-0"
        >
          <span>Open Comparison Matrix</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>
    </div>
  );
};
