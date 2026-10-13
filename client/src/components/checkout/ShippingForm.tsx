import React, { useState } from 'react';
import { ShippingData } from '../../types';
import { tracker } from '../../lib/tracker';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface ShippingFormProps {
  initialValues: ShippingData;
  onSubmit: (data: ShippingData) => void;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({
  initialValues,
  onSubmit
}) => {
  const [formData, setFormData] = useState<ShippingData>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ShippingData, boolean>>>({});

  const validateField = (field: keyof ShippingData, val: string): string | null => {
    if (field === 'address2') return null; // optional

    const trimmed = (val || '').trim();
    if (!trimmed) {
      return 'This field is required';
    }

    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return 'Please enter a valid email address';
      }
    }

    if (field === 'phone') {
      if (trimmed.length < 7) {
        return 'Please enter a valid telephone number';
      }
    }

    if (field === 'zipCode') {
      if (trimmed.length < 3) {
        return 'Please enter a valid postal/ZIP code';
      }
    }

    return null;
  };

  const handleBlur = (field: keyof ShippingData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, formData[field] || '');

    if (errorMsg) {
      tracker.track('form_error', `shipping_${field}`, {
        field,
        error: errorMsg,
        currentValue: formData[field]
      });
      setErrors(prev => ({ ...prev, [field]: errorMsg }));
    } else {
      if (errors[field]) {
        tracker.track('form_correction', `shipping_${field}`, {
          field,
          resolvedValue: formData[field]
        });
        setErrors(prev => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    }
  };

  const handleChange = (field: keyof ShippingData, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      const err = validateField(field, val);
      if (!err) {
        tracker.track('form_correction', `shipping_${field}`, { field, value: val });
        setErrors(prev => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<Record<keyof ShippingData, string>> = {};
    const fieldsToValidate: (keyof ShippingData)[] = [
      'firstName', 'lastName', 'email', 'phone', 'address1', 'city', 'state', 'zipCode', 'country'
    ];

    fieldsToValidate.forEach((f) => {
      const err = validateField(f, formData[f] || '');
      if (err) {
        newErrors[f] = err;
        tracker.track('form_error', `shipping_${f}`, { field: f, error: err });
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(fieldsToValidate.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-900">1. Shipping Information</h2>
        <p className="text-xs text-slate-500 mt-1">Please enter your shipping address to calculate rates and delivery details.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            First Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={() => handleBlur('firstName')}
            className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-hidden transition-all ${
              touched.firstName && errors.firstName
                ? 'border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-400'
                : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
            }`}
            data-track="shipping_firstName"
            placeholder="John"
          />
          {touched.firstName && errors.firstName && (
            <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.firstName}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Last Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={() => handleBlur('lastName')}
            className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-hidden transition-all ${
              touched.lastName && errors.lastName
                ? 'border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-400'
                : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
            }`}
            data-track="shipping_lastName"
            placeholder="Doe"
          />
          {touched.lastName && errors.lastName && (
            <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.lastName}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-hidden transition-all ${
              touched.email && errors.email
                ? 'border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-400'
                : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
            }`}
            data-track="shipping_email"
            placeholder="john.doe@example.com"
          />
          {touched.email && errors.email && (
            <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-hidden transition-all ${
              touched.phone && errors.phone
                ? 'border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-400'
                : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
            }`}
            data-track="shipping_phone"
            placeholder="+1 (555) 123-4567"
          />
          {touched.phone && errors.phone && (
            <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.phone}
            </p>
          )}
        </div>

        {/* Address Line 1 */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Address Line 1 <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.address1}
            onChange={(e) => handleChange('address1', e.target.value)}
            onBlur={() => handleBlur('address1')}
            className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-hidden transition-all ${
              touched.address1 && errors.address1
                ? 'border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-400'
                : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
            }`}
            data-track="shipping_address1"
            placeholder="123 Market Street"
          />
          {touched.address1 && errors.address1 && (
            <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.address1}
            </p>
          )}
        </div>

        {/* Address Line 2 */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Address Line 2 (Optional)
          </label>
          <input
            type="text"
            value={formData.address2 || ''}
            onChange={(e) => handleChange('address2', e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-hidden transition-all"
            data-track="shipping_address2"
            placeholder="Apt 4B, Suite, Unit..."
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            City <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            onBlur={() => handleBlur('city')}
            className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-hidden transition-all ${
              touched.city && errors.city
                ? 'border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-400'
                : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
            }`}
            data-track="shipping_city"
            placeholder="San Francisco"
          />
          {touched.city && errors.city && (
            <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.city}
            </p>
          )}
        </div>

        {/* State/Province */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            State / Province <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
            onBlur={() => handleBlur('state')}
            className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-hidden transition-all ${
              touched.state && errors.state
                ? 'border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-400'
                : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
            }`}
            data-track="shipping_state"
            placeholder="CA"
          />
          {touched.state && errors.state && (
            <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.state}
            </p>
          )}
        </div>

        {/* ZIP / Postal Code */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            ZIP / Postal Code <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
            onBlur={() => handleBlur('zipCode')}
            className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-hidden transition-all ${
              touched.zipCode && errors.zipCode
                ? 'border-rose-400 bg-rose-50/20 focus:ring-1 focus:ring-rose-400'
                : 'border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
            }`}
            data-track="shipping_zipCode"
            placeholder="94105"
          />
          {touched.zipCode && errors.zipCode && (
            <p className="text-rose-600 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.zipCode}
            </p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Country <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
            onBlur={() => handleBlur('country')}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-hidden bg-white transition-all"
            data-track="shipping_country"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
          </select>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow-blue-600/25 transition-all"
          data-track="shipping_submit_button"
        >
          <span>Continue to Payment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
