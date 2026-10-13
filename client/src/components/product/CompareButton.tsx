import React from 'react';
import { Product } from '../../types';
import { useCompareStore } from '../../store/compareStore';
import { Scale, Check } from 'lucide-react';

interface CompareButtonProps {
  product: Product;
  variant?: 'checkbox' | 'button';
  className?: string;
}

export const CompareButton: React.FC<CompareButtonProps> = ({
  product,
  variant = 'button',
  className = ''
}) => {
  const { isInCompare, addItem, removeItem } = useCompareStore();
  const comparing = isInCompare(product.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (comparing) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  if (variant === 'checkbox') {
    return (
      <label
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-600 hover:text-blue-600 transition-colors select-none ${className}`}
        data-track={`compare_checkbox_${product.id}`}
      >
        <input
          type="checkbox"
          checked={comparing}
          onChange={() => {
            if (comparing) removeItem(product.id);
            else addItem(product);
          }}
          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 border-slate-300"
        />
        <span>Compare</span>
      </label>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
        comparing
          ? 'bg-blue-50 text-blue-600 border border-blue-200'
          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
      } ${className}`}
      data-track={`compare_button_${product.id}`}
    >
      {comparing ? (
        <>
          <Check className="w-3.5 h-3.5 text-blue-600" />
          <span>Comparing</span>
        </>
      ) : (
        <>
          <Scale className="w-3.5 h-3.5 text-slate-500" />
          <span>Compare</span>
        </>
      )}
    </button>
  );
};
