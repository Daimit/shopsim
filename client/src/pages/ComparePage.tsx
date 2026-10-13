import React, { useEffect } from 'react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { ComparisonTable } from '../components/product/ComparisonTable';
import { tracker } from '../lib/tracker';
import { useCompareStore } from '../store/compareStore';

export const ComparePage: React.FC = () => {
  const items = useCompareStore((state) => state.items);

  useEffect(() => {
    document.title = 'Product Comparison - ShopSim';
    tracker.track('compare_view', 'comparison_page', {
      productCount: items.length,
      productIds: items.map(p => p.id),
      productNames: items.map(p => p.name)
    });
  }, [items.length]);

  const breadcrumbs = [
    { label: 'Product Comparison', href: '/compare' }
  ];

  return (
    <div className="space-y-6 pb-20">
      <Breadcrumb items={breadcrumbs} />

      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Product Comparison Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Evaluate technical specifications, core highlights, and pricing side-by-side to assist your purchase decision.
        </p>
      </div>

      <ComparisonTable />
    </div>
  );
};
