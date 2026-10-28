import {
  Category,
  Product,
  Cart,
  DiscountCode,
  Order,
  InteractionEvent,
  TestSession,
  ProductFilters,
  User,
  AuthResponse,
  DemoAccount
} from '../types';

const API_BASE_URL = '/api';

// Helper to safely unwrap backend response { success: true, data: T }
async function handleResponse<T>(res: Response, fallbackValue: T): Promise<T> {
  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    const msg = errorJson?.error || errorJson?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const json = await res.json();
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T;
  }
  return (json || fallbackValue) as T;
}

// In-memory cart store for local mock fallback
let mockCartData: Cart = {
  id: 'session-cart-default',
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  itemCount: 0
};

const VALID_DISCOUNTS: Record<string, DiscountCode> = {
  'SAVE20': { id: 1, code: 'SAVE20', type: 'percentage', value: 20 },
  'WELCOME10': { id: 2, code: 'WELCOME10', type: 'fixed', value: 10 },
  'HALF50': { id: 3, code: 'HALF50', type: 'percentage', value: 50 },
  'FREESHIP': { id: 4, code: 'FREESHIP', type: 'fixed', value: 0 }
};

function calculateMockCartTotals(cart: Cart): Cart {
  const subtotal = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  let discount = 0;

  if (cart.discountCode && VALID_DISCOUNTS[cart.discountCode]) {
    const dc = VALID_DISCOUNTS[cart.discountCode];
    if (dc.type === 'percentage') {
      discount = (subtotal * dc.value) / 100;
    } else {
      discount = Math.min(subtotal, dc.value);
    }
  }

  const roundedSub = Math.round(subtotal * 100) / 100;
  const roundedDisc = Math.round(discount * 100) / 100;
  const total = Math.max(0, Math.round((roundedSub - roundedDisc) * 100) / 100);

  return {
    ...cart,
    subtotal: roundedSub,
    discount: roundedDisc,
    total,
    itemCount
  };
}

export const api = {
  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      const data = await handleResponse<Category[]>(res, []);
      if (Array.isArray(data)) return data;
    } catch (err) {
      console.warn('Failed to fetch categories from server, using fallback', err);
    }
    return [];
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${encodeURIComponent(slug)}`);
      if (res.ok) {
        const cat = await handleResponse<Category>(res, null as any);
        if (cat) return cat;
      }
    } catch {
      // ignore and fallback
    }

    // Try finding in full category tree
    const all = await this.getCategories();
    for (const c of all) {
      if (c.slug === slug) return c;
      const child = c.children?.find(ch => ch.slug === slug);
      if (child) return child;
    }
    return null;
  },

  // --- PRODUCTS ---
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      const query = new URLSearchParams();
      if (filters?.categorySlug) query.append('category', filters.categorySlug);
      if (filters?.categoryId) query.append('categoryId', filters.categoryId.toString());
      if (filters?.search) query.append('q', filters.search);
      if (filters?.minPrice !== undefined && filters.minPrice !== null) query.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined && filters.maxPrice !== null) query.append('maxPrice', filters.maxPrice.toString());
      if (filters?.minRating !== undefined && filters.minRating !== null) query.append('minRating', filters.minRating.toString());
      if (filters?.sortBy) query.append('sort', filters.sortBy);
      query.append('limit', '50'); // Fetch ample products for catalog view

      const res = await fetch(`${API_BASE_URL}/products?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        const data = json?.data;
        if (data && Array.isArray(data.products)) {
          let prods: Product[] = data.products;
          if (filters?.subcategoryId) {
            prods = prods.filter(p => p.categoryId === filters.subcategoryId);
          }
          if (filters?.inStockOnly) {
            prods = prods.filter(p => p.stock > 0);
          }
          return prods;
        } else if (Array.isArray(data)) {
          return data;
        }
      }
    } catch (err) {
      console.warn('Failed to fetch products from server', err);
    }

    return [];
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(slug)}`);
      if (res.ok) {
        return await handleResponse<Product>(res, null as any);
      }
    } catch (err) {
      console.warn(`Failed to fetch product by slug ${slug}`, err);
    }
    return null;
  },

  async getProductById(id: number): Promise<Product | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`);
      if (res.ok) {
        return await handleResponse<Product>(res, null as any);
      }
    } catch {
      // fallback
    }
    return null;
  },

  async getProductsCompare(ids: number[]): Promise<Product[]> {
    if (!ids.length) return [];
    try {
      const res = await fetch(`${API_BASE_URL}/products/compare?ids=${ids.join(',')}`);
      if (res.ok) {
        return await handleResponse<Product[]>(res, []);
      }
    } catch (err) {
      console.warn('Failed to fetch comparison products', err);
    }
    return [];
  },

  // --- CART ---
  async getCart(sessionId: string): Promise<Cart> {
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${encodeURIComponent(sessionId)}`);
      if (res.ok) {
        return await handleResponse<Cart>(res, mockCartData);
      }
    } catch (err) {
      console.warn('Failed to fetch cart from server, using local fallback', err);
    }
    mockCartData.id = sessionId;
    return calculateMockCartTotals(mockCartData);
  },

  async addToCart(sessionId: string, productId: number, quantity = 1): Promise<Cart> {
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${encodeURIComponent(sessionId)}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity })
      });
      if (res.ok) {
        return await handleResponse<Cart>(res, mockCartData);
      }
    } catch (err) {
      console.warn('Failed to add to cart via server', err);
    }

    // Local fallback
    const prod = await this.getProductById(productId);
    if (!prod) throw new Error('Product not found');

    const existingIndex = mockCartData.items.findIndex(i => i.productId === productId);
    if (existingIndex >= 0) {
      mockCartData.items[existingIndex].quantity += quantity;
    } else {
      mockCartData.items.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        sessionId,
        productId,
        quantity,
        product: prod
      });
    }
    mockCartData = calculateMockCartTotals(mockCartData);
    return mockCartData;
  },

  async updateCartItem(sessionId: string, itemId: number, quantity: number): Promise<Cart> {
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${encodeURIComponent(sessionId)}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      if (res.ok) {
        return await handleResponse<Cart>(res, mockCartData);
      }
    } catch (err) {
      console.warn('Failed to update cart item via server', err);
    }

    const item = mockCartData.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = quantity;
    }
    mockCartData = calculateMockCartTotals(mockCartData);
    return mockCartData;
  },

  async removeCartItem(sessionId: string, itemId: number): Promise<Cart> {
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${encodeURIComponent(sessionId)}/items/${itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return await handleResponse<Cart>(res, mockCartData);
      }
    } catch (err) {
      console.warn('Failed to remove cart item via server', err);
    }

    mockCartData.items = mockCartData.items.filter(i => i.id !== itemId);
    mockCartData = calculateMockCartTotals(mockCartData);
    return mockCartData;
  },

  async applyDiscount(sessionId: string, code: string): Promise<Cart> {
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${encodeURIComponent(sessionId)}/discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (res.ok) {
        return await handleResponse<Cart>(res, mockCartData);
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Invalid discount code');
      }
    } catch (err: any) {
      const upper = code.toUpperCase().trim();
      if (VALID_DISCOUNTS[upper]) {
        mockCartData.discountCode = upper;
        mockCartData = calculateMockCartTotals(mockCartData);
        return mockCartData;
      }
      throw new Error(err?.message || 'Invalid discount code');
    }
  },

  async removeDiscount(sessionId: string): Promise<Cart> {
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${encodeURIComponent(sessionId)}/discount`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return await handleResponse<Cart>(res, mockCartData);
      }
    } catch (err) {
      console.warn('Failed to remove discount on server', err);
    }

    delete mockCartData.discountCode;
    mockCartData = calculateMockCartTotals(mockCartData);
    return mockCartData;
  },

  async clearCart(sessionId: string): Promise<Cart> {
    try {
      const res = await fetch(`${API_BASE_URL}/cart/${encodeURIComponent(sessionId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        return await handleResponse<Cart>(res, mockCartData);
      }
    } catch {
      // fallback
    }
    mockCartData = {
      id: sessionId,
      items: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      itemCount: 0
    };
    return mockCartData;
  },

  // --- ORDERS / CHECKOUT ---
  async createOrder(data: {
    sessionId: string;
    shippingData: any;
    paymentMethod: string;
  }): Promise<Order> {
    try {
      const res = await fetch(`${API_BASE_URL}/checkout/${encodeURIComponent(data.sessionId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingData: data.shippingData,
          paymentMethod: data.paymentMethod
        })
      });
      if (res.ok) {
        return await handleResponse<Order>(res, null as any);
      }
    } catch (err) {
      console.warn('Failed to place order on server, using fallback', err);
    }

    const order: Order = {
      id: Math.floor(100000 + Math.random() * 900000),
      sessionId: data.sessionId,
      totalAmount: mockCartData.total,
      discountAmount: mockCartData.discount,
      shippingData: data.shippingData,
      paymentMethod: data.paymentMethod,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      items: [...mockCartData.items]
    };
    mockCartData.items = [];
    mockCartData.subtotal = 0;
    mockCartData.discount = 0;
    mockCartData.total = 0;
    mockCartData.itemCount = 0;
    return order;
  },

  async getOrder(orderId: number | string): Promise<Order | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);
      if (res.ok) {
        return await handleResponse<Order>(res, null as any);
      }
    } catch {
      // fallback
    }
    return null;
  },

  // --- EVENTS TRACKING ---
  async sendEvents(events: InteractionEvent[]): Promise<boolean> {
    if (!events.length) return true;
    try {
      const res = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // --- TEST SESSIONS & ADMIN ---
  async getSessions(): Promise<TestSession[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/sessions`);
      if (res.ok) {
        const data = await handleResponse<TestSession[]>(res, []);
        if (Array.isArray(data)) return data;
      }
    } catch {
      // fallback
    }
    return [];
  },

  async getSession(id: string): Promise<TestSession | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/sessions/${encodeURIComponent(id)}`);
      if (res.ok) {
        return await handleResponse<TestSession>(res, null as any);
      }
    } catch {
      // fallback
    }
    return null;
  },

  async getSessionEvents(id: string, page = 1, limit = 100): Promise<{ events: InteractionEvent[]; total: number }> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/sessions/${encodeURIComponent(id)}/events?page=${page}&limit=${limit}`);
      if (res.ok) {
        const data = await handleResponse<any>(res, { events: [], pagination: { total: 0 } });
        return {
          events: data?.events || [],
          total: data?.pagination?.total || 0
        };
      }
    } catch {
      // fallback
    }
    return { events: [], total: 0 };
  },

  async getMetrics(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/metrics`);
      if (res.ok) {
        return await handleResponse<any>(res, null);
      }
    } catch {
      // fallback
    }
    return null;
  },

  async createSession(data: {
    participantId: string;
    scenarioId: string;
    userAgent?: string;
    screenSize?: string;
  }): Promise<TestSession> {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        return await handleResponse<TestSession>(res, null as any);
      }
    } catch {
      // fallback
    }
    const newSession: TestSession = {
      id: 'sess_' + Math.random().toString(36).substring(2, 9),
      participantId: data.participantId,
      scenarioId: data.scenarioId,
      startedAt: new Date().toISOString(),
      completed: false,
      userAgent: data.userAgent,
      screenSize: data.screenSize,
      eventCount: 0
    };
    return newSession;
  },

  async updateSession(id: string, updates: Partial<TestSession>): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch {
      return true;
    }
  },

  async updateTaskProgress(sessionId: string, taskId: string, status: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${encodeURIComponent(sessionId)}/tasks/${encodeURIComponent(taskId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return res.ok;
    } catch {
      return true;
    }
  },

  // Auth Endpoints
  async login(credentials: { email?: string; password?: string; role?: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return await handleResponse<AuthResponse>(res, null as any);
  },

  async register(data: { name: string; email: string; password: string; role?: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await handleResponse<AuthResponse>(res, null as any);
  },

  async getMe(token: string): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await handleResponse<User>(res, null as any);
  },

  async getAnalytics(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/analytics`);
      return await handleResponse<any>(res, null);
    } catch {
      return null;
    }
  },

  async getDemoUsers(): Promise<DemoAccount[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/demo-users`);
      if (res.ok) {
        return await handleResponse<DemoAccount[]>(res, []);
      }
    } catch {
      // fallback
    }
    return [
      {
        role: 'user',
        name: 'Jane Doe',
        email: 'user@shopsim.test',
        password: 'user123',
        description: 'Standard Shopper / Study Participant',
        badge: 'Shopper'
      },
      {
        role: 'admin',
        name: 'Dr. Sarah Chen',
        email: 'admin@shopsim.test',
        password: 'admin123',
        description: 'Usability Researcher & System Admin',
        badge: 'Administrator'
      }
    ];
  }
};

