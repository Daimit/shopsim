import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number; // 1: Shipping, 2: Payment, 3: Review, 4: Confirmation
  onStepClick?: (step: number) => void;
}

const STEPS = [
  { step: 1, label: 'Shipping' },
  { step: 2, label: 'Payment' },
  { step: 3, label: 'Review' },
  { step: 4, label: 'Confirmation' },
];

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, onStepClick }) => {
  return (
    <div className="mx-auto w-full max-w-3xl px-2 py-6 sm:px-4">
      <div className="relative flex items-start justify-between">
        <div className="absolute top-[18px] right-4 left-4 z-0 h-0.5 bg-slate-200"></div>
        <div
          className="absolute top-[18px] left-4 z-0 h-0.5 bg-blue-600 transition-all duration-300"
          style={{
            width: `calc(${((Math.min(currentStep, 4) - 1) / (STEPS.length - 1)) * 100}% - 1rem)`
          }}
        ></div>

        {STEPS.map((s) => {
          const isCompleted = s.step < currentStep || currentStep === 4;
          const isCurrent = s.step === currentStep && currentStep !== 4;
          const isClickable = onStepClick && s.step < currentStep && currentStep !== 4;

          return (
            <div
              key={s.step}
              className="relative z-10 flex flex-col items-center cursor-default"
              onClick={() => isClickable && onStepClick(s.step)}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-xs'
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                } ${isClickable ? 'cursor-pointer hover:ring-2 hover:ring-slate-300' : ''}`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <span>{s.step}</span>
                )}
              </div>

              <span
                className={`text-xs font-semibold mt-2 hidden sm:block ${
                  isCurrent
                    ? 'text-blue-600 font-bold'
                    : isCompleted
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
