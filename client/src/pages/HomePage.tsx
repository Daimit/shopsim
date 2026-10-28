import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductGrid } from '../components/product/ProductGrid';
import { Product, Category } from '../types';
import { api } from '../lib/api';
import { tracker } from '../lib/tracker';
import {
  Headphones,
  Shirt,
  Lamp,
  Search,
  ArrowRight,
  ArrowUpRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'bestsellers'>('trending');

  useEffect(() => {
    document.title = 'ShopSim - Better things. Everyday living.';
    Promise.all([
      api.getProducts(),
      api.getCategories()
    ]).then(([prods, cats]) => {
      if (Array.isArray(prods)) setProducts(prods);
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

  // Filter products by active tab
  const getDisplayedProducts = () => {
    if (!products.length) return [];
    if (activeTab === 'new') {
      return [...products].sort((a, b) => b.id - a.id).slice(0, 8);
    }
    if (activeTab === 'bestsellers') {
      return [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);
    }
    // 'trending'
    return products.slice(0, 8);
  };

  return (
    <div className="space-y-14 pb-20">
      {/* 1. Hero Section (Pixel-matched with Figma Design) */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0B0F19] text-white p-6 sm:p-10 lg:p-12 shadow-2xl border border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Text & Search CTA */}
          <div className="lg:col-span-7 space-y-6 z-10">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>The Everyday, Upgraded</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
              Next-Generation <br />
              Tech & Everyday <br />
              Essentials
            </h1>

            {/* Subtitle */}
            <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed">
              Thoughtfully chosen. Exceptionally made. Discover your next favorite, all in one place.
            </p>

            {/* Figma-Style White Pill Search Input */}
            <form
              onSubmit={handleHeroSearch}
              className="bg-white rounded-full p-1.5 flex items-center shadow-xl max-w-md border border-white/20"
            >
              <Search className="w-4 h-4 text-slate-400 ml-3.5 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="What are you looking for?"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden pr-2"
                data-track="hero_search_input"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6 py-2.5 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                data-track="hero_search_btn"
              >
                Explore
              </button>
            </form>

            {/* 3 Trust Guarantees */}
            <div className="pt-2 flex flex-wrap gap-5 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-slate-300" />
                <span>Free Shipping &gt; $50</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-slate-300" />
                <span>30-Day Guarantee</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                <span>2-Year Warranty</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Media with Glass Overlay Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/11 bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 border border-slate-800 shadow-xl group">
              <img
                src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80"
                alt="Headphones & Flagship audio"
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

              {/* Figma-Style Floating Glass Pill Badge */}
              <Link
                to="/category/headphones"
                className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-md text-white border border-white/10 rounded-2xl p-3 sm:p-4 max-w-xs shadow-xl flex items-center justify-between gap-4 group/badge hover:border-white/20 transition-all"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Sound, Without Limits.
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
                    Meet your new headspace.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 group-hover/badge:bg-blue-600 flex items-center justify-center shrink-0 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bento Categories Section ("A little upgrade. A big difference.") */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            A little upgrade. A big difference.
          </h2>
          <Link
            to="/category/electronics"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 group"
          >
            <span>Explore all categories</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 3 Split Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1: Electronics */}
          <Link
            to="/category/electronics"
            className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 rounded-2xl overflow-hidden flex items-stretch justify-between group transition-all shadow-2xs hover:shadow-md"
          >
            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center mb-4">
                  <Headphones className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                  Electronics
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">248 items</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all mt-4">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="w-40 sm:w-44 bg-slate-200 shrink-0 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80"
                alt="Electronics desk"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>

          {/* Bento Card 2: Clothing */}
          <Link
            to="/category/clothing"
            className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 rounded-2xl overflow-hidden flex items-stretch justify-between group transition-all shadow-2xs hover:shadow-md"
          >
            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center mb-4">
                  <Shirt className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                  Clothing
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">186 items</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all mt-4">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="w-40 sm:w-44 bg-slate-200 shrink-0 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80"
                alt="Clothing apparel"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>

          {/* Bento Card 3: Home Essentials */}
          <Link
            to="/category/home-kitchen"
            className="bg-slate-50 hover:bg-slate-100/70 border border-slate-200/90 rounded-2xl overflow-hidden flex items-stretch justify-between group transition-all shadow-2xs hover:shadow-md"
          >
            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center mb-4">
                  <Lamp className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
                  Home Essentials
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">124 items</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all mt-4">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="w-40 sm:w-44 bg-slate-200 shrink-0 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80"
                alt="Home ambient lamp"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
        </div>
      </section>

      {/* 3. Products Section ("Good finds. Great everyday.") */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Good finds. Great everyday.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              The most-loved picks, for a reason.
            </p>
          </div>

          {/* Filter Tabs matching Figma design */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'trending'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Trending now
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              New arrivals
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bestsellers')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'bestsellers'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Best sellers
            </button>
          </div>
        </div>

        {/* 4-Column Product Grid */}
        <ProductGrid
          products={getDisplayedProducts()}
          isLoading={isLoading}
        />

        {/* Bottom CTA Button */}
        <div className="pt-6 text-center">
          <Link
            to="/category/electronics"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-900 text-xs font-bold border border-slate-300 shadow-2xs hover:shadow-xs transition-all"
          >
            <span>Discover all products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
