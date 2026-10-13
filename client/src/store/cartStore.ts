import { create } from 'zustand';
import { Cart } from '../types';
import { api } from '../lib/api';
import { tracker } from '../lib/tracker';

interface CartState {
  cart: Cart;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: number, quantity: number, method?: string) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  applyDiscount: (code: string) => Promise<{ success: boolean; message?: string }>;
  removeDiscount: () => Promise<void>;
  clearCart: () => Promise<void>;
}

const initialCart: Cart = {
  id: '',
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  itemCount: 0
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: initialCart,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const sessionId = tracker.getSessionId();
      const cart = await api.getCart(sessionId);
      set({ cart, isLoading: false });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to fetch cart', isLoading: false });
    }
  },

  addItem: async (productId: number, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const sessionId = tracker.getSessionId();
      const updatedCart = await api.addToCart(sessionId, productId, quantity);
      const addedItem = updatedCart.items.find(i => i.productId === productId);

      tracker.track('cart_add', `product_${productId}`, {
        productId,
        quantity,
        productName: addedItem?.product.name,
        price: addedItem?.product.price,
        itemCount: updatedCart.itemCount,
        total: updatedCart.total,
      });

      set({ cart: updatedCart, isLoading: false });
      return true;
    } catch (err: any) {
      set({ error: err?.message || 'Failed to add item to cart', isLoading: false });
      return false;
    }
  },

  updateQuantity: async (itemId: number, quantity: number, method = 'stepper') => {
    const { cart } = get();
    const existingItem = cart.items.find(i => i.id === itemId);
    const oldQty = existingItem?.quantity || 1;

    try {
      const sessionId = tracker.getSessionId();
      const updatedCart = await api.updateCartItem(sessionId, itemId, quantity);

      tracker.track('quantity_change', `cart_item_${itemId}`, {
        itemId,
        productId: existingItem?.productId,
        old_qty: oldQty,
        new_qty: quantity,
        method,
      });

      set({ cart: updatedCart });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to update quantity' });
    }
  },

  removeItem: async (itemId: number) => {
    const { cart } = get();
    const itemToRemove = cart.items.find(i => i.id === itemId);

    try {
      const sessionId = tracker.getSessionId();
      const updatedCart = await api.removeCartItem(sessionId, itemId);

      tracker.track('cart_remove', `cart_item_${itemId}`, {
        itemId,
        productId: itemToRemove?.productId,
        productName: itemToRemove?.product.name,
        price: itemToRemove?.product.price,
      });

      set({ cart: updatedCart });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to remove item' });
    }
  },

  applyDiscount: async (code: string) => {
    try {
      const sessionId = tracker.getSessionId();
      const updatedCart = await api.applyDiscount(sessionId, code);

      tracker.track('discount_apply', 'discount_input', {
        code,
        success: true,
        discountAmount: updatedCart.discount,
      });

      set({ cart: updatedCart, error: null });
      return { success: true };
    } catch (err: any) {
      const msg = err?.message || 'Invalid discount code';

      tracker.track('discount_apply', 'discount_input', {
        code,
        success: false,
        error: msg,
      });

      return { success: false, message: msg };
    }
  },

  removeDiscount: async () => {
    const code = get().cart.discountCode;
    try {
      const sessionId = tracker.getSessionId();
      const updatedCart = await api.removeDiscount(sessionId);

      tracker.track('discount_remove', 'discount_button', {
        code,
      });

      set({ cart: updatedCart });
    } catch (err: any) {
      set({ error: err?.message || 'Failed to remove discount' });
    }
  },

  clearCart: async () => {
    const sessionId = tracker.getSessionId();
    const updatedCart = await api.clearCart(sessionId);
    set({ cart: updatedCart });
  }
}));
