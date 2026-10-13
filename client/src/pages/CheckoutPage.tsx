import React, { useEffect } from 'react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { CheckoutWizard } from '../components/checkout/CheckoutWizard';

export const CheckoutPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Checkout - ShopSim';
  }, []);

  const breadcrumbs = [
    { label: 'Cart', href: '/cart' },
    { label: 'Checkout', href: '/checkout' },
  ];

  return (
    <div className="space-y-6 pb-20">
      <Breadcrumb items={breadcrumbs} />

      <div className="text-center max-w-lg mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete the guided steps below to verify your study scenario checkout flow.
        </p>
      </div>

      <CheckoutWizard />
    </div>
  );
};
