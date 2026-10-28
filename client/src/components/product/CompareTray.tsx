import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, X } from 'lucide-react';
import { useCompareStore } from '../../store/compareStore';

export const CompareTray: React.FC = () => {
  const location = useLocation();
  const items = useCompareStore((state) => state.items);
  const removeItem = useCompareStore((state) => state.removeItem);
  const clearCompare = useCompareStore((state) => state.clearCompare);

  if (items.length === 0 || location.pathname.startsWith('/compare')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 p-2.5 shadow-xl shadow-slate-900/10 backdrop-blur-md">
        <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Scale className="h-4 w-4" />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
          {items.map((item) => (
            <div key={item.id} className="relative shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
              />
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-white"
                aria-label={`Remove ${item.name} from compare`}
                data-track={`compare_tray_remove_${item.id}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {items.length < 4 && (
            <span className="hidden sm:inline px-2 text-[11px] font-medium text-slate-400">
              {4 - items.length} more slot{4 - items.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        <Link
          to="/compare"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
          data-track="compare_tray_open"
        >
          Compare {items.length}
        </Link>
        <button
          type="button"
          onClick={clearCompare}
          className="hidden sm:inline-flex shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          data-track="compare_tray_clear"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
