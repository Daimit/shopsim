import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { api } from '../lib/api';
import { tracker } from '../lib/tracker';
import { useCartStore } from '../store/cartStore';
import { useCompareStore } from '../store/compareStore';
import { useAuthStore } from '../store/authStore';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { RatingStars } from '../components/product/RatingStars';
import { QuantityStepper } from '../components/cart/QuantityStepper';
import { ProductSpecs } from '../components/product/ProductSpecs';
import { ProductReviews } from '../components/product/ProductReviews';
import {
  ShoppingCart,
  Scale,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const addItem = useCartStore((state) => state.addItem);
  const user = useAuthStore((state) => state.user);
  const openAuthModal = useAuthStore((state) => state.openAuthModal);
  const { isInCompare, addItem: addToCompare, removeItem: removeFromCompare } = useCompareStore();

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);

    api.getProductBySlug(slug).then((prod) => {
      setProduct(prod);
      if (prod) {
        document.title = `${prod.name} - ShopSim`;
        tracker.track('product_view', `product_${prod.id}`, {
          productId: prod.id,
          slug: prod.slug,
          name: prod.name,
          price: prod.price,
          category: prod.categoryId,
        });
      }
    }).finally(() => {
      setIsLoading(false);
    });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 animate-pulse space-y-8">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-slate-200 rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 rounded w-1/3"></div>
            <div className="h-24 bg-slate-200 rounded w-full"></div>
            <div className="h-12 bg-slate-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The requested product could not be located in our database.</p>
        <Link
          to="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isComparing = isInCompare(product.id);

  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return;

    if (!user) {
      openAuthModal(`Please sign in to add "${product.name}" to your shopping cart.`, async () => {
        setIsAdding(true);
        const success = await addItem(product.id, quantity);
        setIsAdding(false);
        if (success) {
          setJustAdded(true);
          setTimeout(() => setJustAdded(false), 2000);
        }
      });
      return;
    }

    setIsAdding(true);
    const success = await addItem(product.id, quantity);
    setIsAdding(false);
    if (success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleToggleCompare = () => {
    if (isComparing) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  let featuresList: string[] = [];
  try {
    const raw = typeof product.features === 'string' ? JSON.parse(product.features) : product.features;
    featuresList = Array.isArray(raw) ? raw : [];
  } catch {
    featuresList = [];
  }

  const breadcrumbs = [
    ...(product.category
      ? [{ label: product.category.name, href: `/category/${product.category.slug}` }]
      : [{ label: 'Products', href: '/' }]),
    { label: product.name, href: `/product/${product.slug}` }
  ];

  return (
    <div className="space-y-8 pb-20">
      <Breadcrumb items={breadcrumbs} />

      {/* Main 2-Column Product Detail Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Left Column: Image */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 shadow-xs overflow-hidden relative group">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute top-8 left-8 bg-rose-600/95 backdrop-blur-xs text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              Currently Out of Stock
            </div>
          )}
        </div>

        {/* Right Column: Information & Actions */}
        <div className="space-y-6">
          <div>
            <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
              SKU #{product.id.toString().padStart(5, '0')}
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-3">
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} size="md" />
              <span className="text-xs text-slate-400">•</span>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="text-xs text-blue-600 hover:underline font-semibold"
                data-track="product_scroll_to_reviews"
              >
                Read {product.reviewCount} reviews
              </button>
            </div>
          </div>

          {/* Price & Stock */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block font-medium">Retail Price</span>
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <div className="text-right">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-100 border border-rose-200">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  In Stock ({product.stock} available)
                </span>
              )}
            </div>
          </div>

          {/* Description preview */}
          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          {/* Features highlight preview */}
          {featuresList.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Highlights:
              </span>
              <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-600">
                {featuresList.slice(0, 3).map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quantity Selector & Add to Cart */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Quantity:
              </span>
              <QuantityStepper
                value={quantity}
                max={Math.min(99, product.stock || 1)}
                disabled={isOutOfStock}
                onChange={(val) => setQuantity(val)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    : justAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white hover:shadow-blue-500/25'
                }`}
                data-track={`product_page_add_cart_${product.id}`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{isOutOfStock ? 'Currently Unavailable' : 'Add to Cart'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleToggleCompare}
                className={`py-3.5 px-5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  isComparing
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
                }`}
                data-track={`product_page_toggle_compare_${product.id}`}
              >
                {isComparing ? (
                  <>
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>In Compare List</span>
                  </>
                ) : (
                  <>
                    <Scale className="w-4 h-4 text-slate-500" />
                    <span>Add to Compare</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-500 font-medium">
            <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/50">
              <Truck className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <span>Free Delivery</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/50">
              <RotateCcw className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span>30-Day Returns</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/50">
              <ShieldCheck className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <span>2-Year Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Description | Specifications | Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden mt-12">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-50/70">
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`flex-1 py-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'description'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
            data-track="tab_description"
          >
            Description
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specifications')}
            className={`flex-1 py-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'specifications'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
            data-track="tab_specifications"
          >
            Specifications
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'reviews'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
            data-track="tab_reviews"
          >
            Customer Reviews ({product.reviewCount})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-10">
          {activeTab === 'description' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Product Overview</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
              </div>

              {featuresList.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-3">Key Features & Benefits</h4>
                  <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
                    {featuresList.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-2xl">
              <ProductSpecs specsJson={product.specs} />
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="max-w-3xl">
              <ProductReviews rating={product.rating} reviewCount={product.reviewCount} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
