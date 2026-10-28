import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { FilterPanel } from '../components/search/FilterPanel';
import { SortDropdown } from '../components/search/SortDropdown';
import { ProductGrid } from '../components/product/ProductGrid';
import { Category, Product } from '../types';
import { api } from '../lib/api';
import { useFilterStore } from '../store/filterStore';
import { Filter, X } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    subcategoryId,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    sortBy,
    setSubcategory,
    setPriceRange,
    setMinRating,
    setInStockOnly,
    clearFilters
  } = useFilterStore();

  useEffect(() => {
    // Reset filters when switching category
    clearFilters();
    api.getCategories().then((cats) => {
      if (Array.isArray(cats)) setAllCategories(cats);
    }).catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);

    api.getCategoryBySlug(slug).then((cat) => {
      setCategory(cat);
      if (cat) {
        document.title = `${cat.name} - ShopSim`;
      }
    }).catch(() => {});

    api.getProducts({
      categorySlug: slug,
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
  }, [slug, subcategoryId, minPrice, maxPrice, minRating, inStockOnly, sortBy]);

  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (subcategoryId) {
    const sub = (Array.isArray(allCategories) ? allCategories : [])
      .flatMap(c => c.children || [])
      .find(s => s.id === subcategoryId);
    if (sub) {
      activeChips.push({
        label: `Subcategory: ${sub.name}`,
        onRemove: () => setSubcategory(null)
      });
    }
  }
  if (minPrice !== null || maxPrice !== null) {
    activeChips.push({
      label: `Price: $${minPrice ?? 0} - $${maxPrice ?? '∞'}`,
      onRemove: () => setPriceRange(null, null)
    });
  }
  if (minRating !== null) {
    activeChips.push({
      label: `Rating: ≥ ${minRating}★`,
      onRemove: () => setMinRating(null)
    });
  }
  if (inStockOnly) {
    activeChips.push({
      label: 'In Stock Only',
      onRemove: () => setInStockOnly(false)
    });
  }

  const breadcrumbs = [
    { label: category?.name || 'Category', href: `/category/${slug}` }
  ];

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb items={breadcrumbs} />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-64">
          <button
            type="button"
            className="mb-3 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 lg:hidden"
            onClick={() => setFiltersOpen((open) => !open)}
            data-track="filters_toggle_mobile"
          >
            <span className="inline-flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              Filters
            </span>
            <span className="text-xs text-slate-500">{filtersOpen ? 'Hide' : 'Show'}</span>
          </button>
          <div className={filtersOpen ? 'block' : 'hidden lg:block'}>
            <FilterPanel
              categories={allCategories}
              currentCategory={category}
            />
          </div>
        </aside>

        {/* Right Content */}
        <div className="w-full flex-1 space-y-6">
          {/* Top Bar with title, count, chips, sort */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {category?.name || 'Category Products'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing <strong className="text-slate-800">{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
                </p>
              </div>

              <div className="shrink-0 self-end sm:self-auto">
                <SortDropdown />
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeChips.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Active:</span>
                {activeChips.map((chip, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full border border-blue-200"
                  >
                    <span>{chip.label}</span>
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      className="hover:text-blue-900 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-slate-500 hover:text-rose-600 hover:underline ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Product Grid */}
          <ProductGrid
            products={products}
            isLoading={isLoading}
            emptyTitle="No products match your criteria"
            emptyDescription="Try clearing or adjusting some filters in the left sidebar to expand your results."
          />
        </div>
      </div>
    </div>
  );
};
