import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Check, Heart, Eye } from 'lucide-react';
import { Product } from '../../types';
import { RatingStars } from './RatingStars';
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
  const [isLiked, setIsLiked] = useState(false);

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

  // Determine badge type matching Figma style
  const getBadge = () => {
    if (isOutOfStock) {
      return (
        <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
          Out of Stock
        </span>
      );
    }
    if (product.rating >= 4.8 && product.reviewCount > 200) {
      return (
        <span className="bg-white/95 border border-slate-200/90 text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
          Bestseller
        </span>
      );
    }
    if (product.price >= 300) {
      return (
        <span className="bg-white/95 border border-slate-200/90 text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
          New arrival
        </span>
      );
    }
    if (product.stock <= 5) {
      return (
        <span className="bg-blue-100/95 border border-blue-200 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
          -15%
        </span>
      );
    }
    return (
      <span className="bg-white/95 border border-slate-200/90 text-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
        Popular
      </span>
    );
  };

  // Generate aesthetic subtitle matching Figma ("Wireless noise-canceling headphones", etc.)
  const getSubtitle = () => {
    if (product.slug.includes('headphones') || product.slug.includes('sony') || product.slug.includes('bose')) {
      return 'Wireless noise-canceling headphones';
    }
    if (product.slug.includes('watch') || product.slug.includes('apple-watch')) {
      return 'A smarter way to stay connected';
    }
    if (product.slug.includes('shirt') || product.slug.includes('sweater') || product.slug.includes('tshirt')) {
      return 'Premium cotton. Effortless comfort';
    }
    if (product.slug.includes('coffee') || product.slug.includes('blender') || product.slug.includes('espresso')) {
      return 'Make a moment of your morning';
    }
    if (product.slug.includes('mouse') || product.slug.includes('keyboard') || product.slug.includes('ssd')) {
      return 'Precision, in the palm of your hand';
    }
    return 'Thoughtfully chosen for everyday living';
  };

  const originalPrice = Math.round(product.price * 1.15);

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col h-full overflow-hidden relative"
      data-track={`product_card_${product.slug}`}
    >
      {/* Top Image Container */}
      <div className="relative aspect-4/3 w-full bg-slate-50 overflow-hidden">
        {/* Top Badges */}
        <div className="absolute top-3 left-3 z-10">
          {getBadge()}
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLiked(!isLiked);
          }}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 border border-slate-200/80 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-white shadow-2xs transition-colors"
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Product Image */}
        <Link
          to={`/product/${product.slug}`}
          className="block w-full h-full cursor-pointer"
        >
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Quick View Button on Hover (Figma style) */}
        <Link
          to={`/product/${product.slug}`}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 bg-white/95 text-slate-800 text-xs font-semibold rounded-full shadow-md border border-slate-200/70 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white"
        >
          <Eye className="w-3.5 h-3.5 text-slate-600" />
          <span>Quick view</span>
        </Link>
      </div>

      {/* Information Container */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1.5">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="sm" />
          </div>

          {/* Product Name */}
          <Link
            to={`/product/${product.slug}`}
            className="block text-slate-900 hover:text-blue-600 font-bold text-sm sm:text-base leading-snug line-clamp-1 transition-colors"
          >
            {product.name}
          </Link>

          {/* Subtitle */}
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
            {getSubtitle()}
          </p>

          {/* Color Swatch Dots */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-300"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-stone-300 border border-slate-300"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-100 border border-slate-300"></span>
            <span className="text-[10px] text-slate-400 font-medium ml-1">+2</span>
          </div>
        </div>

        {/* Price & Add to Cart Button Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900 leading-none">
              ${product.price.toFixed(2)}
            </div>
            {originalPrice > product.price && (
              <span className="text-[11px] text-slate-400 line-through mt-0.5 block">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`inline-flex items-center justify-center gap-1 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200/60 hover:border-transparent'
            }`}
            data-track={`product_card_add_cart_${product.id}`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <span>+ Add to Cart</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
