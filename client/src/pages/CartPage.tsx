import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { CartItem } from '../components/cart/CartItem';
import { CartSummary } from '../components/cart/CartSummary';
import { useCartStore } from '../store/cartStore';
import { ShoppingCart, ShoppingBag, ArrowLeft } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, fetchCart } = useCartStore();

  useEffect(() => {
    document.title = 'Shopping Cart - ShopSim';
    fetchCart();
  }, [fetchCart]);

  const breadcrumbs = [
    { label: 'Shopping Cart', href: '/cart' }
  ];

  if (cart.items.length === 0) {
    return (
      <div className="space-y-6 pb-8">
        <Breadcrumb items={breadcrumbs} />

        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-12 shadow-2xs">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-sm text-slate-500 mb-6">
            Looks like you haven't added any products to your shopping cart yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg transition-colors shadow-xs"
            data-track="cart_continue_shopping"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb items={breadcrumbs} />

      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            You have <strong className="text-slate-800">{cart.itemCount}</strong> items in your cart
          </p>
        </div>

        <Link
          to="/"
          className="text-xs sm:text-sm text-blue-600 hover:underline font-semibold flex items-center gap-1"
          data-track="cart_back_shopping"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {/* 70% / 30% responsive layout */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Cart items list (70%) */}
        <div className="w-full lg:w-[68%] space-y-3">
          {cart.items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Summary (30%) */}
        <div className="w-full lg:w-[32%]">
          <CartSummary />
        </div>
      </div>
    </div>
  );
};
