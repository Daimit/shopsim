import React from 'react';
import { ShippingData, PaymentData, Cart } from '../../types';
import { ArrowLeft, CheckCircle2, Edit3, ShieldAlert } from 'lucide-react';

interface OrderReviewProps {
  shippingData: ShippingData;
  paymentData: PaymentData;
  cart: Cart;
  onEditShipping: () => void;
  onEditPayment: () => void;
  onPlaceOrder: () => void;
  onBack: () => void;
  isPlacingOrder: boolean;
}

export const OrderReview: React.FC<OrderReviewProps> = ({
  shippingData,
  paymentData,
  cart,
  onEditShipping,
  onEditPayment,
  onPlaceOrder,
  onBack,
  isPlacingOrder
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900">3. Review and Confirm Order</h2>
        <p className="text-xs text-slate-500 mt-1">
          Please review your shipping, payment, and item details before completing your order.
        </p>
      </div>

      {/* Shipping and Payment Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 relative">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Shipping Destination
            </h3>
            <button
              type="button"
              onClick={onEditShipping}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline"
              data-track="review_edit_shipping_btn"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-bold text-slate-900">{shippingData.firstName} {shippingData.lastName}</p>
            <p>{shippingData.address1}</p>
            {shippingData.address2 && <p>{shippingData.address2}</p>}
            <p>{shippingData.city}, {shippingData.state} {shippingData.zipCode}</p>
            <p className="text-slate-500">{shippingData.country}</p>
            <p className="pt-1 text-slate-500">{shippingData.email} • {shippingData.phone}</p>
          </div>
        </div>

        {/* Payment Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 relative">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Payment Instrument
            </h3>
            <button
              type="button"
              onClick={onEditPayment}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 hover:underline"
              data-track="review_edit_payment_btn"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-bold text-slate-900 uppercase">
              {paymentData.method.replace('_', ' ')}
            </p>
            {paymentData.method === 'credit_card' ? (
              <>
                <p className="font-mono text-slate-800">
                  •••• •••• •••• {paymentData.cardNumber?.replace(/\s+/g, '').slice(-4) || '4242'}
                </p>
                <p className="text-slate-500">Exp: {paymentData.expiryDate || '12/28'}</p>
                <p className="text-slate-500">{paymentData.cardholderName}</p>
              </>
            ) : paymentData.method === 'paypal' ? (
              <p className="text-slate-600">PayPal Instant Sandbox Checkout</p>
            ) : (
              <p className="text-slate-600">Direct Wire Transfer (Account instructions sent via email)</p>
            )}
          </div>
        </div>
      </div>

      {/* Items list */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Order Items ({cart.itemCount})
        </h3>
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
          {cart.items.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-12 h-12 object-cover rounded-md bg-slate-100 border border-slate-100 shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{item.product.name}</h4>
                  <span className="text-xs text-slate-500">
                    Qty: {item.quantity} × ${item.product.price.toFixed(2)}
                  </span>
                </div>
              </div>
              <span className="font-bold text-slate-900 text-sm">
                ${(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Financials Breakdown */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold text-slate-800">${cart.subtotal.toFixed(2)}</span>
        </div>

        {cart.discount > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>Discount ({cart.discountCode || 'Applied'})</span>
            <span>-${cart.discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-600">
          <span>Standard Delivery</span>
          <span className="text-emerald-600 font-bold">FREE</span>
        </div>

        <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
          <span className="text-sm font-bold text-slate-900">Total Charged</span>
          <span className="text-2xl font-black text-slate-900">
            ${cart.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isPlacingOrder}
          className="flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs rounded-lg hover:bg-slate-100 transition-colors"
          data-track="review_back_btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Payment</span>
        </button>

        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={isPlacingOrder || cart.itemCount === 0}
          className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-extrabold text-base rounded-xl shadow-md hover:shadow-emerald-600/30 transition-all cursor-pointer"
          data-track="place_order_button"
        >
          {isPlacingOrder ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Processing Order...</span>
            </div>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Place Order (${cart.total.toFixed(2)})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
