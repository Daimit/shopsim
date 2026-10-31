import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { tracker } from '../lib/tracker';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  ShoppingBag,
  CreditCard,
  MapPin,
  Calendar,
  Grid2X2,
  Heart,
  MapPinned,
  WalletCards,
  Settings,
  LogOut,
  MessageCircle,
  ChevronDown,
  Printer
} from 'lucide-react';
import { Breadcrumb } from '../components/layout/Breadcrumb';

interface OrderItem {
  productId?: number;
  name: string;
  slug?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderRecord {
  id: number;
  sessionId: string;
  totalAmount: number;
  discountAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  shippingData?: {
    fullName?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    carrier?: string;
    items?: OrderItem[];
  };
  items?: OrderItem[];
}

export const OrdersPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { addItem } = useCartStore();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = 'ShopSim - My Orders';
    tracker.track('page_view', 'orders_page', { user: user?.email });

    api.getOrders()
      .then((data: any) => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch((err) => {
        console.warn('Error fetching orders:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user]);

  const handleReorder = async (productId?: number) => {
    if (productId) {
      await addItem(productId, 1);
      tracker.track('reorder_item', `product_${productId}`, { productId });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Delivered
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Truck className="w-3.5 h-3.5 text-blue-600" />
            In Transit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Processing
          </span>
        );
    }
  };

  const getTrackingSteps = (status: string) => {
    const isDelivered = status?.toLowerCase() === 'delivered';
    const isInTransit = isDelivered || status?.toLowerCase() === 'in_transit';
    const isConfirmed = true;

    return [
      { label: 'Order Confirmed', completed: isConfirmed, active: false },
      { label: 'Processing & Packed', completed: isInTransit, active: false },
      { label: 'Out for Delivery', completed: isInTransit, active: isInTransit && !isDelivered },
      { label: 'Delivered', completed: isDelivered, active: isDelivered },
    ];
  };

  return (
    <div className="space-y-5 pb-20 max-w-7xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'My Account' },
          { label: 'My Orders & Tracking' },
        ]}
      />

      <section className="rounded-2xl bg-blue-50 px-5 py-5 sm:px-7 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold text-blue-600">Welcome back, {user?.name?.split(' ')[0] || 'Shopper'}.</p>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">My Orders & Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">Your delivery updates, all in one place. Track, revisit, and reorder your favorites.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-full bg-white px-3 py-2 text-[11px] font-bold text-emerald-700 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Delivered orders
        </span>
      </section>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)] items-start">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="px-1 pb-4 border-b border-slate-100">
              <p className="font-bold text-slate-900">{user?.name || 'Shopper'}</p>
              <p className="text-[11px] text-slate-500 mt-1 truncate">{user?.email || 'shopper@shopsim.test'}</p>
            </div>
            <nav className="pt-3 space-y-1 text-xs font-semibold">
              <Link to="/account" className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-600 hover:bg-slate-50"><Grid2X2 className="w-4 h-4 text-slate-400" /> Account overview</Link>
              <Link to="/orders" className="flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-3 text-blue-600"><Package className="w-4 h-4" /> Orders & tracking</Link>
              <Link to="/account/saved" className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-600 hover:bg-slate-50"><Heart className="w-4 h-4 text-slate-400" /> Saved items</Link>
              <Link to="/account/addresses" className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-600 hover:bg-slate-50"><MapPinned className="w-4 h-4 text-slate-400" /> Addresses</Link>
              <Link to="/account/payments" className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-600 hover:bg-slate-50"><WalletCards className="w-4 h-4 text-slate-400" /> Payment methods</Link>
              <Link to="/account/settings" className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-600 hover:bg-slate-50"><Settings className="w-4 h-4 text-slate-400" /> Account settings</Link>
              <div className="border-t border-slate-100 pt-2 mt-2">
                <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-slate-500 hover:bg-slate-50 text-left"><LogOut className="w-4 h-4" /> Sign out</button>
              </div>
            </nav>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <MessageCircle className="w-5 h-5 text-blue-600 mb-3" />
            <p className="text-xs font-bold text-slate-800">Need a little help?</p>
            <p className="text-[11px] text-slate-500 mt-1">Questions about an order or a return? We’re here for you.</p>
            <Link to="/" className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 mt-3">Contact support <ArrowRight className="w-3 h-3" /></Link>
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your delivered orders</h2>
              <p className="text-[11px] text-slate-500 mt-1">{orders.length} orders • {orders.reduce((sum, order) => sum + ((order.items || order.shippingData?.items || []).length), 0)} items, thoughtfully chosen.</p>
            </div>
            <button type="button" className="inline-flex items-center justify-between gap-5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-xs">
              Last 3 months <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Loading your order history...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Orders Placed Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't completed any orders yet in this test session. Add products to cart and complete checkout to see real tracking data.
          </p>
          <Link
            to="/category/electronics"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const shipping = order.shippingData || {};
            const items = (shipping.items && shipping.items.length > 0)
              ? shipping.items
              : (order.items && order.items.length > 0)
              ? order.items
              : [];
            const steps = getTrackingSteps(order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all hover:shadow-md"
              >
                {/* Order Top Bar */}
                <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">
                        Order Placed
                      </span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="border-l border-slate-200 pl-4">
                      <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">
                        Total Amount
                      </span>
                      <span className="font-bold text-slate-900 mt-0.5 block">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="border-l border-slate-200 pl-4">
                      <span className="text-slate-400 block uppercase font-bold tracking-wider text-[10px]">
                        Ship To
                      </span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {shipping.fullName || 'Shopper'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <span className="text-xs font-mono font-semibold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      ORD-{order.id}
                    </span>
                  </div>
                </div>

                {/* Tracking Stepper */}
                <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/40">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-slate-800">
                        {shipping.carrier || 'FedEx Express'} &bull;
                      </span>
                      <span className="font-mono text-slate-500">
                        {shipping.trackingNumber || `TRK-${order.id}829-US`}
                      </span>
                    </div>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {shipping.estimatedDelivery || 'Estimated Delivery: In 2 Days'}
                    </span>
                  </div>

                  {/* Visual Stepper */}
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {steps.map((st, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-colors ${
                            st.completed ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        />
                        <p
                          className={`text-[11px] font-semibold truncate ${
                            st.completed ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {st.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Item List */}
                <div className="p-4 sm:p-6 divide-y divide-slate-100">
                  {items.length > 0 ? (
                    items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <Package className="w-6 h-6" />
                            </div>
                          )}

                          <div>
                            <h4 className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">
                              {item.slug ? (
                                <Link to={`/product/${item.slug}`}>{item.name}</Link>
                              ) : (
                                item.name
                              )}
                            </h4>
                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                              <span>Qty: <strong>{item.quantity}</strong></span>
                              <span>&bull;</span>
                              <span>Price: <strong>${item.price.toFixed(2)}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {item.slug && (
                            <Link
                              to={`/product/${item.slug}`}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                            >
                              <span>View Product</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                          {item.productId && (
                            <button
                              type="button"
                              onClick={() => handleReorder(item.productId)}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Buy Again</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-3 text-xs text-slate-500 italic">
                      Order details confirmed. Standard packaging applied.
                    </div>
                  )}
                </div>

                {/* Footer details */}
                <div className="px-4 sm:px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      Paid via {order.paymentMethod?.replace('_', ' ').toUpperCase() || 'CREDIT CARD'}
                    </span>
                    {order.discountAmount > 0 && (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        Saved ${order.discountAmount.toFixed(2)} with discount
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <Printer className="w-3.5 h-3.5 inline mr-1" />
                    Print Invoice
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
        </section>
      </div>
    </div>
  );
};
