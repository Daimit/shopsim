import { create } from 'zustand';
import { tracker } from '../lib/tracker';

export interface FilterState {
  subcategoryId: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  minRating: number | null;
  inStockOnly: boolean;
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'rating_desc' | 'name_asc';

  setSubcategory: (id: number | null) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setMinRating: (rating: number | null) => void;
  setInStockOnly: (inStock: boolean) => void;
  setSortBy: (sort: 'featured' | 'price_asc' | 'price_desc' | 'rating_desc' | 'name_asc') => void;
  clearFilters: () => void;
  activeFilterCount: () => number;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  subcategoryId: null,
  minPrice: null,
  maxPrice: null,
  minRating: null,
  inStockOnly: false,
  sortBy: 'featured',

  setSubcategory: (id) => {
    tracker.track(
      id ? 'filter_apply' : 'filter_remove',
      'filter_subcategory',
      { filterType: 'subcategory', value: id }
    );
    set({ subcategoryId: id });
  },

  setPriceRange: (min, max) => {
    tracker.track(
      min !== null || max !== null ? 'filter_apply' : 'filter_remove',
      'filter_price_range',
      { filterType: 'price_range', min, max }
    );
    set({ minPrice: min, maxPrice: max });
  },

  setMinRating: (rating) => {
    tracker.track(
      rating !== null ? 'filter_apply' : 'filter_remove',
      'filter_rating',
      { filterType: 'rating', minRating: rating }
    );
    set({ minRating: rating });
  },

  setInStockOnly: (inStock) => {
    tracker.track(
      inStock ? 'filter_apply' : 'filter_remove',
      'filter_in_stock',
      { filterType: 'in_stock_only', value: inStock }
    );
    set({ inStockOnly: inStock });
  },

  setSortBy: (sortBy) => {
    tracker.track('sort_change', 'sort_dropdown', { sortBy });
    set({ sortBy });
  },

  clearFilters: () => {
    tracker.track('filter_remove', 'clear_all_filters', { action: 'clear_all' });
    set({
      subcategoryId: null,
      minPrice: null,
      maxPrice: null,
      minRating: null,
      inStockOnly: false,
      sortBy: 'featured',
    });
  },

  activeFilterCount: () => {
    const s = get();
    let count = 0;
    if (s.subcategoryId !== null) count++;
    if (s.minPrice !== null || s.maxPrice !== null) count++;
    if (s.minRating !== null) count++;
    if (s.inStockOnly) count++;
    return count;
  }
}));
