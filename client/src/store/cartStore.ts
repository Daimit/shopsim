import { create } from 'zustand';
import { Cart } from '../types';
import { api } from '../lib/api';
import { tracker } from '../lib/tracker';
import { useToastStore } from './toastStore';

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
  itemCount: 0,
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
      const addedItem = updatedCart.items.find((i) => i.productId === productId);

      tracker.track('cart_add', `product_${productId}`, {
        productId,
        quantity,
        productName: addedItem?.product.name,
        price: addedItem?.product.price,
        itemCount: updatedCart.itemCount,
        total: updatedCart.total,
      });

      if (addedItem) {
        useToastStore.getState().showToast({
          type: 'success',
          message: 'Added to Cart!',
          submessage: `${addedItem.product.name} • $${addedItem.product.price.toFixed(2)}`,
          image: addedItem.product.image,
          actionText: 'View Cart',
          actionLink: '/cart',
        });
      }

      set({ cart: updatedCart, isLoading: false });
      return true;
    } catch (err: any) {
      const msg = err?.message || 'Failed to add item to cart';
      useToastStore.getState().showToast({
        type: 'error',
        message: 'Could not add to cart',
        submessage: msg,
      });
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  updateQuantity: async (itemId: number, quantity: number, method = 'stepper') => {
    const { cart } = get();
    const existingItem = cart.items.find((i) => i.id === itemId);
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
    const itemToRemove = cart.items.find((i) => i.id === itemId);

    try {
      const sessionId = tracker.getSessionId();
      const updatedCart = await api.removeCartItem(sessionId, itemId);

      tracker.track('cart_remove', `cart_item_${itemId}`, {
        itemId,
        productId: itemToRemove?.productId,
        productName: itemToRemove?.product.name,
        price: itemToRemove?.product.price,
      });

      if (itemToRemove) {
        useToastStore.getState().showToast({
          type: 'info',
          message: 'Item removed',
          submessage: `${itemToRemove.product.name} removed from your cart`,
        });
      }

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

      useToastStore.getState().showToast({
        type: 'success',
        message: `Promo code ${code.toUpperCase()} applied!`,
        submessage: `You saved $${updatedCart.discount.toFixed(2)} on this order.`,
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

      useToastStore.getState().showToast({
        type: 'error',
        message: 'Invalid Promo Code',
        submessage: msg,
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

      useToastStore.getState().showToast({
        type: 'info',
        message: 'Coupon removed',
        submessage: 'Discount has been removed from your total',
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
  },
}));
