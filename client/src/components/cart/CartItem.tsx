import React from 'react';
import { Link } from 'react-router-dom';
import { CartItem as CartItemType } from '../../types';
import { QuantityStepper } from './QuantityStepper';
import { useCartStore } from '../../store/cartStore';
import { Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();

  const handleQtyChange = (newQty: number, method: string) => {
    updateQuantity(item.id, newQty, method);
  };

  const lineTotal = item.product.price * item.quantity;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs gap-4 transition-all">
      {/* Product Image & Details */}
      <div className="flex items-center gap-4 flex-1">
        <Link
          to={`/product/${item.product.slug}`}
          className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100"
          data-track={`cart_item_img_${item.productId}`}
        >
          <img
            src={item.product.image}
            alt={item.product.name}
            className="w-full h-full object-cover"
          />
        </Link>

        <div className="space-y-1">
          <Link
            to={`/product/${item.product.slug}`}
            className="font-bold text-slate-800 hover:text-blue-600 text-sm line-clamp-2 transition-colors"
            data-track={`cart_item_title_${item.productId}`}
          >
            {item.product.name}
          </Link>
          <div className="text-xs text-slate-500">
            Unit Price: <span className="font-semibold text-slate-700">${item.product.price.toFixed(2)}</span>
          </div>
          {item.product.stock <= 5 && (
            <div className="text-[11px] font-medium text-amber-600">
              Only {item.product.stock} units in stock
            </div>
          )}
        </div>
      </div>

      {/* Stepper, Line Total, Remove */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        <QuantityStepper
          value={item.quantity}
          max={Math.min(99, item.product.stock || 99)}
          onChange={handleQtyChange}
        />

        <div className="text-right min-w-[70px]">
          <span className="text-xs text-slate-400 block sm:hidden font-medium">Total</span>
          <span className="font-black text-slate-900 text-base">
            ${lineTotal.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => removeItem(item.id)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          title="Remove from cart"
          aria-label="Remove item"
          data-track={`cart_remove_btn_${item.id}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
