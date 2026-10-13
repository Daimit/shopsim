import { create } from 'zustand';
import { Product } from '../types';
import { tracker } from '../lib/tracker';

interface CompareState {
  items: Product[];
  addItem: (product: Product) => boolean;
  removeItem: (productId: number) => void;
  clearCompare: () => void;
  isInCompare: (productId: number) => boolean;
}

const getStoredCompare = (): Product[] => {
  try {
    const raw = sessionStorage.getItem('shopsim_compare_items');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveStoredCompare = (items: Product[]) => {
  try {
    sessionStorage.setItem('shopsim_compare_items', JSON.stringify(items));
  } catch {
    // ignore
  }
};

export const useCompareStore = create<CompareState>((set, get) => ({
  items: getStoredCompare(),

  addItem: (product: Product) => {
    const { items } = get();
    if (items.some(p => p.id === product.id)) {
      return false;
    }
    if (items.length >= 4) {
      alert('You can compare a maximum of 4 products at a time.');
      return false;
    }

    const next = [...items, product];
    saveStoredCompare(next);
    tracker.track('compare_add', `product_${product.id}`, {
      productId: product.id,
      productName: product.name,
      totalComparing: next.length,
    });

    set({ items: next });
    return true;
  },

  removeItem: (productId: number) => {
    const { items } = get();
    const prod = items.find(p => p.id === productId);
    const next = items.filter(p => p.id !== productId);
    saveStoredCompare(next);

    tracker.track('compare_remove', `product_${productId}`, {
      productId,
      productName: prod?.name,
      totalComparing: next.length,
    });

    set({ items: next });
  },

  clearCompare: () => {
    saveStoredCompare([]);
    set({ items: [] });
  },

  isInCompare: (productId: number) => {
    return get().items.some(p => p.id === productId);
  }
}));
