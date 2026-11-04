import React, { useMemo, useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import { tracker } from '../../lib/tracker';
import { Tag, CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

interface DiscountOffer {
  code: string;
  title: string;
  description: string;
  requirement: string;
  accent: string;
}

const offerAccentClasses: Record<string, string> = {
  blue: 'text-blue-600',
  violet: 'text-violet-600',
  rose: 'text-rose-600',
  emerald: 'text-emerald-600',
};

export const DiscountInput: React.FC = () => {
  const { cart, applyDiscount, removeDiscount } = useCartStore();
  const [code, setCode] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Milestone 4 UX Improvement: Keep available promo codes visible by default
  const [offersOpen, setOffersOpen] = useState(true);

  const offers = useMemo<DiscountOffer[]>(() => {
    const offers: DiscountOffer[] = [
      {
        code: 'SAVE20',
        title: '20% off your order',
        description: 'Save 20% on any products in your cart.',
        requirement: 'No minimum spend',
        accent: 'blue',
      },
    ];

    if (cart.subtotal >= 50) {
      offers.push({
        code: 'WELCOME10',
        title: '$10 off your order',
        description: 'Take $10 off this purchase.',
        requirement: 'Eligible on orders $50+',
        accent: 'violet',
      });
    }

    if (cart.subtotal >= 100) {
      offers.push({
        code: 'HALF50',
        title: '50% off your order',
        description: 'Get an extra 50% off this higher-value cart.',
        requirement: 'Eligible on orders $100+',
        accent: 'rose',
      });
    }

    offers.push({
      code: 'FREESHIP',
      title: 'Free express delivery',
      description: 'Keep more of your budget with free shipping.',
      requirement: 'Available on every order',
      accent: 'emerald',
    });

    return offers;
  }, [cart.subtotal]);

  const applyCode = async (value: string) => {
    const cleanCode = value.trim().toUpperCase();
    if (!cleanCode) return;

    setIsSubmitting(true);
    setStatusMessage(null);
    setIsError(false);

    try {
      const result = await applyDiscount(cleanCode);
      if (result.success) {
        setStatusMessage(`Promo code "${cleanCode}" applied!`);
        setIsError(false);
        setCode('');
      } else {
        setStatusMessage('Invalid or ineligible promo code. Try SAVE20 for 20% off.');
        setIsError(true);
        tracker.track('coupon_error', 'discount_input', {
          attemptedCode: cleanCode,
          reason: 'invalid_or_ineligible',
        });
      }
    } catch {
      setStatusMessage('Could not apply promo code. Try SAVE20.');
      setIsError(true);
      tracker.track('coupon_error', 'discount_input', {
        attemptedCode: cleanCode,
        reason: 'request_failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    await applyCode(code);
  };

  const handleOfferApply = async (offer: DiscountOffer) => {
    setCode(offer.code);
    await applyCode(offer.code);
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

      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
        <button
          type="button"
          onClick={() => setOffersOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-2 text-left"
          aria-expanded={offersOpen}
          data-track="toggle_available_discounts"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>
              <span className="block text-xs font-bold text-slate-800">Available discounts & offers</span>
              <span className="block text-[11px] text-slate-500">
                {offersOpen ? `Offers for your $${cart.subtotal.toFixed(2)} cart` : 'Click to view available offers'}
              </span>
            </span>
          </span>
          <span className="text-xs font-bold text-blue-600">
            {offersOpen ? 'Hide' : 'View'}
          </span>
        </button>

        {offersOpen && (
          <div className="mt-3 space-y-2">
            {offers.map((offer) => (
              <div
                key={offer.code}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                      {offer.code}
                    </span>
                    <p className="truncate text-xs font-bold text-slate-800">{offer.title}</p>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-500">{offer.description}</p>
                  <p className={`mt-1 text-[10px] font-semibold ${offerAccentClasses[offer.accent]}`}>
                    {offer.requirement}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOfferApply(offer)}
                  disabled={isSubmitting}
                  className="shrink-0 rounded-md bg-slate-800 px-2.5 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-slate-900 disabled:opacity-50"
                  data-track={`apply_offer_${offer.code.toLowerCase()}`}
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
