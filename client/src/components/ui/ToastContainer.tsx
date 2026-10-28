import React from 'react';
import { Link } from 'react-router-dom';
import { useToastStore } from '../../store/toastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success':
              return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />;
            case 'error':
              return <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />;
            case 'warning':
              return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />;
            default:
              return <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />;
          }
        };

        const getBorderColor = () => {
          switch (toast.type) {
            case 'success':
              return 'border-emerald-200/80 bg-white/95';
            case 'error':
              return 'border-red-200/80 bg-white/95';
            case 'warning':
              return 'border-amber-200/80 bg-white/95';
            default:
              return 'border-blue-200/80 bg-white/95';
          }
        };

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${getBorderColor()}`}
          >
            {toast.image ? (
              <img
                src={toast.image}
                alt=""
                className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200"
              />
            ) : (
              getIcon()
            )}

            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                {toast.message}
              </h4>
              {toast.submessage && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                  {toast.submessage}
                </p>
              )}
              {toast.actionLink && toast.actionText && (
                <Link
                  to={toast.actionLink}
                  onClick={() => removeToast(toast.id)}
                  className="inline-block mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  {toast.actionText} &rarr;
                </Link>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
