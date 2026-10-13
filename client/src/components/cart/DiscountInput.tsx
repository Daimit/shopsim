import React, { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import { Tag, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const DiscountInput: React.FC = () => {
  const { cart, applyDiscount, removeDiscount } = useCartStore();
  const [code, setCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    setIsSubmitting(true);
    setStatusMessage(null);
    setIsError(false);

    const result = await applyDiscount(cleanCode);
    setIsSubmitting(false);

    if (result.success) {
      setIsError(false);
      setStatusMessage(`${cleanCode} applied successfully!`);
      setCode('');
    } else {
      setIsError(true);
      setStatusMessage(result.message || 'Invalid discount code');
    }
  };

  const handleRemove = async () => {
    await removeDiscount();
    setStatusMessage(null);
    setIsError(false);
  };

  // If discount code already applied on cart
  if (cart.discountCode) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-800">
                Code <span className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded">{cart.discountCode}</span> Applied
              </p>
              <p className="text-[11px] text-emerald-600 font-medium">
                You saved ${cart.discount.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-0.5 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
            data-track="remove_discount_btn"
          >
            <X className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Discount code (e.g. SAVE20)"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (isError) setIsError(false);
            }}
            className={`w-full pl-9 pr-3 py-2 text-xs font-medium uppercase rounded-lg border focus:outline-hidden transition-all ${
              isError
                ? 'border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-1 focus:ring-rose-200'
                : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-100'
            }`}
            data-track="discount_code_input"
          />
        </div>

        <button
          type="submit"
          disabled={!code.trim() || isSubmitting}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
          data-track="apply_discount_button"
        >
          {isSubmitting ? 'Applying...' : 'Apply'}
        </button>
      </form>

      {statusMessage && (
        <div
          className={`flex items-center gap-1.5 text-xs font-medium ${
            isError ? 'text-rose-600' : 'text-emerald-600'
          }`}
        >
          {isError ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
