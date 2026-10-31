import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CreditCard,
  Grid2X2,
  Heart,
  LogOut,
  MapPinned,
  Package,
  Settings,
  WalletCards,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useFavoriteStore } from '../store/favoriteStore';

type AccountSection = 'overview' | 'saved' | 'addresses' | 'payments' | 'settings';

interface AccountSectionPageProps {
  section: AccountSection;
}

const navigation = [
  { key: 'overview', label: 'Account overview', href: '/account', icon: Grid2X2 },
  { key: 'orders', label: 'Orders & tracking', href: '/orders', icon: Package },
  { key: 'saved', label: 'Saved items', href: '/account/saved', icon: Heart },
  { key: 'addresses', label: 'Addresses', href: '/account/addresses', icon: MapPinned },
  { key: 'payments', label: 'Payment methods', href: '/account/payments', icon: WalletCards },
  { key: 'settings', label: 'Account settings', href: '/account/settings', icon: Settings },
];

export const AccountSectionPage: React.FC<AccountSectionPageProps> = ({ section }) => {
  const { user, logout } = useAuthStore();
  const savedItems = useFavoriteStore((state) => state.items);
  const cart = useCartStore((state) => state.cart);
  const [savedAddress, setSavedAddress] = useState(false);
  const [savedPayment, setSavedPayment] = useState(false);
  const [savedSettings, setSavedSettings] = useState(false);

  const titles: Record<AccountSection, { title: string; description: string }> = {
    overview: { title: 'Account overview', description: 'Manage your shopping activity and account preferences.' },
    saved: { title: 'Saved items', description: 'Products you are comparing or want to revisit later.' },
    addresses: { title: 'Addresses', description: 'Keep your delivery details ready for checkout.' },
    payments: { title: 'Payment methods', description: 'Manage the payment details used for your orders.' },
    settings: { title: 'Account settings', description: 'Update your profile and communication preferences.' },
  };
  const current = titles[section];

  return (
    <div className="space-y-5 pb-20 max-w-7xl mx-auto">
      <div className="rounded-2xl bg-blue-50 px-5 py-5 sm:px-7 sm:py-6">
        <p className="text-[11px] font-semibold text-blue-600">My account</p>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">{current.title}</h1>
        <p className="text-xs text-slate-500 mt-1">{current.description}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] items-start">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="px-1 pb-4 border-b border-slate-100">
            <p className="font-bold text-slate-900">{user?.name || 'Shopper'}</p>
            <p className="text-[11px] text-slate-500 mt-1 truncate">{user?.email || 'shopper@shopsim.test'}</p>
          </div>
          <nav className="pt-3 space-y-1 text-xs font-semibold">
            {navigation.map(({ key, label, href, icon: Icon }) => (
              <Link
                key={key}
                to={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 ${
                  key === section ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${key === section ? '' : 'text-slate-400'}`} />
                {label}
              </Link>
            ))}
            <div className="border-t border-slate-100 pt-2 mt-2">
              <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-slate-500 hover:bg-slate-50 text-left">
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </nav>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-xs">
          {section === 'overview' && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Link to="/orders" className="rounded-xl bg-blue-50 p-5 hover:bg-blue-100">
                <Package className="w-5 h-5 text-blue-600 mb-4" />
                <p className="font-bold text-slate-900">Orders & tracking</p>
                <p className="text-xs text-slate-500 mt-1">Review deliveries and buy items again.</p>
              </Link>
              <Link to="/account/saved" className="rounded-xl bg-rose-50 p-5 hover:bg-rose-100">
                <Heart className="w-5 h-5 text-rose-500 mb-4" />
                <p className="font-bold text-slate-900">{savedItems.length} saved items</p>
                <p className="text-xs text-slate-500 mt-1">Return to products you are comparing.</p>
              </Link>
              <Link to="/cart" className="rounded-xl bg-emerald-50 p-5 hover:bg-emerald-100">
                <WalletCards className="w-5 h-5 text-emerald-600 mb-4" />
                <p className="font-bold text-slate-900">{cart.itemCount} cart items</p>
                <p className="text-xs text-slate-500 mt-1">Continue shopping and checkout.</p>
              </Link>
            </div>
          )}

          {section === 'saved' && (
            savedItems.length > 0 ? (
              <div className="space-y-3">
                {savedItems.map((item) => (
                  <Link key={item.id} to={`/product/${item.slug}`} className="flex items-center gap-4 rounded-xl border border-slate-200 p-3 hover:border-blue-300">
                    <img src={item.image} alt="" className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 mt-1">${item.price.toFixed(2)}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
                  </Link>
                ))}
              </div>
            ) : <EmptyState text="No saved items yet. Add products to comparison to find them here." href="/compare" label="Browse comparisons" />
          )}

          {section === 'addresses' && (
            <form className="max-w-xl space-y-4" onSubmit={(event) => { event.preventDefault(); setSavedAddress(true); }}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input required placeholder="First name" className="account-input" />
                <input required placeholder="Last name" className="account-input" />
              </div>
              <input required placeholder="Street address" className="account-input w-full" />
              <div className="grid gap-4 sm:grid-cols-3">
                <input required placeholder="City" className="account-input" />
                <input required placeholder="State" className="account-input" />
                <input required placeholder="ZIP code" className="account-input" />
              </div>
              <button className="account-button" type="submit">{savedAddress ? <><Check className="w-4 h-4" /> Address saved</> : 'Save address'}</button>
            </form>
          )}

          {section === 'payments' && (
            <form className="max-w-xl space-y-4" onSubmit={(event) => { event.preventDefault(); setSavedPayment(true); }}>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div><p className="text-sm font-bold text-slate-900">Secure payment details</p><p className="text-xs text-slate-500">Your payment information is protected.</p></div>
              </div>
              <input required placeholder="Cardholder name" className="account-input w-full" />
              <input required placeholder="Card number" inputMode="numeric" className="account-input w-full" />
              <div className="grid gap-4 sm:grid-cols-2">
                <input required placeholder="MM / YY" className="account-input" />
                <input required placeholder="CVC" inputMode="numeric" className="account-input" />
              </div>
              <button className="account-button" type="submit">{savedPayment ? <><Check className="w-4 h-4" /> Payment method saved</> : 'Save payment method'}</button>
            </form>
          )}

          {section === 'settings' && (
            <form className="max-w-xl space-y-4" onSubmit={(event) => { event.preventDefault(); setSavedSettings(true); }}>
              <input required defaultValue={user?.name || ''} placeholder="Full name" className="account-input w-full" />
              <input required type="email" defaultValue={user?.email || ''} placeholder="Email address" className="account-input w-full" />
              <label className="flex items-center gap-3 text-sm text-slate-600"><input type="checkbox" defaultChecked className="accent-blue-600" /> Send me order and delivery updates</label>
              <button className="account-button" type="submit">{savedSettings ? <><Check className="w-4 h-4" /> Settings saved</> : 'Save settings'}</button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};

const EmptyState: React.FC<{ text: string; href: string; label: string }> = ({ text, href, label }) => (
  <div className="text-center py-12">
    <Heart className="w-8 h-8 text-slate-300 mx-auto mb-3" />
    <p className="text-sm text-slate-500 max-w-sm mx-auto">{text}</p>
    <Link to={href} className="inline-flex items-center gap-2 mt-5 account-button">{label}<ArrowRight className="w-3.5 h-3.5" /></Link>
  </div>
);
