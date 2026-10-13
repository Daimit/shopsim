import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import { useFilterStore } from '../../store/filterStore';
import { RatingStars } from '../product/RatingStars';
import { ChevronDown, ChevronUp, RotateCcw, Filter } from 'lucide-react';

interface FilterPanelProps {
  categories?: Category[];
  currentCategory?: Category | null;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  categories = [],
  currentCategory,
  className = ''
}) => {
  const {
    subcategoryId,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    setSubcategory,
    setPriceRange,
    setMinRating,
    setInStockOnly,
    clearFilters,
    activeFilterCount
  } = useFilterStore();

  // Collapsible section toggles
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    rating: true,
    availability: true
  });

  // Local price inputs for form submit
  const [localMin, setLocalMin] = useState(minPrice !== null ? minPrice.toString() : '');
  const [localMax, setLocalMax] = useState(maxPrice !== null ? maxPrice.toString() : '');

  useEffect(() => {
    setLocalMin(minPrice !== null ? minPrice.toString() : '');
    setLocalMax(maxPrice !== null ? maxPrice.toString() : '');
  }, [minPrice, maxPrice]);

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const min = localMin ? parseFloat(localMin) : null;
    const max = localMax ? parseFloat(localMax) : null;
    setPriceRange(min, max);
  };

  const handleRatingClick = (r: number) => {
    if (minRating === r) {
      setMinRating(null); // toggle off
    } else {
      setMinRating(r);
    }
  };

  const subcategoriesToDisplay = currentCategory?.children || categories.flatMap(c => c.children || []);
  const activeCount = activeFilterCount();

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs divide-y divide-slate-100 ${className}`}>
      {/* Header */}
      <div className="pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-800 text-sm">Filters</h3>
          {activeCount > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.2 rounded-full">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium hover:underline"
            data-track="filter_clear_all_button"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Subcategories */}
      {subcategoriesToDisplay.length > 0 && (
        <div className="py-4">
          <button
            type="button"
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            <span>Subcategories</span>
            {openSections.categories ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {openSections.categories && (
            <div className="space-y-1 pt-1">
              <button
                type="button"
                onClick={() => setSubcategory(null)}
                className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${
                  subcategoryId === null
                    ? 'bg-blue-50 font-bold text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Subcategories
              </button>
              {subcategoriesToDisplay.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSubcategory(subcategoryId === sub.id ? null : sub.id)}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded flex items-center justify-between transition-colors ${
                    subcategoryId === sub.id
                      ? 'bg-blue-50 font-bold text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  data-track={`filter_subcat_${sub.slug}`}
                >
                  <span>{sub.name}</span>
                  {sub._count?.products !== undefined && (
                    <span className="text-[11px] text-slate-400">({sub._count.products})</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div className="py-4">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
        >
          <span>Price Range</span>
          {openSections.price ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.price && (
          <form onSubmit={handlePriceApply} className="pt-1 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-2 text-xs text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Min"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  className="w-full pl-6 pr-2 py-1.5 text-xs border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                  data-track="filter_price_min_input"
                />
              </div>
              <span className="text-slate-400 text-xs">-</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-2 text-xs text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Max"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  className="w-full pl-6 pr-2 py-1.5 text-xs border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                  data-track="filter_price_max_input"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded transition-colors"
              data-track="filter_price_apply_btn"
            >
              Apply Price
            </button>
          </form>
        )}
      </div>

      {/* Customer Rating */}
      <div className="py-4">
        <button
          type="button"
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
        >
          <span>Minimum Rating</span>
          {openSections.rating ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.rating && (
          <div className="pt-1 space-y-1">
            {[4, 3, 2].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRatingClick(r)}
                className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between text-xs transition-colors ${
                  minRating === r
                    ? 'bg-blue-50 font-bold text-blue-700 border border-blue-200'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
                data-track={`filter_rating_${r}_stars`}
              >
                <div className="flex items-center gap-1.5">
                  <RatingStars rating={r} showNumber={false} size="sm" />
                  <span>& Up</span>
                </div>
                {minRating === r && <span className="text-blue-600 font-bold">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="py-4">
        <button
          type="button"
          onClick={() => toggleSection('availability')}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
        >
          <span>Availability</span>
          {openSections.availability ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>

        {openSections.availability && (
          <div className="pt-1">
            <label
              className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none hover:text-blue-600 transition-colors"
              data-track="filter_in_stock_checkbox"
            >
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-slate-300"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        )}
      </div>

      {/* Clear All button */}
      <div className="pt-4">
        <button
          type="button"
          onClick={clearFilters}
          className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
          data-track="filter_clear_all_bottom"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};
