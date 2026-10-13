import React, { useState } from 'react';
import { PaymentData } from '../../types';
import { tracker } from '../../lib/tracker';
import { CreditCard, Landmark, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface PaymentFormProps {
  initialValues: PaymentData;
  onSubmit: (data: PaymentData) => void;
  onBack: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  initialValues,
  onSubmit,
  onBack
}) => {
  const [method, setMethod] = useState<'credit_card' | 'paypal' | 'bank_transfer'>(initialValues.method || 'credit_card');
  const [cardNumber, setCardNumber] = useState(initialValues.cardNumber || '');
  const [expiryDate, setExpiryDate] = useState(initialValues.expiryDate || '');
  const [cvv, setCvv] = useState(initialValues.cvv || '');
  const [cardholderName, setCardholderName] = useState(initialValues.cardholderName || '');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateCard = (): boolean => {
    if (method !== 'credit_card') return true;

    const newErrors: Record<string, string> = {};

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (!cleanCard) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cleanCard.length < 13 || !/^\d+$/.test(cleanCard)) {
      newErrors.cardNumber = 'Enter a valid 16-digit card number';
    }

    if (!expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry is required';
    } else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate.trim())) {
      newErrors.expiryDate = 'Format: MM/YY';
    }

    if (!cvv.trim()) {
      newErrors.cvv = 'CVV required';
    } else if (!/^\d{3,4}$/.test(cvv.trim())) {
      newErrors.cvv = '3 or 4 digits';
    }

    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    setErrors(newErrors);
    setTouched({ cardNumber: true, expiryDate: true, cvv: true, cardholderName: true });

    Object.entries(newErrors).forEach(([field, msg]) => {
      tracker.track('form_error', `payment_${field}`, { field, error: msg });
    });

    return Object.keys(newErrors).length === 0;
  };

  const handleCardFormat = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryFormat = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setExpiryDate(raw.slice(0, 2) + '/' + raw.slice(2));
    } else {
      setExpiryDate(raw);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCard()) {
      onSubmit({
        method,
        cardNumber,
        expiryDate,
        cvv,
        cardholderName
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900">2. Payment Method</h2>
        <p className="text-xs text-slate-500 mt-1">Select your preferred payment instrument (all test simulations accepted).</p>
      </div>

      {/* Payment Method Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Credit Card */}
        <label
          className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
            method === 'credit_card'
              ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
          data-track="payment_method_credit_card"
        >
          <div className="flex items-center justify-between mb-2">
            <CreditCard className={`w-5 h-5 ${method === 'credit_card' ? 'text-blue-600' : 'text-slate-500'}`} />
            <input
              type="radio"
              name="paymentMethod"
              checked={method === 'credit_card'}
              onChange={() => setMethod('credit_card')}
              className="text-blue-600 focus:ring-blue-500"
            />
          </div>
          <span className="font-bold text-xs text-slate-800">Credit Card</span>
          <span className="text-[11px] text-slate-500">Visa, Mastercard, Amex</span>
        </label>

        {/* PayPal */}
        <label
          className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
            method === 'paypal'
              ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
          data-track="payment_method_paypal"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-extrabold text-blue-600 text-sm tracking-tighter">P</span>
            <input
              type="radio"
              name="paymentMethod"
              checked={method === 'paypal'}
              onChange={() => setMethod('paypal')}
              className="text-blue-600 focus:ring-blue-500"
            />
          </div>
          <span className="font-bold text-xs text-slate-800">PayPal Express</span>
          <span className="text-[11px] text-slate-500">Simulated 1-click checkout</span>
        </label>

        {/* Bank Transfer */}
        <label
          className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
            method === 'bank_transfer'
              ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
          data-track="payment_method_bank_transfer"
        >
          <div className="flex items-center justify-between mb-2">
            <Landmark className={`w-5 h-5 ${method === 'bank_transfer' ? 'text-blue-600' : 'text-slate-500'}`} />
            <input
              type="radio"
              name="paymentMethod"
              checked={method === 'bank_transfer'}
              onChange={() => setMethod('bank_transfer')}
              className="text-blue-600 focus:ring-blue-500"
            />
          </div>
          <span className="font-bold text-xs text-slate-800">Direct Bank Wire</span>
          <span className="text-[11px] text-slate-500">Invoice on order confirmation</span>
        </label>
      </div>

      {/* Credit Card Details Inputs */}
      {method === 'credit_card' ? (
        <div className="space-y-4 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 pb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted 256-bit test transaction</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cardholder Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="e.g. JOHN DOE"
              className="w-full px-3 py-2 text-sm uppercase rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              data-track="payment_cardholder"
            />
            {touched.cardholderName && errors.cardholderName && (
              <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.cardholderName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Card Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => handleCardFormat(e.target.value)}
              placeholder="4000 1234 5678 9010"
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              data-track="payment_cardNumber"
            />
            {touched.cardNumber && errors.cardNumber && (
              <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.cardNumber}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expiry Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => handleExpiryFormat(e.target.value)}
                placeholder="MM/YY"
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                data-track="payment_expiry"
              />
              {touched.expiryDate && errors.expiryDate && (
                <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.expiryDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Security Code (CVV) <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                placeholder="123"
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                data-track="payment_cvv"
              />
              {touched.cvv && errors.cvv && (
                <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.cvv}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : method === 'paypal' ? (
        <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 text-xs text-blue-800 space-y-1">
          <p className="font-bold">PayPal Sandbox Mode Active</p>
          <p>Your simulated order will be securely charged via mock PayPal checkout upon order placement.</p>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
          <p className="font-bold">Wire Transfer Information</p>
          <p>Wire transfer routing codes and invoice details will be provided immediately upon confirmation.</p>
        </div>
      )}

      {/* Buttons */}
      <div className="pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-xs rounded-lg hover:bg-slate-100 transition-colors"
          data-track="payment_back_btn"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shipping</span>
        </button>

        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow-blue-600/25 transition-all"
          data-track="payment_continue_review_btn"
        >
          <span>Continue to Review</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
