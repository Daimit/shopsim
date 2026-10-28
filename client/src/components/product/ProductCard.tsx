import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { Product } from '../../types';
import { RatingStars } from './RatingStars';
import { CompareButton } from './CompareButton';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isAdding) return;

    if (!user) {
      openAuthModal(`Please sign in to add "${product.name}" to your shopping cart.`, async () => {
        setIsAdding(true);
        const success = await addItem(product.id, 1);
        setIsAdding(false);
        if (success) {
          setJustAdded(true);
          setTimeout(() => setJustAdded(false), 1500);
        }
      });
      return;
    }

    setIsAdding(true);
    const success = await addItem(product.id, 1);
    setIsAdding(false);

    if (success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col h-full overflow-hidden relative"
      data-track={`product_card_${product.slug}`}
    >
      {/* Dynamic Product Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
        {isOutOfStock ? (
          <span className="bg-rose-600/95 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
            Out of Stock
          </span>
        ) : product.stock <= 5 ? (
          <span className="bg-amber-600/95 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
            Only {product.stock} left
          </span>
        ) : product.rating >= 4.8 && product.reviewCount > 200 ? (
          <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
            ★ Best Seller
          </span>
        ) : product.price >= 700 ? (
          <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
            Flagship
          </span>
        ) : (
          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
            Save 20%
          </span>
        )}
      </div>

      {/* Compare button overlay */}
      <div className="absolute top-3 right-3 z-10">
        <CompareButton
          product={product}
          variant="checkbox"
          className="bg-white/95 backdrop-blur-xs px-2 py-1 rounded-lg shadow-xs border border-slate-200 hover:border-slate-300 transition-all"
        />
      </div>

      {/* Product Image */}
      <Link
        to={`/product/${product.slug}`}
        className="block aspect-square w-full overflow-hidden bg-slate-50 relative cursor-pointer"
        data-track={`product_card_img_${product.id}`}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
      </Link>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Rating */}
          <div className="mb-2">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="sm" />
          </div>

          {/* Product Name */}
          <Link
            to={`/product/${product.slug}`}
            className="block text-slate-800 hover:text-blue-600 font-bold text-sm sm:text-base leading-snug line-clamp-2 transition-colors"
            data-track={`product_card_title_${product.id}`}
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Add to Cart button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Price
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : justAdded
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-500/20'
            }`}
            data-track={`product_card_add_cart_${product.id}`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
