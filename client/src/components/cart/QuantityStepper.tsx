import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number, method: 'stepper_increase' | 'stepper_decrease' | 'direct_input') => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled = false,
  size = 'md'
}) => {
  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled || value <= min) return;
    onChange(value - 1, 'stepper_decrease');
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled || value >= max) return;
    onChange(value + 1, 'stepper_increase');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseInt(e.target.value, 10);
    if (!isNaN(raw)) {
      const clamped = Math.max(min, Math.min(max, raw));
      onChange(clamped, 'direct_input');
    }
  };

  const btnClasses = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  const inputClasses = size === 'sm' ? 'w-8 h-6 text-xs' : 'w-10 h-8 text-sm';

  return (
    <div className="inline-flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={`${btnClasses} flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition-colors`}
        aria-label="Decrease quantity"
        data-track="stepper_decrement"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className={`${inputClasses} text-center font-bold text-slate-800 focus:outline-hidden bg-transparent`}
        data-track="stepper_quantity_input"
      />

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={`${btnClasses} flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-white transition-colors`}
        aria-label="Increase quantity"
        data-track="stepper_increment"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
