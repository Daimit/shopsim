import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { DiscountInput } from './DiscountInput';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { tracker } from '../../lib/tracker';

export const CartSummary: React.FC = () => {
  const navigate = useNavigate();
  const { cart } = useCartStore();
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);

  const handleCheckoutClick = () => {
    if (!user) {
      openAuthModal('Please sign in to proceed to checkout and complete your order.', () => {
        navigate('/checkout');
      });
      return;
    }

    tracker.track('checkout_start', 'proceed_to_checkout_btn', {
      itemCount: cart.itemCount,
      subtotal: cart.subtotal,
      total: cart.total,
      discount: cart.discount,
    });
    navigate('/checkout');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs sticky top-24 space-y-6">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
        Order Summary
      </h3>

      {/* Discount Coupon Section */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
          Have a promotional code?
        </label>
        <DiscountInput />
      </div>

      {/* Calculations Breakdown */}
      <div className="space-y-3 text-sm border-t border-slate-100 pt-4">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</span>
          <span className="font-semibold text-slate-800">${cart.subtotal.toFixed(2)}</span>
        </div>

        {cart.discount > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span>Discount Applied</span>
            <span>-${cart.discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span className="text-emerald-600 font-semibold">Free</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Estimated Sales Tax</span>
          <span className="text-slate-800 font-semibold">$0.00</span>
        </div>

        <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
          <span className="text-base font-bold text-slate-900">Total</span>
          <span className="text-2xl font-black text-slate-900">
            ${cart.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Proceed Button */}
      <button
        type="button"
        onClick={handleCheckoutClick}
        disabled={cart.itemCount === 0}
        className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg shadow-sm hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
        data-track="cart_proceed_to_checkout"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Trust badges */}
      <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Simulated secure SSL checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Free express delivery included</span>
        </div>
      </div>
    </div>
  );
};
