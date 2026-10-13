export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children?: Category[];
  _count?: { products: number };
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  categoryId: number;
  category?: Category;
  rating: number;
  reviewCount: number;
  stock: number;
  specs: string;    // JSON string
  features: string; // JSON string
}

export interface CartItem {
  id: number;
  sessionId: string;
  productId: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  discountCode?: string;
  itemCount: number;
}

export interface DiscountCode {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
}

export interface ShippingData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentData {
  method: 'credit_card' | 'paypal' | 'bank_transfer';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

export interface Order {
  id: number;
  sessionId: string;
  totalAmount: number;
  discountAmount: number;
  shippingData: ShippingData | string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: CartItem[];
}

export interface InteractionEvent {
  sessionId: string;
  timestamp: string;
  eventType: string;
  target?: string;
  page: string;
  details?: Record<string, any>;
  sequenceNum: number;
}

export interface TaskProgress {
  id: number;
  taskId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned';
  startedAt?: string;
  completedAt?: string;
}

export interface TestSession {
  id: string;
  participantId: string;
  scenarioId: string;
  startedAt: string;
  endedAt?: string;
  completed: boolean;
  eventCount?: number;
  tasks?: TaskProgress[];
  userAgent?: string;
  screenSize?: string;
  events?: InteractionEvent[];
}

export interface ProductFilters {
  categoryId?: number;
  categorySlug?: string;
  subcategoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sortBy?: 'featured' | 'price_asc' | 'price_desc' | 'rating_desc' | 'name_asc';
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}
