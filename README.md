# ShopSim — E-Commerce Usability Simulator

A controlled e-commerce web application designed for studying user behaviour during multi-step purchasing workflows. Built for UX usability research — not commercial use.

## 🎯 Research Question

> Which parts of a multi-step purchasing process create the greatest usability difficulties for users?

## ✨ Features

- **Product Catalogue** — 42 products across 3 categories (Electronics, Clothing, Home & Kitchen)
- **Product Search** — Full-text search with filtering by category, price, rating, and availability
- **Product Comparison** — Side-by-side comparison of up to 4 products
- **Shopping Cart** — Add/remove items, modify quantities, apply discount codes
- **Checkout Flow** — 4-step wizard (Shipping → Payment → Review → Confirmation)
- **Interaction Logging** — Every user action is tracked with timestamps and metadata
- **Task System** — Predefined usability test tasks with progress tracking
- **Researcher Dashboard** — View sessions, events, metrics, and export data

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4 |
| State | Zustand |
| Routing | React Router v6 |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite via Prisma ORM |
| Icons | Lucide React |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm 9+

### Setup

```bash
# 1. Clone and navigate to the project
cd ecommerce-usability-simulator

# 2. Install root dependencies
npm install

# 3. Set up the backend (install deps, generate Prisma, seed database)
cd server
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
cd ..

# 4. Set up the frontend
cd client
npm install
cd ..
```

### Run

```bash
# Start both servers concurrently (from project root):
npm run dev

# Or start them separately:
# Terminal 1 — Backend (port 3001):
cd server && npx tsx src/index.ts

# Terminal 2 — Frontend (port 5173):
cd client && npx vite
```

Then open **http://localhost:5173** in your browser.

## 📁 Project Structure

```
ecommerce-usability-simulator/
├── package.json              # Root scripts (run both servers)
├── server/                   # Express + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema (9 models)
│   │   ├── seed.ts           # 42 products + 4 discount codes
│   │   └── dev.db            # SQLite database file
│   └── src/
│       ├── index.ts          # Express entry point (port 3001)
│       ├── lib/prisma.ts     # Prisma client singleton
│       ├── middleware/       # Error handler
│       └── routes/           # API route modules
│           ├── products.ts   # Product search, detail, compare
│           ├── categories.ts # Category tree
│           ├── cart.ts       # Cart CRUD + discounts
│           ├── checkout.ts   # Order creation
│           ├── events.ts     # Interaction event ingestion
│           └── admin.ts      # Researcher dashboard APIs
└── client/                   # React + Vite frontend
    └── src/
        ├── components/       # Reusable UI components
        │   ├── layout/       # Header, Footer, Breadcrumb
        │   ├── product/      # ProductCard, ComparisonTable, etc.
        │   ├── cart/         # CartItem, QuantityStepper, DiscountInput
        │   ├── checkout/     # CheckoutWizard, ShippingForm, etc.
        │   ├── search/       # SearchBar, FilterPanel, SortDropdown
        │   └── tracking/     # EventProvider, TaskBanner
        ├── pages/            # Route page components
        ├── store/            # Zustand state stores
        ├── hooks/            # Custom React hooks
        ├── lib/              # API client + event tracker
        └── types/            # TypeScript interfaces
```

## 🔗 API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List/search products (query params: q, category, minPrice, maxPrice, minRating, sort, page, limit) |
| GET | `/api/products/:slug` | Product detail |
| GET | `/api/products/compare?ids=1,2,3` | Compare multiple products |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | Full category tree with product counts |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/cart` | Create new cart session |
| GET | `/api/cart/:sessionId` | Get cart with items and totals |
| POST | `/api/cart/:sessionId/items` | Add item `{ productId, quantity }` |
| PATCH | `/api/cart/:sessionId/items/:id` | Update quantity `{ quantity }` |
| DELETE | `/api/cart/:sessionId/items/:id` | Remove item |
| POST | `/api/cart/:sessionId/discount` | Apply discount `{ code }` |
| DELETE | `/api/cart/:sessionId/discount` | Remove discount |

### Checkout
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/checkout/:sessionId` | Submit order |
| GET | `/api/orders/:orderId` | Get order confirmation |

### Interaction Logging
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events` | Batch submit events |
| POST | `/api/sessions` | Start test session |
| PATCH | `/api/sessions/:id` | Update/end session |

### Researcher Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/sessions` | List all test sessions |
| GET | `/api/admin/sessions/:id` | Session detail |
| GET | `/api/admin/sessions/:id/events` | Paginated event log |
| GET | `/api/admin/metrics` | Aggregate usability metrics |
| GET | `/api/admin/export/:sessionId` | Export session as JSON |

## 🧪 Usability Test Tasks

Access tasks via URL parameter `?task=N` or the task banner dropdown:

1. **Simple Search & Purchase** — Search for 'wireless headphones', pick the first result, complete purchase
2. **Category & Filter** — Browse Electronics, find a laptop under $1000 with 4+ stars
3. **Product Comparison** — Find Galaxy S24, compare with iPhone 15, add preference to cart
4. **Cart Management** — Change quantity to 3, apply discount code 'SAVE20'
5. **Complete Checkout** — Fill shipping details and complete the order

## 🏷 Discount Codes

| Code | Type | Value | Min Purchase |
|------|------|-------|-------------|
| `SAVE20` | Percentage | 20% off | None |
| `WELCOME10` | Fixed | $10 off | $50 |
| `HALF50` | Percentage | 50% off | $100 |
| `FREESHIP` | Fixed | Free shipping | None |

## 📊 Tracked Interaction Events

The system captures these events automatically:

| Event | Description |
|-------|-------------|
| `page_view` | Every route navigation |
| `click` | All clicks on interactive elements |
| `search_query` | Search submissions |
| `filter_apply` / `filter_remove` | Filter interactions |
| `product_view` | Product detail page views |
| `compare_add` / `compare_remove` | Comparison list changes |
| `cart_add` / `cart_remove` | Cart modifications |
| `quantity_change` | Quantity adjustments |
| `discount_apply` / `discount_remove` | Discount code interactions |
| `checkout_start` / `checkout_step` / `checkout_back` | Checkout navigation |
| `form_error` / `form_correction` | Form validation events |
| `checkout_complete` | Successful order placement |

## 📄 License

Academic project — MIT License.
