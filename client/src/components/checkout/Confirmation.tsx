import React from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../../types';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

interface ConfirmationProps {
  order: Order | null;
}

export const Confirmation: React.FC<ConfirmationProps> = ({ order }) => {
  const orderNum = order?.id ? `ORD-${order.id}` : `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm space-y-6">
      {/* Success Badge */}
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle className="w-12 h-12" />
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Payment Successful
        </span>
        <h1 className="text-3xl font-black text-slate-900 mt-3 mb-2 tracking-tight">
          Order Confirmed!
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Thank you for completing this workflow test. Your test order reference is{' '}
          <strong className="text-slate-900 font-mono">{orderNum}</strong>.
        </p>
      </div>

      {/* Order Summary box */}
      {order && (
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 text-left space-y-3 text-xs max-w-md mx-auto">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Order Number</span>
            <span className="font-mono font-bold text-slate-800">{orderNum}</span>
          </div>

          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Total Paid</span>
            <span className="font-bold text-slate-900 text-sm">
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500">Payment Instrument</span>
            <span className="font-medium text-slate-800 uppercase">
              {order.paymentMethod.replace('_', ' ')}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Order Placed</span>
            <span className="text-slate-700">
              {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}

      {/* Button */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
          data-track="confirmation_continue_shopping"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>

        <Link
          to="/admin"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors"
          data-track="confirmation_view_telemetry"
        >
          <span>View Session Telemetry</span>
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </Link>
      </div>
    </div>
  );
};
