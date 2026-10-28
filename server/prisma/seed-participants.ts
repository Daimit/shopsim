import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// ────────────────────────────────────────────────────────────────────
// Helper utilities
// ────────────────────────────────────────────────────────────────────

/** Advance a Date by `ms` milliseconds and return a *new* Date */
function addMs(date: Date, ms: number): Date {
  return new Date(date.getTime() + ms);
}

/** Random integer between min (inclusive) and max (inclusive) */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick a random element from an array */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ────────────────────────────────────────────────────────────────────
// Shared constants
// ────────────────────────────────────────────────────────────────────

const TASKS = [
  { id: 'task_1', label: 'Search & Buy Headphones' },
  { id: 'task_2', label: 'Filter Sub-$1000 Laptop' },
  { id: 'task_3', label: 'Compare Flagship Phones' },
  { id: 'task_4', label: 'Quantity & Promo Code' },
  { id: 'task_5', label: 'Complete Checkout' },
];

interface EventDef {
  eventType: string;
  target?: string;
  page: string;
  details?: Record<string, unknown>;
  delayMs?: number; // override default inter-event gap
}

interface ParticipantProfile {
  participantId: string;
  scenarioId: string;
  userAgent: string;
  screenSize: string;
  baseTime: Date;
  sessionDurationMin: number;
  completedTasks: string[]; // task ids that are "completed"
  abandonedTasks: string[]; // task ids that are "abandoned"
  events: EventDef[];
}

// ────────────────────────────────────────────────────────────────────
// Participant definitions
// ────────────────────────────────────────────────────────────────────

function buildParticipants(): ParticipantProfile[] {
  return [
    // ── P_101 – Expert User (Female, 28) ─────────────────────────
    {
      participantId: 'P_101',
      scenarioId: 'full_purchase_flow',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
      screenSize: '1920x1080',
      baseTime: new Date('2026-10-20T09:00:00Z'),
      sessionDurationMin: 6,
      completedTasks: ['task_1', 'task_2', 'task_3', 'task_4', 'task_5'],
      abandonedTasks: [],
      events: [
        // Task 1 – Search & Buy Headphones (fast)
        { eventType: 'task_started', page: '/', details: { taskId: 'task_1' }, delayMs: 0 },
        { eventType: 'page_view', page: '/', target: 'homepage' },
        { eventType: 'click', target: 'search_bar', page: '/' },
        { eventType: 'search_query', page: '/search', details: { query: 'wireless headphones' } },
        { eventType: 'page_view', page: '/search?q=wireless+headphones' },
        { eventType: 'click', target: 'product_card_sony-wh-1000xm5', page: '/search' },
        { eventType: 'page_view', page: '/product/sony-wh-1000xm5' },
        { eventType: 'click', target: 'add_to_cart', page: '/product/sony-wh-1000xm5', details: { productId: 'sony-wh-1000xm5' } },
        { eventType: 'cart_add', page: '/product/sony-wh-1000xm5', details: { productSlug: 'sony-wh-1000xm5', quantity: 1 } },
        { eventType: 'task_completed', page: '/product/sony-wh-1000xm5', details: { taskId: 'task_1' } },

        // Task 2 – Filter Sub-$1000 Laptop
        { eventType: 'task_started', page: '/product/sony-wh-1000xm5', details: { taskId: 'task_2' } },
        { eventType: 'click', target: 'nav_categories_toggle', page: '/product/sony-wh-1000xm5' },
        { eventType: 'click', target: 'category_laptops', page: '/' },
        { eventType: 'page_view', page: '/category/laptops' },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'price', max: 1000 } },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'rating', min: 4 } },
        { eventType: 'click', target: 'product_card_asus-zenbook-14', page: '/category/laptops' },
        { eventType: 'page_view', page: '/product/asus-zenbook-14' },
        { eventType: 'click', target: 'add_to_cart', page: '/product/asus-zenbook-14', details: { productId: 'asus-zenbook-14' } },
        { eventType: 'cart_add', page: '/product/asus-zenbook-14', details: { productSlug: 'asus-zenbook-14', quantity: 1 } },
        { eventType: 'task_completed', page: '/product/asus-zenbook-14', details: { taskId: 'task_2' } },

        // Task 3 – Compare Flagship Phones
        { eventType: 'task_started', page: '/product/asus-zenbook-14', details: { taskId: 'task_3' } },
        { eventType: 'click', target: 'nav_categories_toggle', page: '/' },
        { eventType: 'click', target: 'category_smartphones', page: '/' },
        { eventType: 'page_view', page: '/category/smartphones' },
        { eventType: 'click', target: 'product_card_galaxy-s24', page: '/category/smartphones' },
        { eventType: 'page_view', page: '/product/galaxy-s24' },
        { eventType: 'click', target: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' } },
        { eventType: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' } },
        { eventType: 'navigation_back', page: '/category/smartphones' },
        { eventType: 'click', target: 'product_card_iphone-15', page: '/category/smartphones' },
        { eventType: 'page_view', page: '/product/iphone-15' },
        { eventType: 'click', target: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' } },
        { eventType: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' } },
        { eventType: 'page_view', page: '/compare' },
        { eventType: 'click', target: 'add_to_cart', page: '/compare', details: { productId: 'galaxy-s24' } },
        { eventType: 'cart_add', page: '/compare', details: { productSlug: 'galaxy-s24', quantity: 1 } },
        { eventType: 'task_completed', page: '/compare', details: { taskId: 'task_3' } },

        // Task 4 – Quantity & Promo Code
        { eventType: 'task_started', page: '/compare', details: { taskId: 'task_4' } },
        { eventType: 'click', target: 'nav_cart_button', page: '/compare' },
        { eventType: 'page_view', page: '/cart' },
        { eventType: 'quantity_change', page: '/cart', details: { productSlug: 'galaxy-s24', oldQty: 1, newQty: 3 } },
        { eventType: 'coupon_apply', page: '/cart', details: { code: 'SAVE20', success: true } },
        { eventType: 'task_completed', page: '/cart', details: { taskId: 'task_4' } },

        // Task 5 – Complete Checkout
        { eventType: 'task_started', page: '/cart', details: { taskId: 'task_5' } },
        { eventType: 'click', target: 'checkout_button', page: '/cart' },
        { eventType: 'page_view', page: '/checkout' },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 1, label: 'Shipping' } },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 2, label: 'Payment' }, delayMs: 8000 },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 3, label: 'Review' } },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 4, label: 'Confirmation' } },
        { eventType: 'task_completed', page: '/checkout', details: { taskId: 'task_5' } },
      ],
    },

    // ── P_102 – Novice User (Male, 55) ───────────────────────────
    {
      participantId: 'P_102',
      scenarioId: 'full_purchase_flow',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
      screenSize: '1366x768',
      baseTime: new Date('2026-10-21T10:30:00Z'),
      sessionDurationMin: 14,
      completedTasks: ['task_1', 'task_2', 'task_3', 'task_4'],
      abandonedTasks: ['task_5'],
      events: [
        // Task 1 – Search & Buy Headphones (slow with re-searches)
        { eventType: 'task_started', page: '/', details: { taskId: 'task_1' }, delayMs: 0 },
        { eventType: 'page_view', page: '/' },
        { eventType: 'click', target: 'nav_home', page: '/' },
        { eventType: 'page_view', page: '/', delayMs: 5000 },
        { eventType: 'click', target: 'search_bar', page: '/', delayMs: 4000 },
        { eventType: 'search_query', page: '/search', details: { query: 'headphons' }, delayMs: 6000 },
        { eventType: 'page_view', page: '/search?q=headphons' },
        { eventType: 'search_query', page: '/search', details: { query: 'wireless headphones' }, delayMs: 8000 },
        { eventType: 'page_view', page: '/search?q=wireless+headphones' },
        { eventType: 'click', target: 'product_card_jbl-tour-one-m2', page: '/search', delayMs: 6000 },
        { eventType: 'page_view', page: '/product/jbl-tour-one-m2' },
        { eventType: 'navigation_back', page: '/search', delayMs: 12000 },
        { eventType: 'click', target: 'product_card_sony-wh-1000xm5', page: '/search', delayMs: 5000 },
        { eventType: 'page_view', page: '/product/sony-wh-1000xm5' },
        { eventType: 'click', target: 'add_to_cart', page: '/product/sony-wh-1000xm5', details: { productId: 'sony-wh-1000xm5' }, delayMs: 10000 },
        { eventType: 'cart_add', page: '/product/sony-wh-1000xm5', details: { productSlug: 'sony-wh-1000xm5', quantity: 1 } },
        { eventType: 'task_completed', page: '/product/sony-wh-1000xm5', details: { taskId: 'task_1' } },

        // Task 2 – Filter Sub-$1000 Laptop (confusion navigating)
        { eventType: 'task_started', page: '/product/sony-wh-1000xm5', details: { taskId: 'task_2' } },
        { eventType: 'click', target: 'nav_home', page: '/', delayMs: 4000 },
        { eventType: 'page_view', page: '/' },
        { eventType: 'click', target: 'nav_categories_toggle', page: '/', delayMs: 6000 },
        { eventType: 'click', target: 'category_electronics', page: '/' },
        { eventType: 'page_view', page: '/category/electronics' },
        { eventType: 'click', target: 'nav_categories_toggle', page: '/category/electronics', delayMs: 8000 },
        { eventType: 'click', target: 'category_laptops', page: '/category/electronics' },
        { eventType: 'page_view', page: '/category/laptops' },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'price', max: 500 }, delayMs: 7000 },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'price', max: 1000 }, delayMs: 5000 },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'rating', min: 4 }, delayMs: 4000 },
        { eventType: 'click', target: 'product_card_asus-zenbook-14', page: '/category/laptops', delayMs: 8000 },
        { eventType: 'page_view', page: '/product/asus-zenbook-14' },
        { eventType: 'navigation_back', page: '/category/laptops', delayMs: 10000 },
        { eventType: 'click', target: 'product_card_asus-zenbook-14', page: '/category/laptops', delayMs: 5000 },
        { eventType: 'page_view', page: '/product/asus-zenbook-14' },
        { eventType: 'click', target: 'add_to_cart', page: '/product/asus-zenbook-14', details: { productId: 'asus-zenbook-14' }, delayMs: 7000 },
        { eventType: 'cart_add', page: '/product/asus-zenbook-14', details: { productSlug: 'asus-zenbook-14', quantity: 1 } },
        { eventType: 'task_completed', page: '/product/asus-zenbook-14', details: { taskId: 'task_2' } },

        // Task 3 – Compare Flagship Phones (with backtracks)
        { eventType: 'task_started', page: '/product/asus-zenbook-14', details: { taskId: 'task_3' } },
        { eventType: 'click', target: 'nav_home', page: '/', delayMs: 3000 },
        { eventType: 'page_view', page: '/' },
        { eventType: 'search_query', page: '/search', details: { query: 'galaxy phone' }, delayMs: 9000 },
        { eventType: 'page_view', page: '/search?q=galaxy+phone' },
        { eventType: 'click', target: 'product_card_galaxy-s24', page: '/search', delayMs: 5000 },
        { eventType: 'page_view', page: '/product/galaxy-s24' },
        { eventType: 'click', target: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' }, delayMs: 12000 },
        { eventType: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' } },
        { eventType: 'navigation_back', page: '/search', delayMs: 4000 },
        { eventType: 'navigation_back', page: '/', delayMs: 3000 },
        { eventType: 'search_query', page: '/search', details: { query: 'iphone 15' }, delayMs: 7000 },
        { eventType: 'page_view', page: '/search?q=iphone+15' },
        { eventType: 'click', target: 'product_card_iphone-15', page: '/search', delayMs: 4000 },
        { eventType: 'page_view', page: '/product/iphone-15' },
        { eventType: 'click', target: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' }, delayMs: 9000 },
        { eventType: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' } },
        { eventType: 'page_view', page: '/compare', delayMs: 3000 },
        { eventType: 'click', target: 'add_to_cart', page: '/compare', details: { productId: 'galaxy-s24' }, delayMs: 15000 },
        { eventType: 'cart_add', page: '/compare', details: { productSlug: 'galaxy-s24', quantity: 1 } },
        { eventType: 'task_completed', page: '/compare', details: { taskId: 'task_3' } },

        // Task 4 – Quantity & Promo Code
        { eventType: 'task_started', page: '/compare', details: { taskId: 'task_4' } },
        { eventType: 'click', target: 'nav_cart_button', page: '/compare', delayMs: 5000 },
        { eventType: 'page_view', page: '/cart' },
        { eventType: 'quantity_change', page: '/cart', details: { productSlug: 'galaxy-s24', oldQty: 1, newQty: 2 }, delayMs: 6000 },
        { eventType: 'quantity_change', page: '/cart', details: { productSlug: 'galaxy-s24', oldQty: 2, newQty: 3 }, delayMs: 4000 },
        { eventType: 'coupon_apply', page: '/cart', details: { code: 'SAVE20', success: true }, delayMs: 12000 },
        { eventType: 'task_completed', page: '/cart', details: { taskId: 'task_4' } },

        // Task 5 – Complete Checkout (abandoned – form errors)
        { eventType: 'task_started', page: '/cart', details: { taskId: 'task_5' } },
        { eventType: 'click', target: 'checkout_button', page: '/cart', delayMs: 4000 },
        { eventType: 'page_view', page: '/checkout' },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 1, label: 'Shipping' }, delayMs: 5000 },
        { eventType: 'form_error', page: '/checkout', details: { field: 'email', error: 'Invalid email format' }, delayMs: 15000 },
        { eventType: 'form_error', page: '/checkout', details: { field: 'zip', error: 'Zip code is required' }, delayMs: 8000 },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 1, label: 'Shipping (retry)' }, delayMs: 12000 },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 2, label: 'Payment' }, delayMs: 10000 },
        { eventType: 'form_error', page: '/checkout', details: { field: 'cardNumber', error: 'Invalid card number' }, delayMs: 20000 },
        { eventType: 'form_error', page: '/checkout', details: { field: 'expiry', error: 'Card expiry must be in future' }, delayMs: 8000 },
        // User gives up here
        { eventType: 'navigation_back', page: '/cart', delayMs: 10000 },
        { eventType: 'page_view', page: '/' },
      ],
    },

    // ── P_103 – Comparison Shopper (Female, 34) ──────────────────
    {
      participantId: 'P_103',
      scenarioId: 'full_purchase_flow',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      screenSize: '2560x1440',
      baseTime: new Date('2026-10-22T14:00:00Z'),
      sessionDurationMin: 11,
      completedTasks: ['task_1', 'task_2', 'task_3', 'task_4', 'task_5'],
      abandonedTasks: [],
      events: [
        // Task 1 – Search & Buy Headphones (compares several)
        { eventType: 'task_started', page: '/', details: { taskId: 'task_1' }, delayMs: 0 },
        { eventType: 'page_view', page: '/' },
        { eventType: 'search_query', page: '/search', details: { query: 'wireless headphones noise cancelling' } },
        { eventType: 'page_view', page: '/search?q=wireless+headphones+noise+cancelling' },
        { eventType: 'click', target: 'product_card_sony-wh-1000xm5', page: '/search' },
        { eventType: 'page_view', page: '/product/sony-wh-1000xm5' },
        { eventType: 'navigation_back', page: '/search', delayMs: 10000 },
        { eventType: 'click', target: 'product_card_bose-qc-ultra', page: '/search' },
        { eventType: 'page_view', page: '/product/bose-qc-ultra' },
        { eventType: 'navigation_back', page: '/search', delayMs: 12000 },
        { eventType: 'click', target: 'product_card_sennheiser-momentum-4', page: '/search' },
        { eventType: 'page_view', page: '/product/sennheiser-momentum-4' },
        { eventType: 'navigation_back', page: '/search', delayMs: 10000 },
        { eventType: 'click', target: 'product_card_sony-wh-1000xm5', page: '/search' },
        { eventType: 'page_view', page: '/product/sony-wh-1000xm5' },
        { eventType: 'click', target: 'add_to_cart', page: '/product/sony-wh-1000xm5', details: { productId: 'sony-wh-1000xm5' } },
        { eventType: 'cart_add', page: '/product/sony-wh-1000xm5', details: { productSlug: 'sony-wh-1000xm5', quantity: 1 } },
        { eventType: 'task_completed', page: '/product/sony-wh-1000xm5', details: { taskId: 'task_1' } },

        // Task 2 – Filter Sub-$1000 Laptop (browses many)
        { eventType: 'task_started', page: '/product/sony-wh-1000xm5', details: { taskId: 'task_2' } },
        { eventType: 'click', target: 'nav_categories_toggle', page: '/' },
        { eventType: 'click', target: 'category_laptops', page: '/' },
        { eventType: 'page_view', page: '/category/laptops' },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'price', max: 1000 } },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'rating', min: 4 } },
        { eventType: 'click', target: 'product_card_asus-zenbook-14', page: '/category/laptops' },
        { eventType: 'page_view', page: '/product/asus-zenbook-14' },
        { eventType: 'navigation_back', page: '/category/laptops', delayMs: 15000 },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'price', max: 1200 } },
        { eventType: 'click', target: 'product_card_macbook-air-m3', page: '/category/laptops' },
        { eventType: 'page_view', page: '/product/macbook-air-m3' },
        { eventType: 'navigation_back', page: '/category/laptops', delayMs: 12000 },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'price', max: 1000 } },
        { eventType: 'click', target: 'product_card_asus-zenbook-14', page: '/category/laptops' },
        { eventType: 'page_view', page: '/product/asus-zenbook-14' },
        { eventType: 'click', target: 'add_to_cart', page: '/product/asus-zenbook-14', details: { productId: 'asus-zenbook-14' } },
        { eventType: 'cart_add', page: '/product/asus-zenbook-14', details: { productSlug: 'asus-zenbook-14', quantity: 1 } },
        { eventType: 'task_completed', page: '/product/asus-zenbook-14', details: { taskId: 'task_2' } },

        // Task 3 – Compare Flagship Phones (detailed comparison)
        { eventType: 'task_started', page: '/product/asus-zenbook-14', details: { taskId: 'task_3' } },
        { eventType: 'click', target: 'nav_categories_toggle', page: '/' },
        { eventType: 'click', target: 'category_smartphones', page: '/' },
        { eventType: 'page_view', page: '/category/smartphones' },
        { eventType: 'click', target: 'product_card_galaxy-s24', page: '/category/smartphones' },
        { eventType: 'page_view', page: '/product/galaxy-s24' },
        { eventType: 'click', target: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' } },
        { eventType: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' } },
        { eventType: 'navigation_back', page: '/category/smartphones' },
        { eventType: 'click', target: 'product_card_iphone-15', page: '/category/smartphones' },
        { eventType: 'page_view', page: '/product/iphone-15' },
        { eventType: 'click', target: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' } },
        { eventType: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' } },
        { eventType: 'navigation_back', page: '/category/smartphones' },
        { eventType: 'click', target: 'product_card_pixel-8', page: '/category/smartphones' },
        { eventType: 'page_view', page: '/product/pixel-8' },
        { eventType: 'click', target: 'compare_add', page: '/product/pixel-8', details: { productSlug: 'pixel-8' } },
        { eventType: 'compare_add', page: '/product/pixel-8', details: { productSlug: 'pixel-8' } },
        { eventType: 'page_view', page: '/compare', delayMs: 5000 },
        { eventType: 'click', target: 'add_to_cart', page: '/compare', details: { productId: 'galaxy-s24' }, delayMs: 18000 },
        { eventType: 'cart_add', page: '/compare', details: { productSlug: 'galaxy-s24', quantity: 1 } },
        { eventType: 'task_completed', page: '/compare', details: { taskId: 'task_3' } },

        // Task 4 – Quantity & Promo Code
        { eventType: 'task_started', page: '/compare', details: { taskId: 'task_4' } },
        { eventType: 'click', target: 'nav_cart_button', page: '/compare' },
        { eventType: 'page_view', page: '/cart' },
        { eventType: 'quantity_change', page: '/cart', details: { productSlug: 'galaxy-s24', oldQty: 1, newQty: 3 } },
        { eventType: 'coupon_apply', page: '/cart', details: { code: 'SAVE20', success: true } },
        { eventType: 'task_completed', page: '/cart', details: { taskId: 'task_4' } },

        // Task 5 – Complete Checkout
        { eventType: 'task_started', page: '/cart', details: { taskId: 'task_5' } },
        { eventType: 'click', target: 'checkout_button', page: '/cart' },
        { eventType: 'page_view', page: '/checkout' },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 1, label: 'Shipping' }, delayMs: 10000 },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 2, label: 'Payment' }, delayMs: 12000 },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 3, label: 'Review' }, delayMs: 8000 },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 4, label: 'Confirmation' } },
        { eventType: 'task_completed', page: '/checkout', details: { taskId: 'task_5' } },
      ],
    },

    // ── P_104 – Cart Abandoner (Male, 22) ────────────────────────
    {
      participantId: 'P_104',
      scenarioId: 'full_purchase_flow',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      screenSize: '1920x1080',
      baseTime: new Date('2026-10-23T16:45:00Z'),
      sessionDurationMin: 7,
      completedTasks: ['task_1', 'task_3'],
      abandonedTasks: ['task_2', 'task_4', 'task_5'],
      events: [
        // Task 1 – Search & Buy Headphones (quick)
        { eventType: 'task_started', page: '/', details: { taskId: 'task_1' }, delayMs: 0 },
        { eventType: 'page_view', page: '/' },
        { eventType: 'login_success', page: '/', details: { userId: 'user_104' } },
        { eventType: 'search_query', page: '/search', details: { query: 'headphones' } },
        { eventType: 'page_view', page: '/search?q=headphones' },
        { eventType: 'click', target: 'product_card_airpods-pro-2', page: '/search' },
        { eventType: 'page_view', page: '/product/airpods-pro-2' },
        { eventType: 'click', target: 'add_to_cart', page: '/product/airpods-pro-2', details: { productId: 'airpods-pro-2' } },
        { eventType: 'cart_add', page: '/product/airpods-pro-2', details: { productSlug: 'airpods-pro-2', quantity: 1 } },
        { eventType: 'task_completed', page: '/product/airpods-pro-2', details: { taskId: 'task_1' } },

        // Task 2 – Filter Laptop (browsed but didn't add)
        { eventType: 'task_started', page: '/product/airpods-pro-2', details: { taskId: 'task_2' } },
        { eventType: 'click', target: 'nav_categories_toggle', page: '/' },
        { eventType: 'click', target: 'category_laptops', page: '/' },
        { eventType: 'page_view', page: '/category/laptops' },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'price', max: 1000 } },
        { eventType: 'click', target: 'product_card_asus-zenbook-14', page: '/category/laptops' },
        { eventType: 'page_view', page: '/product/asus-zenbook-14' },
        { eventType: 'navigation_back', page: '/category/laptops', delayMs: 8000 },
        // Lost interest, abandoned task_2

        // Task 3 – Compare Flagship Phones
        { eventType: 'task_started', page: '/category/laptops', details: { taskId: 'task_3' } },
        { eventType: 'click', target: 'category_smartphones', page: '/category/laptops' },
        { eventType: 'page_view', page: '/category/smartphones' },
        { eventType: 'click', target: 'product_card_galaxy-s24', page: '/category/smartphones' },
        { eventType: 'page_view', page: '/product/galaxy-s24' },
        { eventType: 'click', target: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' } },
        { eventType: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' } },
        { eventType: 'navigation_back', page: '/category/smartphones' },
        { eventType: 'click', target: 'product_card_iphone-15', page: '/category/smartphones' },
        { eventType: 'page_view', page: '/product/iphone-15' },
        { eventType: 'click', target: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' } },
        { eventType: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' } },
        { eventType: 'page_view', page: '/compare' },
        { eventType: 'click', target: 'add_to_cart', page: '/compare', details: { productId: 'iphone-15' } },
        { eventType: 'cart_add', page: '/compare', details: { productSlug: 'iphone-15', quantity: 1 } },
        { eventType: 'task_completed', page: '/compare', details: { taskId: 'task_3' } },

        // Task 4 – Quantity & Promo (skipped, goes straight to checkout)
        { eventType: 'task_started', page: '/compare', details: { taskId: 'task_4' } },
        { eventType: 'click', target: 'nav_cart_button', page: '/compare' },
        { eventType: 'page_view', page: '/cart' },
        // Didn't change quantity or apply coupon, abandoned

        // Task 5 – Checkout abandoned at step 2
        { eventType: 'task_started', page: '/cart', details: { taskId: 'task_5' } },
        { eventType: 'click', target: 'checkout_button', page: '/cart' },
        { eventType: 'page_view', page: '/checkout' },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 1, label: 'Shipping' }, delayMs: 12000 },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 2, label: 'Payment' }, delayMs: 8000 },
        // Abandoned at payment step
        { eventType: 'navigation_back', page: '/cart', delayMs: 15000 },
        { eventType: 'page_view', page: '/' },
      ],
    },

    // ── P_105 – Coupon Hunter (Female, 41) ───────────────────────
    {
      participantId: 'P_105',
      scenarioId: 'full_purchase_flow',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
      screenSize: '1680x1050',
      baseTime: new Date('2026-10-24T11:15:00Z'),
      sessionDurationMin: 9,
      completedTasks: ['task_1', 'task_2', 'task_3', 'task_4', 'task_5'],
      abandonedTasks: [],
      events: [
        // Task 1
        { eventType: 'task_started', page: '/', details: { taskId: 'task_1' }, delayMs: 0 },
        { eventType: 'page_view', page: '/' },
        { eventType: 'login_success', page: '/', details: { userId: 'user_105' } },
        { eventType: 'search_query', page: '/search', details: { query: 'wireless headphones' } },
        { eventType: 'page_view', page: '/search?q=wireless+headphones' },
        { eventType: 'click', target: 'product_card_sony-wh-1000xm5', page: '/search' },
        { eventType: 'page_view', page: '/product/sony-wh-1000xm5' },
        { eventType: 'click', target: 'add_to_cart', page: '/product/sony-wh-1000xm5', details: { productId: 'sony-wh-1000xm5' } },
        { eventType: 'cart_add', page: '/product/sony-wh-1000xm5', details: { productSlug: 'sony-wh-1000xm5', quantity: 1 } },
        { eventType: 'task_completed', page: '/product/sony-wh-1000xm5', details: { taskId: 'task_1' } },

        // Task 2
        { eventType: 'task_started', page: '/product/sony-wh-1000xm5', details: { taskId: 'task_2' } },
        { eventType: 'click', target: 'nav_categories_toggle', page: '/' },
        { eventType: 'click', target: 'category_laptops', page: '/' },
        { eventType: 'page_view', page: '/category/laptops' },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'price', max: 1000 } },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'rating', min: 4 } },
        { eventType: 'click', target: 'product_card_asus-zenbook-14', page: '/category/laptops' },
        { eventType: 'page_view', page: '/product/asus-zenbook-14' },
        { eventType: 'click', target: 'add_to_cart', page: '/product/asus-zenbook-14', details: { productId: 'asus-zenbook-14' } },
        { eventType: 'cart_add', page: '/product/asus-zenbook-14', details: { productSlug: 'asus-zenbook-14', quantity: 1 } },
        { eventType: 'task_completed', page: '/product/asus-zenbook-14', details: { taskId: 'task_2' } },

        // Task 3
        { eventType: 'task_started', page: '/product/asus-zenbook-14', details: { taskId: 'task_3' } },
        { eventType: 'click', target: 'category_smartphones', page: '/' },
        { eventType: 'page_view', page: '/category/smartphones' },
        { eventType: 'click', target: 'product_card_galaxy-s24', page: '/category/smartphones' },
        { eventType: 'page_view', page: '/product/galaxy-s24' },
        { eventType: 'click', target: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' } },
        { eventType: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' } },
        { eventType: 'navigation_back', page: '/category/smartphones' },
        { eventType: 'click', target: 'product_card_iphone-15', page: '/category/smartphones' },
        { eventType: 'page_view', page: '/product/iphone-15' },
        { eventType: 'click', target: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' } },
        { eventType: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' } },
        { eventType: 'page_view', page: '/compare' },
        { eventType: 'click', target: 'add_to_cart', page: '/compare', details: { productId: 'galaxy-s24' } },
        { eventType: 'cart_add', page: '/compare', details: { productSlug: 'galaxy-s24', quantity: 1 } },
        { eventType: 'task_completed', page: '/compare', details: { taskId: 'task_3' } },

        // Task 4 – Coupon hunting (multiple failures before success)
        { eventType: 'task_started', page: '/compare', details: { taskId: 'task_4' } },
        { eventType: 'click', target: 'nav_cart_button', page: '/compare' },
        { eventType: 'page_view', page: '/cart' },
        { eventType: 'quantity_change', page: '/cart', details: { productSlug: 'galaxy-s24', oldQty: 1, newQty: 3 } },
        { eventType: 'coupon_apply', page: '/cart', details: { code: 'DISCOUNT50', success: false, error: 'Invalid coupon code' } },
        { eventType: 'coupon_error', page: '/cart', details: { code: 'DISCOUNT50', message: 'Coupon not found' } },
        { eventType: 'coupon_apply', page: '/cart', details: { code: 'SAVE50', success: false, error: 'Invalid coupon code' }, delayMs: 5000 },
        { eventType: 'coupon_error', page: '/cart', details: { code: 'SAVE50', message: 'Coupon not found' } },
        { eventType: 'coupon_apply', page: '/cart', details: { code: 'FREESHIP', success: false, error: 'Minimum purchase not met' }, delayMs: 4000 },
        { eventType: 'coupon_error', page: '/cart', details: { code: 'FREESHIP', message: 'This code offers $0 discount' } },
        { eventType: 'coupon_apply', page: '/cart', details: { code: 'PROMO25', success: false, error: 'Invalid coupon code' }, delayMs: 6000 },
        { eventType: 'coupon_error', page: '/cart', details: { code: 'PROMO25', message: 'Coupon not found' } },
        { eventType: 'coupon_apply', page: '/cart', details: { code: 'SAVE20', success: true }, delayMs: 8000 },
        { eventType: 'task_completed', page: '/cart', details: { taskId: 'task_4' } },

        // Task 5 – Checkout
        { eventType: 'task_started', page: '/cart', details: { taskId: 'task_5' } },
        { eventType: 'click', target: 'checkout_button', page: '/cart' },
        { eventType: 'page_view', page: '/checkout' },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 1, label: 'Shipping' }, delayMs: 10000 },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 2, label: 'Payment' }, delayMs: 12000 },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 3, label: 'Review' } },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 4, label: 'Confirmation' } },
        { eventType: 'task_completed', page: '/checkout', details: { taskId: 'task_5' } },
      ],
    },

    // ── P_106 – Mobile User (Male, 19) ──────────────────────────
    {
      participantId: 'P_106',
      scenarioId: 'full_purchase_flow',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      screenSize: '390x844',
      baseTime: new Date('2026-10-25T08:20:00Z'),
      sessionDurationMin: 8,
      completedTasks: ['task_1', 'task_2', 'task_3', 'task_5'],
      abandonedTasks: ['task_4'],
      events: [
        // Task 1
        { eventType: 'task_started', page: '/', details: { taskId: 'task_1' }, delayMs: 0 },
        { eventType: 'page_view', page: '/' },
        { eventType: 'click', target: 'search_bar', page: '/' },
        { eventType: 'search_query', page: '/search', details: { query: 'wireles headphones' } },
        { eventType: 'page_view', page: '/search?q=wireles+headphones' },
        { eventType: 'search_query', page: '/search', details: { query: 'wireless headphones' }, delayMs: 4000 },
        { eventType: 'page_view', page: '/search?q=wireless+headphones' },
        { eventType: 'click', target: 'product_card_airpods-pro-2', page: '/search' },
        { eventType: 'page_view', page: '/product/airpods-pro-2' },
        { eventType: 'click', target: 'add_to_cart', page: '/product/airpods-pro-2', details: { productId: 'airpods-pro-2' } },
        { eventType: 'cart_add', page: '/product/airpods-pro-2', details: { productSlug: 'airpods-pro-2', quantity: 1 } },
        { eventType: 'task_completed', page: '/product/airpods-pro-2', details: { taskId: 'task_1' } },

        // Task 2 – tap errors on mobile
        { eventType: 'task_started', page: '/product/airpods-pro-2', details: { taskId: 'task_2' } },
        { eventType: 'click', target: 'nav_categories_toggle', page: '/' },
        { eventType: 'click', target: 'category_electronics', page: '/' },
        { eventType: 'page_view', page: '/category/electronics' },
        { eventType: 'click', target: 'category_laptops', page: '/category/electronics' },
        { eventType: 'page_view', page: '/category/laptops' },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'price', max: 1000 } },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'rating', min: 4 } },
        { eventType: 'click', target: 'product_card_hp-spectre-x360', page: '/category/laptops', details: { tapError: true, intended: 'asus-zenbook-14' } },
        { eventType: 'page_view', page: '/product/hp-spectre-x360' },
        { eventType: 'navigation_back', page: '/category/laptops' },
        { eventType: 'click', target: 'product_card_asus-zenbook-14', page: '/category/laptops' },
        { eventType: 'page_view', page: '/product/asus-zenbook-14' },
        { eventType: 'click', target: 'add_to_cart', page: '/product/asus-zenbook-14', details: { productId: 'asus-zenbook-14' } },
        { eventType: 'cart_add', page: '/product/asus-zenbook-14', details: { productSlug: 'asus-zenbook-14', quantity: 1 } },
        { eventType: 'task_completed', page: '/product/asus-zenbook-14', details: { taskId: 'task_2' } },

        // Task 3
        { eventType: 'task_started', page: '/product/asus-zenbook-14', details: { taskId: 'task_3' } },
        { eventType: 'navigation_back', page: '/category/laptops' },
        { eventType: 'click', target: 'category_smartphones', page: '/category/laptops' },
        { eventType: 'page_view', page: '/category/smartphones' },
        { eventType: 'click', target: 'product_card_galaxy-s24', page: '/category/smartphones' },
        { eventType: 'page_view', page: '/product/galaxy-s24' },
        { eventType: 'click', target: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' } },
        { eventType: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' } },
        { eventType: 'navigation_back', page: '/category/smartphones' },
        { eventType: 'click', target: 'product_card_iphone-15', page: '/category/smartphones' },
        { eventType: 'page_view', page: '/product/iphone-15' },
        { eventType: 'click', target: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' } },
        { eventType: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' } },
        { eventType: 'page_view', page: '/compare' },
        { eventType: 'click', target: 'add_to_cart', page: '/compare', details: { productId: 'galaxy-s24' } },
        { eventType: 'cart_add', page: '/compare', details: { productSlug: 'galaxy-s24', quantity: 1 } },
        { eventType: 'task_completed', page: '/compare', details: { taskId: 'task_3' } },

        // Task 4 – struggled on mobile, abandoned
        { eventType: 'task_started', page: '/compare', details: { taskId: 'task_4' } },
        { eventType: 'click', target: 'nav_cart_button', page: '/compare' },
        { eventType: 'page_view', page: '/cart' },
        { eventType: 'quantity_change', page: '/cart', details: { productSlug: 'galaxy-s24', oldQty: 1, newQty: 2, tapError: true } },
        { eventType: 'quantity_change', page: '/cart', details: { productSlug: 'galaxy-s24', oldQty: 2, newQty: 1, tapError: true } },
        { eventType: 'quantity_change', page: '/cart', details: { productSlug: 'galaxy-s24', oldQty: 1, newQty: 3 } },
        // Couldn't find coupon field on small screen, gave up

        // Task 5 – Checkout (completed)
        { eventType: 'task_started', page: '/cart', details: { taskId: 'task_5' } },
        { eventType: 'click', target: 'checkout_button', page: '/cart' },
        { eventType: 'page_view', page: '/checkout' },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 1, label: 'Shipping' }, delayMs: 12000 },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 2, label: 'Payment' }, delayMs: 10000 },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 3, label: 'Review' } },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 4, label: 'Confirmation' } },
        { eventType: 'task_completed', page: '/checkout', details: { taskId: 'task_5' } },
      ],
    },

    // ── P_107 – Back-and-Forth Navigator (Female, 47) ────────────
    {
      participantId: 'P_107',
      scenarioId: 'full_purchase_flow',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0',
      screenSize: '1440x900',
      baseTime: new Date('2026-10-26T13:00:00Z'),
      sessionDurationMin: 12,
      completedTasks: ['task_1', 'task_2', 'task_3'],
      abandonedTasks: ['task_4', 'task_5'],
      events: [
        // Task 1 – lots of back and forth
        { eventType: 'task_started', page: '/', details: { taskId: 'task_1' }, delayMs: 0 },
        { eventType: 'page_view', page: '/' },
        { eventType: 'click', target: 'nav_categories_toggle', page: '/' },
        { eventType: 'click', target: 'category_headphones', page: '/' },
        { eventType: 'page_view', page: '/category/headphones' },
        { eventType: 'click', target: 'product_card_sony-wh-1000xm5', page: '/category/headphones' },
        { eventType: 'page_view', page: '/product/sony-wh-1000xm5' },
        { eventType: 'navigation_back', page: '/category/headphones', delayMs: 8000 },
        { eventType: 'click', target: 'product_card_bose-qc-ultra', page: '/category/headphones' },
        { eventType: 'page_view', page: '/product/bose-qc-ultra' },
        { eventType: 'navigation_back', page: '/category/headphones', delayMs: 10000 },
        { eventType: 'click', target: 'product_card_sennheiser-momentum-4', page: '/category/headphones' },
        { eventType: 'page_view', page: '/product/sennheiser-momentum-4' },
        { eventType: 'navigation_back', page: '/category/headphones', delayMs: 9000 },
        { eventType: 'click', target: 'product_card_sony-wh-1000xm5', page: '/category/headphones' },
        { eventType: 'page_view', page: '/product/sony-wh-1000xm5' },
        { eventType: 'navigation_back', page: '/category/headphones', delayMs: 6000 },
        { eventType: 'click', target: 'product_card_bose-qc-ultra', page: '/category/headphones' },
        { eventType: 'page_view', page: '/product/bose-qc-ultra' },
        { eventType: 'navigation_back', page: '/category/headphones', delayMs: 7000 },
        { eventType: 'click', target: 'product_card_sony-wh-1000xm5', page: '/category/headphones' },
        { eventType: 'page_view', page: '/product/sony-wh-1000xm5' },
        { eventType: 'click', target: 'add_to_cart', page: '/product/sony-wh-1000xm5', details: { productId: 'sony-wh-1000xm5' }, delayMs: 12000 },
        { eventType: 'cart_add', page: '/product/sony-wh-1000xm5', details: { productSlug: 'sony-wh-1000xm5', quantity: 1 } },
        { eventType: 'task_completed', page: '/product/sony-wh-1000xm5', details: { taskId: 'task_1' } },

        // Task 2 – indecisive laptop browsing
        { eventType: 'task_started', page: '/product/sony-wh-1000xm5', details: { taskId: 'task_2' } },
        { eventType: 'click', target: 'nav_home', page: '/' },
        { eventType: 'page_view', page: '/' },
        { eventType: 'click', target: 'nav_categories_toggle', page: '/' },
        { eventType: 'click', target: 'category_laptops', page: '/' },
        { eventType: 'page_view', page: '/category/laptops' },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'price', max: 1000 } },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'rating', min: 4 } },
        { eventType: 'click', target: 'product_card_asus-zenbook-14', page: '/category/laptops' },
        { eventType: 'page_view', page: '/product/asus-zenbook-14' },
        { eventType: 'navigation_back', page: '/category/laptops', delayMs: 15000 },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'price', max: 1200 } },
        { eventType: 'click', target: 'product_card_macbook-air-m3', page: '/category/laptops' },
        { eventType: 'page_view', page: '/product/macbook-air-m3' },
        { eventType: 'navigation_back', page: '/category/laptops', delayMs: 12000 },
        { eventType: 'filter_change', page: '/category/laptops', details: { filter: 'price', max: 1000 } },
        { eventType: 'click', target: 'product_card_asus-zenbook-14', page: '/category/laptops' },
        { eventType: 'page_view', page: '/product/asus-zenbook-14' },
        { eventType: 'navigation_back', page: '/category/laptops', delayMs: 8000 },
        { eventType: 'click', target: 'product_card_asus-zenbook-14', page: '/category/laptops' },
        { eventType: 'page_view', page: '/product/asus-zenbook-14' },
        { eventType: 'click', target: 'add_to_cart', page: '/product/asus-zenbook-14', details: { productId: 'asus-zenbook-14' }, delayMs: 10000 },
        { eventType: 'cart_add', page: '/product/asus-zenbook-14', details: { productSlug: 'asus-zenbook-14', quantity: 1 } },
        { eventType: 'task_completed', page: '/product/asus-zenbook-14', details: { taskId: 'task_2' } },

        // Task 3 – Compare phones with lots of back-and-forth
        { eventType: 'task_started', page: '/product/asus-zenbook-14', details: { taskId: 'task_3' } },
        { eventType: 'click', target: 'nav_categories_toggle', page: '/' },
        { eventType: 'click', target: 'category_smartphones', page: '/' },
        { eventType: 'page_view', page: '/category/smartphones' },
        { eventType: 'click', target: 'product_card_galaxy-s24', page: '/category/smartphones' },
        { eventType: 'page_view', page: '/product/galaxy-s24' },
        { eventType: 'navigation_back', page: '/category/smartphones', delayMs: 8000 },
        { eventType: 'click', target: 'product_card_iphone-15', page: '/category/smartphones' },
        { eventType: 'page_view', page: '/product/iphone-15' },
        { eventType: 'navigation_back', page: '/category/smartphones', delayMs: 7000 },
        { eventType: 'click', target: 'product_card_galaxy-s24', page: '/category/smartphones' },
        { eventType: 'page_view', page: '/product/galaxy-s24' },
        { eventType: 'click', target: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' }, delayMs: 10000 },
        { eventType: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' } },
        { eventType: 'navigation_back', page: '/category/smartphones' },
        { eventType: 'click', target: 'product_card_iphone-15', page: '/category/smartphones' },
        { eventType: 'page_view', page: '/product/iphone-15' },
        { eventType: 'click', target: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' } },
        { eventType: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' } },
        { eventType: 'page_view', page: '/compare' },
        { eventType: 'click', target: 'add_to_cart', page: '/compare', details: { productId: 'galaxy-s24' }, delayMs: 12000 },
        { eventType: 'cart_add', page: '/compare', details: { productSlug: 'galaxy-s24', quantity: 1 } },
        { eventType: 'task_completed', page: '/compare', details: { taskId: 'task_3' } },

        // Task 4 – abandoned (couldn't figure out coupon)
        { eventType: 'task_started', page: '/compare', details: { taskId: 'task_4' } },
        { eventType: 'click', target: 'nav_cart_button', page: '/compare' },
        { eventType: 'page_view', page: '/cart' },
        { eventType: 'quantity_change', page: '/cart', details: { productSlug: 'galaxy-s24', oldQty: 1, newQty: 3 }, delayMs: 6000 },
        { eventType: 'coupon_apply', page: '/cart', details: { code: 'SAVE', success: false, error: 'Invalid coupon code' }, delayMs: 8000 },
        { eventType: 'coupon_error', page: '/cart', details: { code: 'SAVE', message: 'Coupon not found' } },
        { eventType: 'navigation_back', page: '/', delayMs: 10000 },

        // Task 5 – abandoned (never went to checkout)
        { eventType: 'task_started', page: '/', details: { taskId: 'task_5' } },
        { eventType: 'click', target: 'nav_cart_button', page: '/' },
        { eventType: 'page_view', page: '/cart' },
        { eventType: 'navigation_back', page: '/', delayMs: 5000 },
        { eventType: 'page_view', page: '/' },
      ],
    },

    // ── P_108 – Efficient Researcher (Male, 31) ──────────────────
    {
      participantId: 'P_108',
      scenarioId: 'full_purchase_flow',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      screenSize: '2560x1440',
      baseTime: new Date('2026-10-28T09:30:00Z'),
      sessionDurationMin: 7,
      completedTasks: ['task_1', 'task_2', 'task_3', 'task_4', 'task_5'],
      abandonedTasks: [],
      events: [
        // Task 1
        { eventType: 'task_started', page: '/', details: { taskId: 'task_1' }, delayMs: 0 },
        { eventType: 'page_view', page: '/' },
        { eventType: 'login_success', page: '/', details: { userId: 'user_108' } },
        { eventType: 'search_query', page: '/search', details: { query: 'Sony WH-1000XM5 headphones' } },
        { eventType: 'page_view', page: '/search?q=Sony+WH-1000XM5+headphones' },
        { eventType: 'click', target: 'product_card_sony-wh-1000xm5', page: '/search' },
        { eventType: 'page_view', page: '/product/sony-wh-1000xm5' },
        { eventType: 'click', target: 'add_to_cart', page: '/product/sony-wh-1000xm5', details: { productId: 'sony-wh-1000xm5' } },
        { eventType: 'cart_add', page: '/product/sony-wh-1000xm5', details: { productSlug: 'sony-wh-1000xm5', quantity: 1 } },
        { eventType: 'task_completed', page: '/product/sony-wh-1000xm5', details: { taskId: 'task_1' } },

        // Task 2 – Uses search directly
        { eventType: 'task_started', page: '/product/sony-wh-1000xm5', details: { taskId: 'task_2' } },
        { eventType: 'search_query', page: '/search', details: { query: 'laptop under 1000' } },
        { eventType: 'page_view', page: '/search?q=laptop+under+1000' },
        { eventType: 'filter_change', page: '/search', details: { filter: 'rating', min: 4 } },
        { eventType: 'click', target: 'product_card_asus-zenbook-14', page: '/search' },
        { eventType: 'page_view', page: '/product/asus-zenbook-14' },
        { eventType: 'click', target: 'add_to_cart', page: '/product/asus-zenbook-14', details: { productId: 'asus-zenbook-14' } },
        { eventType: 'cart_add', page: '/product/asus-zenbook-14', details: { productSlug: 'asus-zenbook-14', quantity: 1 } },
        { eventType: 'task_completed', page: '/product/asus-zenbook-14', details: { taskId: 'task_2' } },

        // Task 3
        { eventType: 'task_started', page: '/product/asus-zenbook-14', details: { taskId: 'task_3' } },
        { eventType: 'search_query', page: '/search', details: { query: 'Galaxy S24' } },
        { eventType: 'page_view', page: '/search?q=Galaxy+S24' },
        { eventType: 'click', target: 'product_card_galaxy-s24', page: '/search' },
        { eventType: 'page_view', page: '/product/galaxy-s24' },
        { eventType: 'click', target: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' } },
        { eventType: 'compare_add', page: '/product/galaxy-s24', details: { productSlug: 'galaxy-s24' } },
        { eventType: 'search_query', page: '/search', details: { query: 'iPhone 15' } },
        { eventType: 'page_view', page: '/search?q=iPhone+15' },
        { eventType: 'click', target: 'product_card_iphone-15', page: '/search' },
        { eventType: 'page_view', page: '/product/iphone-15' },
        { eventType: 'click', target: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' } },
        { eventType: 'compare_add', page: '/product/iphone-15', details: { productSlug: 'iphone-15' } },
        { eventType: 'page_view', page: '/compare' },
        { eventType: 'click', target: 'add_to_cart', page: '/compare', details: { productId: 'galaxy-s24' } },
        { eventType: 'cart_add', page: '/compare', details: { productSlug: 'galaxy-s24', quantity: 1 } },
        { eventType: 'task_completed', page: '/compare', details: { taskId: 'task_3' } },

        // Task 4
        { eventType: 'task_started', page: '/compare', details: { taskId: 'task_4' } },
        { eventType: 'click', target: 'nav_cart_button', page: '/compare' },
        { eventType: 'page_view', page: '/cart' },
        { eventType: 'quantity_change', page: '/cart', details: { productSlug: 'galaxy-s24', oldQty: 1, newQty: 3 } },
        { eventType: 'coupon_apply', page: '/cart', details: { code: 'SAVE20', success: true } },
        { eventType: 'task_completed', page: '/cart', details: { taskId: 'task_4' } },

        // Task 5
        { eventType: 'task_started', page: '/cart', details: { taskId: 'task_5' } },
        { eventType: 'click', target: 'checkout_button', page: '/cart' },
        { eventType: 'page_view', page: '/checkout' },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 1, label: 'Shipping' }, delayMs: 8000 },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 2, label: 'Payment' }, delayMs: 8000 },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 3, label: 'Review' } },
        { eventType: 'checkout_step', page: '/checkout', details: { step: 4, label: 'Confirmation' } },
        { eventType: 'task_completed', page: '/checkout', details: { taskId: 'task_5' } },
      ],
    },
  ];
}

// ────────────────────────────────────────────────────────────────────
// Seeding logic
// ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Seeding Participant Data (Milestone 4)         ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log();

  // ── Idempotent cleanup ───────────────────────────────────────
  console.log('🧹 Cleaning up previous participant seed data...');

  // Find existing sessions for P_1xx participants
  const oldSessions = await prisma.testSession.findMany({
    where: { participantId: { startsWith: 'P_1' } },
    select: { id: true },
  });
  const oldSessionIds = oldSessions.map((s) => s.id);

  if (oldSessionIds.length > 0) {
    // Delete dependent records first
    const deletedEvents = await prisma.interactionEvent.deleteMany({
      where: { sessionId: { in: oldSessionIds } },
    });
    console.log(`   Deleted ${deletedEvents.count} old InteractionEvents`);

    const deletedTasks = await prisma.taskProgress.deleteMany({
      where: { sessionId: { in: oldSessionIds } },
    });
    console.log(`   Deleted ${deletedTasks.count} old TaskProgress records`);

    const deletedSessions = await prisma.testSession.deleteMany({
      where: { id: { in: oldSessionIds } },
    });
    console.log(`   Deleted ${deletedSessions.count} old TestSessions`);
  } else {
    console.log('   No previous participant data found.');
  }
  console.log();

  // ── Build & insert ──────────────────────────────────────────
  const participants = buildParticipants();

  let totalSessions = 0;
  let totalEvents = 0;
  let totalTasks = 0;

  for (const p of participants) {
    console.log(`👤 Seeding participant ${p.participantId}...`);

    const sessionId = randomUUID();
    const startedAt = p.baseTime;
    const endedAt = addMs(startedAt, p.sessionDurationMin * 60 * 1000);
    const sessionCompleted =
      p.completedTasks.length === TASKS.length && p.abandonedTasks.length === 0;

    // Create TestSession
    await prisma.testSession.create({
      data: {
        id: sessionId,
        participantId: p.participantId,
        scenarioId: p.scenarioId,
        startedAt,
        endedAt,
        completed: sessionCompleted,
        userAgent: p.userAgent,
        screenSize: p.screenSize,
      },
    });
    totalSessions++;

    // Create InteractionEvents with realistic timestamps
    let cursor = new Date(startedAt.getTime());
    const eventRecords: Array<{
      sessionId: string;
      timestamp: Date;
      eventType: string;
      target: string | null;
      page: string;
      details: string | null;
      sequenceNum: number;
    }> = [];

    for (let i = 0; i < p.events.length; i++) {
      const ev = p.events[i];

      // Advance the cursor
      if (i === 0) {
        // First event at base time
        if (ev.delayMs) cursor = addMs(cursor, ev.delayMs);
      } else {
        const gap = ev.delayMs ?? randInt(2000, 8000);
        cursor = addMs(cursor, gap);
      }

      eventRecords.push({
        sessionId,
        timestamp: new Date(cursor.getTime()),
        eventType: ev.eventType,
        target: ev.target ?? null,
        page: ev.page,
        details: ev.details ? JSON.stringify(ev.details) : null,
        sequenceNum: i + 1,
      });
    }

    // Batch-insert events
    const createdEvents = await prisma.interactionEvent.createMany({
      data: eventRecords,
    });
    totalEvents += createdEvents.count;
    console.log(`   ✅ ${createdEvents.count} events created`);

    // Create TaskProgress records
    // Figure out when each task started/completed from the events
    const taskRecords: Array<{
      sessionId: string;
      taskId: string;
      status: string;
      startedAt: Date;
      completedAt: Date | null;
      stepLog: string;
    }> = [];

    for (const task of TASKS) {
      const startEvent = eventRecords.find(
        (e) =>
          e.eventType === 'task_started' &&
          e.details &&
          JSON.parse(e.details).taskId === task.id
      );
      const completeEvent = eventRecords.find(
        (e) =>
          e.eventType === 'task_completed' &&
          e.details &&
          JSON.parse(e.details).taskId === task.id
      );

      let status: string;
      if (p.completedTasks.includes(task.id)) {
        status = 'completed';
      } else if (p.abandonedTasks.includes(task.id)) {
        status = 'abandoned';
      } else if (startEvent) {
        status = 'in_progress';
      } else {
        status = 'not_started';
      }

      // Gather step log: collect relevant events between task_started and task_completed (or end)
      const startIdx = startEvent
        ? eventRecords.indexOf(startEvent)
        : -1;
      const endIdx = completeEvent
        ? eventRecords.indexOf(completeEvent)
        : startIdx >= 0
          ? eventRecords.length - 1
          : -1;

      const stepLogEntries: Array<{ seq: number; type: string; page: string; ts: string }> = [];
      if (startIdx >= 0 && endIdx >= 0) {
        for (let j = startIdx; j <= endIdx; j++) {
          const rec = eventRecords[j];
          stepLogEntries.push({
            seq: rec.sequenceNum,
            type: rec.eventType,
            page: rec.page,
            ts: rec.timestamp.toISOString(),
          });
        }
      }

      taskRecords.push({
        sessionId,
        taskId: task.id,
        status,
        startedAt: startEvent ? startEvent.timestamp : startedAt,
        completedAt: completeEvent ? completeEvent.timestamp : null,
        stepLog: JSON.stringify(stepLogEntries),
      });
    }

    const createdTasks = await prisma.taskProgress.createMany({
      data: taskRecords,
    });
    totalTasks += createdTasks.count;
    console.log(`   ✅ ${createdTasks.count} task progress records created`);
  }

  // ── Summary ─────────────────────────────────────────────────
  console.log();
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  Seed Summary                                   ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  TestSessions created:       ${String(totalSessions).padStart(5)}              ║`);
  console.log(`║  InteractionEvents created:  ${String(totalEvents).padStart(5)}              ║`);
  console.log(`║  TaskProgress created:       ${String(totalTasks).padStart(5)}              ║`);
  console.log('╚══════════════════════════════════════════════════╝');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
