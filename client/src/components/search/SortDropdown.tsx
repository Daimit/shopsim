import React from 'react';
import { useFilterStore } from '../../store/filterStore';
import { ArrowDownAZ } from 'lucide-react';

export const SortDropdown: React.FC = () => {
  const { sortBy, setSortBy } = useFilterStore();

  return (
    <div className="flex items-center gap-2 text-xs">
      <label htmlFor="sort-select" className="text-slate-500 font-medium whitespace-nowrap flex items-center gap-1">
        <ArrowDownAZ className="w-3.5 h-3.5" />
        <span>Sort by:</span>
      </label>
      <select
        id="sort-select"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as any)}
        className="bg-white border border-slate-200 rounded-lg py-1.5 pl-2.5 pr-8 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs cursor-pointer"
        data-track="sort_select_dropdown"
      >
        <option value="featured">Featured</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating_desc">Highest Rated</option>
        <option value="name_asc">Name: A to Z</option>
      </select>
    </div>
  );
};
