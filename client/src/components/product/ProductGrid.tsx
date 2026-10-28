import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { PackageOpen } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your search or filter criteria to find what you are looking for.'
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
          <div key={idx} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4">
            <div className="w-full aspect-square bg-slate-200 rounded-lg mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="h-5 bg-slate-200 rounded w-4/5 mb-4"></div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <div className="h-6 bg-slate-200 rounded w-16"></div>
              <div className="h-8 bg-slate-200 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mx-auto my-8 max-w-lg rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">{emptyTitle}</h3>
        <p className="text-sm text-slate-500 mb-6">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
