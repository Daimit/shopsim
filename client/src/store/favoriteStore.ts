import { create } from 'zustand';
import { Product } from '../types';
import { tracker } from '../lib/tracker';
import { getFavoritesStorageKey } from '../lib/shoppingScope';

interface FavoriteState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  toggleItem: (product: Product) => void;
  isFavorite: (productId: number) => boolean;
}

const getStoredFavorites = (): Product[] => {
  try {
    const raw = localStorage.getItem(getFavoritesStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveFavorites = (items: Product[]) => {
  try {
    localStorage.setItem(getFavoritesStorageKey(), JSON.stringify(items));
  } catch {
    // Storage can be unavailable in private browsing; the in-memory state still works.
  }
};

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  items: getStoredFavorites(),

  addItem: (product) => {
    const items = get().items;
    if (items.some((item) => item.id === product.id)) return;
    const next = [...items, product];
    saveFavorites(next);
    tracker.track('favorite_add', `product_${product.id}`, {
      productId: product.id,
      productName: product.name,
      totalFavorites: next.length,
    });
    set({ items: next });
  },

  removeItem: (productId) => {
    const item = get().items.find((favorite) => favorite.id === productId);
    const next = get().items.filter((favorite) => favorite.id !== productId);
    saveFavorites(next);
    tracker.track('favorite_remove', `product_${productId}`, {
      productId,
      productName: item?.name,
      totalFavorites: next.length,
    });
    set({ items: next });
  },

  toggleItem: (product) => {
    if (get().isFavorite(product.id)) {
      get().removeItem(product.id);
    } else {
      get().addItem(product);
    }
  },

  isFavorite: (productId) => get().items.some((item) => item.id === productId),
}));

if (typeof window !== 'undefined') {
  window.addEventListener('shopsim:auth-changed', () => {
    setTimeout(() => {
      useFavoriteStore.setState({ items: getStoredFavorites() });
    }, 0);
  });
}
