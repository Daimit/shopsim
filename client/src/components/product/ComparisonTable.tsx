import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { RatingStars } from './RatingStars';
import { useCompareStore } from '../../store/compareStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { Trash2, ShoppingCart, Check, Scale } from 'lucide-react';

export const ComparisonTable: React.FC = () => {
  const { items, removeItem, clearCompare } = useCompareStore();
  const addItem = useCartStore((state) => state.addItem);
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const [addedMap, setAddedMap] = React.useState<Record<number, boolean>>({});

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12 shadow-xs">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Scale className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No products to compare</h3>
        <p className="text-sm text-slate-500 mb-6">
          Browse products and click "Compare" to add them side-by-side for a comprehensive feature analysis.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-xs"
          data-track="compare_browse_products"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  // Gather unique spec keys across all comparing products
  const allSpecKeys = Array.from(
    new Set(
      items.flatMap((prod) => {
        try {
          const parsed = typeof prod.specs === 'string' ? JSON.parse(prod.specs) : prod.specs;
          return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? Object.keys(parsed) : [];
        } catch {
          return [];
        }
      })
    )
  );

  const handleAddToCart = async (product: Product) => {
    if (product.stock <= 0) return;
    if (!user) {
      openAuthModal(`Please sign in to add "${product.name}" to your shopping cart.`, async () => {
        const ok = await addItem(product.id, 1);
        if (ok) {
          setAddedMap((prev) => ({ ...prev, [product.id]: true }));
          setTimeout(() => {
            setAddedMap((prev) => ({ ...prev, [product.id]: false }));
          }, 1500);
        }
      });
      return;
    }
    const ok = await addItem(product.id, 1);
    if (ok) {
      setAddedMap((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedMap((prev) => ({ ...prev, [product.id]: false }));
      }, 1500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">
          Comparing <strong className="text-slate-800">{items.length}</strong> {items.length === 1 ? 'product' : 'products'} (maximum 4)
        </p>
        <button
          onClick={clearCompare}
          className="text-xs text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 font-medium"
          data-track="compare_clear_all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear comparison</span>
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-xs">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="p-4 w-48 text-xs font-bold text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50/90 backdrop-blur-xs">
                Product Details
              </th>
              {items.map((prod) => (
                <th key={prod.id} className="p-4 w-64 align-top border-l border-slate-200">
                  <div className="flex flex-col h-full justify-between gap-3">
                    <div className="relative">
                      <button
                        onClick={() => removeItem(prod.id)}
                        className="absolute -top-1 -right-1 text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                        title="Remove product"
                        data-track={`compare_remove_${prod.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100 mb-3 max-w-[160px] mx-auto">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <Link
                        to={`/product/${prod.slug}`}
                        className="text-sm font-bold text-slate-800 hover:text-blue-600 line-clamp-2 block mb-1"
                      >
                        {prod.name}
                      </Link>

                      <div className="mb-2">
                        <RatingStars rating={prod.rating} reviewCount={prod.reviewCount} size="sm" />
                      </div>

                      <div className="text-lg font-black text-slate-900 mb-2">
                        ${prod.price.toFixed(2)}
                      </div>

                      <div>
                        {prod.stock > 0 ? (
                          <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            In Stock ({prod.stock})
                          </span>
                        ) : (
                          <span className="inline-block text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(prod)}
                      disabled={prod.stock <= 0}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all mt-2 ${
                        prod.stock <= 0
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : addedMap[prod.id]
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      data-track={`compare_add_cart_${prod.id}`}
                    >
                      {addedMap[prod.id] ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{prod.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {/* Description Row */}
            <tr className="bg-slate-50/30">
              <td className="p-4 font-semibold text-slate-700 sticky left-0 bg-slate-50/90 backdrop-blur-xs">
                Description
              </td>
              {items.map((prod) => (
                <td key={prod.id} className="p-4 text-xs text-slate-600 border-l border-slate-100 leading-relaxed align-top">
                  {prod.description}
                </td>
              ))}
            </tr>

            {/* Key Features Rows */}
            <tr className="bg-slate-100/50">
              <td colSpan={items.length + 1} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Key Features
              </td>
            </tr>

            <tr>
              <td className="p-4 font-semibold text-slate-700 sticky left-0 bg-white">
                Highlights
              </td>
              {items.map((prod) => {
                let feats: string[] = [];
                try {
                  const raw = typeof prod.features === 'string' ? JSON.parse(prod.features) : prod.features;
                  feats = Array.isArray(raw) ? raw : [];
                } catch {
                  feats = [];
                }
                return (
                  <td key={prod.id} className="p-4 text-xs text-slate-600 border-l border-slate-100 align-top">
                    <ul className="space-y-1.5 list-disc list-inside">
                      {feats.map((f, i) => (
                        <li key={i} className="leading-snug">{String(f)}</li>
                      ))}
                    </ul>
                  </td>
                );
              })}
            </tr>

            {/* Technical Specifications */}
            {allSpecKeys.length > 0 && (
              <tr className="bg-slate-100/50">
                <td colSpan={items.length + 1} className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Technical Specifications
                </td>
              </tr>
            )}

            {allSpecKeys.map((specKey) => (
              <tr key={specKey}>
                <td className="p-4 font-semibold text-slate-700 sticky left-0 bg-white text-xs">
                  {specKey}
                </td>
                {items.map((prod) => {
                  let val = '—';
                  try {
                    const parsed = typeof prod.specs === 'string' ? JSON.parse(prod.specs) : prod.specs;
                    if (parsed && parsed[specKey] !== undefined) {
                      val = String(parsed[specKey]);
                    }
                  } catch {
                    val = '—';
                  }

                  return (
                    <td key={prod.id} className="p-4 text-xs text-slate-600 border-l border-slate-100 align-top">
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
