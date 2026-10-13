import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { FilterPanel } from '../components/search/FilterPanel';
import { SortDropdown } from '../components/search/SortDropdown';
import { ProductGrid } from '../components/product/ProductGrid';
import { Product, Category } from '../types';
import { api } from '../lib/api';
import { useFilterStore } from '../store/filterStore';
import { Search } from 'lucide-react';

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    subcategoryId,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    sortBy,
    clearFilters
  } = useFilterStore();

  useEffect(() => {
    document.title = query ? `Search: "${query}" - ShopSim` : 'Search Products - ShopSim';
    api.getCategories().then((cats) => {
      if (Array.isArray(cats)) setCategories(cats);
    }).catch(() => {});
  }, [query]);

  useEffect(() => {
    setIsLoading(true);
    api.getProducts({
      search: query,
      subcategoryId: subcategoryId || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      minRating: minRating || undefined,
      inStockOnly,
      sortBy
    }).then((data) => {
      setProducts(Array.isArray(data) ? data : []);
    }).catch(() => {
      setProducts([]);
    }).finally(() => {
      setIsLoading(false);
    });
  }, [query, subcategoryId, minPrice, maxPrice, minRating, inStockOnly, sortBy]);

  const breadcrumbs = [
    { label: 'Search Results', href: `/search?q=${encodeURIComponent(query)}` }
  ];

  return (
    <div className="space-y-6 pb-16">
      <Breadcrumb items={breadcrumbs} />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Filter Panel on left */}
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24">
          <FilterPanel categories={categories} />
        </aside>

        {/* Results on right */}
        <main className="flex-1 w-full space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                <span>Search Catalog</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {query ? (
                  <>
                    Results for <span className="text-blue-600 font-extrabold">&quot;{query}&quot;</span>
                  </>
                ) : (
                  'All Products'
                )}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Found <strong className="text-slate-800">{products.length}</strong> matching {products.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            <div className="shrink-0 self-end sm:self-auto">
              <SortDropdown />
            </div>
          </div>

          <ProductGrid
            products={products}
            isLoading={isLoading}
            emptyTitle={`No products found for "${query}"`}
            emptyDescription="Check your spelling or try searching for keywords like 'wireless', 'laptop', 'iPhone', or 'cotton'."
          />
        </main>
      </div>
    </div>
  );
};
