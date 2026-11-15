import React, { useEffect, useMemo, useState } from 'react';
import { Clipboard, Copy, Download, Edit3, Eye, EyeOff, Package, Plus, Search, Trash2, X } from 'lucide-react';
import { AdminShell } from '../../components/admin/AdminShell';
import type { Category, Product } from '../../types';

type Spec = { key: string; value: string };
type AdminOrder = {
  id: number;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
  customer: { fullName: string; email: string; phone: string; address: string; city: string; state: string; zipCode: string; country: string };
  payment: { paymentMethod: string; cardType: string; cardLast4: string; cardholderName: string };
  items: Array<{ name: string; quantity: number; price: number }>;
};
type ProductForm = {
  name: string;
  slug: string;
  description: string;
  price: string;
  image: string;
  images: string;
  categoryId: string;
  stock: string;
  specs: Spec[];
  features: string;
};

const emptyForm: ProductForm = {
  name: '', slug: '', description: '', price: '', image: '', images: '',
  categoryId: '', stock: '25', specs: [{ key: '', value: '' }], features: '',
};

const parseJson = <T,>(value: unknown, fallback: T): T => {
  if (typeof value !== 'string') return (value as T) || fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
};

const toForm = (product: Product): ProductForm => {
  const images = parseJson<string[]>(product.images, []);
  const specs = parseJson<Record<string, string>>(product.specs, {});
  return {
    name: product.name, slug: product.slug, description: product.description,
    price: String(product.price), image: product.image, images: images.join(', '),
    categoryId: String(product.categoryId), stock: String(product.stock),
    specs: Object.entries(specs).map(([key, value]) => ({ key, value })) || [{ key: '', value: '' }],
    features: parseJson<string[]>(product.features, []).join(', '),
  };
};

export const AdminCatalogPage: React.FC = () => {
  const [tab, setTab] = useState<'products' | 'categories' | 'orders'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState('');
  const [stockOnly, setStockOnly] = useState(false);
  const [productModal, setProductModal] = useState<Product | 'new' | null>(null);
  const [categoryModal, setCategoryModal] = useState<Category | 'new' | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showSensitive, setShowSensitive] = useState(false);

  const load = async () => {
    try {
      const [productRes, categoryRes, orderRes] = await Promise.all([
        fetch('/api/admin/products'), fetch('/api/admin/categories'), fetch('/api/admin/orders'),
      ]);
      if (!productRes.ok || !categoryRes.ok || !orderRes.ok) throw new Error('Unable to load catalog');
      const [productJson, categoryJson, orderJson] = await Promise.all([productRes.json(), categoryRes.json(), orderRes.json()]);
      setProducts(productJson.data || []);
      setCategories(categoryJson.data || []);
      setOrders(orderJson.data || []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load catalog'); }
  };

  useEffect(() => { void load(); }, []);

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.name} ${product.slug}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (!stockOnly || product.stock > 0);
  }), [products, search, stockOnly]);

  const saveProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    const specs = Object.fromEntries(form.specs.filter((item) => item.key.trim()).map((item) => [item.key.trim(), item.value]));
    const payload = {
      name: form.name, slug: form.slug, description: form.description, price: Number(form.price),
      image: form.image, images: form.images.split(',').map((item) => item.trim()).filter(Boolean),
      categoryId: Number(form.categoryId), stock: Number(form.stock), specs,
      features: form.features.split(',').map((item) => item.trim()).filter(Boolean),
    };
    const id = productModal !== 'new' && productModal ? productModal.id : null;
    const response = await fetch(`/api/admin/products${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    if (!response.ok) { setError('Unable to save product'); return; }
    setProductModal(null); await load();
  };

  const toggleStock = async (product: Product) => {
    const response = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stock: product.stock > 0 ? 0 : 25 }),
    });
    if (!response.ok) setError('Unable to update stock');
    else await load();
  };

  const removeProduct = async (id: number) => {
    if (!window.confirm('Remove this product?')) return;
    const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (!response.ok) setError('Unable to remove product'); else await load();
  };

  const saveCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    const id = categoryModal !== 'new' && categoryModal ? categoryModal.id : null;
    const response = await fetch(`/api/admin/categories${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryName, slug: categorySlug || undefined }),
    });
    if (!response.ok) { setError('Unable to save category'); return; }
    setCategoryModal(null); await load();
  };

  const removeCategory = async (id: number) => {
    if (!window.confirm('Remove this category and its products?')) return;
    const response = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (!response.ok) setError('Unable to remove category'); else await load();
  };

  const openProduct = (product: Product | 'new') => {
    setForm(product === 'new' ? { ...emptyForm, categoryId: String(categories[0]?.id || '') } : toForm(product));
    setProductModal(product);
  };
  const openCategory = (category: Category | 'new') => {
    setCategoryName(category === 'new' ? '' : category.name);
    setCategorySlug(category === 'new' ? '' : category.slug);
    setCategoryModal(category);
  };

  const exportOrders = (format: 'json' | 'csv') => {
    const data = format === 'json'
      ? JSON.stringify(orders, null, 2)
      : ['Order,Date,Customer,Email,Total,Payment,Last 4', ...orders.map((order) => [
        order.orderNumber, order.createdAt, order.customer.fullName, order.customer.email,
        order.total, order.payment.paymentMethod, order.payment.cardLast4,
      ].map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' }));
    link.download = `shopsim-orders.${format}`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const copyOrders = async () => {
    await navigator.clipboard.writeText(JSON.stringify(orders, null, 2));
  };

  return (
    <AdminShell>
      <div className="space-y-5 pb-16">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-5">
          <div><p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-blue-600">Catalog</p><h1 className="text-2xl font-black tracking-tight text-slate-950">Products & Categories</h1><p className="mt-1 text-sm text-slate-500">Manage the storefront catalog and comparison specifications.</p></div>
          {tab !== 'orders' && <button type="button" onClick={() => tab === 'products' ? openProduct('new') : openCategory('new')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Add {tab === 'products' ? 'product' : 'category'}</button>}
        </header>
        {error && <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}<button type="button" onClick={() => setError('')}><X className="h-4 w-4" /></button></div>}
        <div className="flex flex-wrap gap-2 border-b border-slate-200"><button type="button" onClick={() => setTab('products')} className={`px-4 py-2 text-sm font-bold ${tab === 'products' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500'}`}>Products ({products.length})</button><button type="button" onClick={() => setTab('categories')} className={`px-4 py-2 text-sm font-bold ${tab === 'categories' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500'}`}>Categories ({categories.length})</button><button type="button" onClick={() => setTab('orders')} className={`px-4 py-2 text-sm font-bold ${tab === 'orders' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-slate-500'}`}>Orders & Payment Details ({orders.length})</button></div>
        {tab === 'products' ? <section className="space-y-4">
          <div className="flex flex-wrap gap-3"><label className="relative min-w-[240px] flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm" /></label><label className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600"><input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} className="accent-blue-600" /> In stock only</label></div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-100">{visibleProducts.map((product) => <div key={product.id} className="flex flex-wrap items-center gap-3 p-4"><div className="flex min-w-0 flex-1 items-center gap-3"><img src={product.image} alt="" className="h-12 w-12 rounded-lg object-cover bg-slate-100" /><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{product.name}</p><p className="text-xs text-slate-500">{product.category?.name || 'Uncategorized'} · ${product.price.toFixed(2)} · Stock: {product.stock}</p></div></div><button type="button" onClick={() => void toggleStock(product)} className={`rounded-full px-3 py-1 text-[11px] font-bold ${product.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{product.stock > 0 ? 'In stock' : 'Out of stock'}</button><button type="button" onClick={() => openProduct(product)} aria-label={`Edit ${product.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Edit3 className="h-4 w-4" /></button><button type="button" onClick={() => void removeProduct(product.id)} aria-label={`Remove ${product.name}`} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div>)}{visibleProducts.length === 0 && <div className="p-10 text-center text-sm text-slate-500"><Package className="mx-auto mb-2 h-6 w-6" />No products match these filters.</div>}</div></div>
        </section> : tab === 'categories' ? <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-100">{categories.map((category) => <div key={category.id} className="flex items-center gap-3 p-4"><div className="flex-1"><p className="text-sm font-bold text-slate-900">{category.name}</p><p className="text-xs text-slate-500">/{category.slug} · {category._count?.products ?? 0} products</p></div><button type="button" onClick={() => openCategory(category)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Edit3 className="h-4 w-4" /></button><button type="button" onClick={() => void removeCategory(category.id)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div>)}{categories.length === 0 && <p className="p-10 text-center text-sm text-slate-500">No categories yet.</p>}</div></section> : <section className="space-y-4"><div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={() => exportOrders('csv')} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold"><Download className="h-3.5 w-3.5" /> Extract CSV</button><button type="button" onClick={() => exportOrders('json')} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold"><Download className="h-3.5 w-3.5" /> Extract JSON</button><button type="button" onClick={() => void copyOrders()} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold"><Copy className="h-3.5 w-3.5" /> Copy Data</button><button type="button" onClick={() => setShowSensitive((value) => !value)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold">{showSensitive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {showSensitive ? 'Mask Card' : 'Show Card'}</button></div><div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="divide-y divide-slate-100">{orders.map((order) => <button type="button" key={order.id} onClick={() => setSelectedOrder(order)} className="flex w-full flex-wrap items-center gap-3 p-4 text-left hover:bg-slate-50"><div className="flex-1"><p className="text-sm font-bold text-slate-900">{order.orderNumber} · {order.customer.fullName}</p><p className="text-xs text-slate-500">{order.customer.email || 'No email'} · {new Date(order.createdAt).toLocaleString()}</p></div><span className="text-xs font-bold text-slate-700">${order.total.toFixed(2)}</span><span className="text-xs text-slate-500">{order.payment.paymentMethod} · •••• {showSensitive ? order.payment.cardLast4 || 'N/A' : '••••'}</span></button>)}</div>{orders.length === 0 && <p className="p-10 text-center text-sm text-slate-500"><Clipboard className="mx-auto mb-2 h-6 w-6" />No orders yet.</p>}</div></section>}
      </div>
      {selectedOrder && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><div className="max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-xl bg-white p-5 shadow-xl"><div className="flex items-center justify-between"><div><h2 className="text-lg font-black">Order {selectedOrder.orderNumber}</h2><p className="text-xs text-slate-500">{new Date(selectedOrder.createdAt).toLocaleString()}</p></div><button type="button" onClick={() => setSelectedOrder(null)}><X /></button></div><div className="grid gap-4 sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-4 text-xs"><h3 className="mb-2 font-bold text-slate-700">Customer & address</h3><p className="font-bold">{selectedOrder.customer.fullName}</p><p>{selectedOrder.customer.email}</p><p>{selectedOrder.customer.phone}</p><p className="mt-2">{selectedOrder.customer.address}</p><p>{selectedOrder.customer.city}, {selectedOrder.customer.state} {selectedOrder.customer.zipCode}</p><p>{selectedOrder.customer.country}</p></div><div className="rounded-lg bg-slate-50 p-4 text-xs"><h3 className="mb-2 font-bold text-slate-700">Payment details</h3><p><strong>Method:</strong> {selectedOrder.payment.paymentMethod}</p><p><strong>Type:</strong> {selectedOrder.payment.cardType}</p><p><strong>Cardholder:</strong> {selectedOrder.payment.cardholderName}</p><p><strong>Card:</strong> •••• •••• •••• {showSensitive ? selectedOrder.payment.cardLast4 || 'Unavailable' : '••••'}</p><p className="mt-2 text-[11px] text-slate-500">Full card numbers and CVV are never stored or displayed.</p></div></div><div><h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-700">Items</h3><div className="divide-y rounded-lg border border-slate-200">{selectedOrder.items.map((item, index) => <div key={`${item.name}-${index}`} className="flex justify-between p-3 text-xs"><span>{item.name} × {item.quantity}</span><strong>${Number(item.price).toFixed(2)}</strong></div>)}</div></div><div className="flex justify-end"><button type="button" onClick={() => setSelectedOrder(null)} className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white">Close</button></div></div></div>}
      {productModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><form onSubmit={saveProduct} className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-xl bg-white p-5 shadow-xl"><div className="flex items-center justify-between"><h2 className="text-lg font-black">{productModal === 'new' ? 'Add product' : 'Edit product'}</h2><button type="button" onClick={() => setProductModal(null)}><X /></button></div><div className="grid gap-3 sm:grid-cols-2">{(['name', 'slug', 'price', 'image', 'images', 'stock'] as const).map((field) => <label key={field} className="text-xs font-bold capitalize text-slate-600">{field}<input required={['name', 'slug', 'price'].includes(field)} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" placeholder={field === 'images' ? 'Comma-separated URLs' : ''} /></label>)}<label className="text-xs font-bold text-slate-600">Category<select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal"><option value="">Select category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label></div><label className="block text-xs font-bold text-slate-600">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label><div><div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600">Comparison specs (Key : Value)<button type="button" onClick={() => setForm({ ...form, specs: [...form.specs, { key: '', value: '' }] })} className="text-blue-600">+ Add spec</button></div>{form.specs.map((spec, index) => <div key={index} className="mb-2 flex gap-2"><input value={spec.key} onChange={(e) => { const specs = [...form.specs]; specs[index] = { ...spec, key: e.target.value }; setForm({ ...form, specs }); }} placeholder="Key" className="w-1/3 rounded-lg border border-slate-200 px-3 py-2 text-sm" /><input value={spec.value} onChange={(e) => { const specs = [...form.specs]; specs[index] = { ...spec, value: e.target.value }; setForm({ ...form, specs }); }} placeholder="Value" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm" /></div>)}</div><label className="block text-xs font-bold text-slate-600">Features (comma-separated)<input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label><button className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white">Save product</button></form></div>}
      {categoryModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"><form onSubmit={saveCategory} className="w-full max-w-md space-y-4 rounded-xl bg-white p-5 shadow-xl"><div className="flex items-center justify-between"><h2 className="text-lg font-black">{categoryModal === 'new' ? 'Add category' : 'Edit category'}</h2><button type="button" onClick={() => setCategoryModal(null)}><X /></button></div><label className="block text-xs font-bold text-slate-600">Name<input required value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label><label className="block text-xs font-bold text-slate-600">Slug<input value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal" /></label><button className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-bold text-white">Save category</button></form></div>}
    </AdminShell>
  );
};
