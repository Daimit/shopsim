# ShopSim Information Architecture and User Flows

## Information Architecture

```text
ShopSim
├── Home
│   ├── Search autocomplete
│   ├── Featured products
│   └── Category navigation
├── Category / Search Results
│   ├── Price, rating, stock and subcategory filters
│   ├── Sort controls
│   └── Product cards
├── Product Details
│   ├── Specifications
│   ├── Reviews
│   ├── Compare
│   └── Add to cart
├── Compare
│   ├── Comparison tray
│   ├── Side-by-side specification table
│   └── Add selected product to cart
├── Cart
│   ├── Quantity controls
│   ├── Remove item
│   ├── Discount code and offers
│   └── Checkout
├── Checkout
│   ├── Shipping
│   ├── Payment
│   ├── Review
│   └── Confirmation → Post-test feedback
└── Research Workspace
    ├── Sessions
    ├── Session telemetry
    ├── Behavior analytics
    └── CSV / JSON export
```

## Primary User Flow

`Home → Search or Category → Filter / Compare → Product Details → Cart → Quantity / Discount → Checkout → Confirmation → Feedback`

## Researcher Flow

`Admin login → Sessions → Session detail → Event timeline / export → Analytics → Task funnel / errors / SUS`

## Interaction Principles

- Keep discovery, comparison and cart actions available without losing the current workflow.
- Make task progress and checkout step state visible.
- Record objective events without exposing telemetry controls to participants.
- Collect subjective feedback only after the simulated order is confirmed.
