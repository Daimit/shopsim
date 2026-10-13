# E-Commerce Usability Simulator — Presentation Slide Deck Content

Use this comprehensive slide-by-slide guide to build your presentation (PowerPoint, Google Slides, or Keynote). Each slide includes visual layout suggestions, bullet points, and speaker notes.

---

## Slide 1: Title Slide

- **Slide Title**: E-Commerce Usability Simulator
- **Subtitle**: A Controlled Experimental Testbed for Studying Multi-Step Purchasing Workflows
- **Metadata**:
  - Academic Year: 2026–2027
  - Team Members & Roles: [Project Lead, UX Researcher, Frontend Engineer, Backend Engineer, QA/Data Analyst]
  - Faculty / Course: UX Design & Human-Computer Interaction / Software Engineering

> **Speaker Notes**:
> "Good morning/afternoon everyone. Today, our team is presenting the E-Commerce Usability Simulator. Rather than building a conventional commercial store, our project focuses on developing a fully instrumented, controlled research platform to observe, measure, and analyze user friction during multi-step online shopping workflows."

---

## Slide 2: Problem Statement & UX Context

- **Header**: Why Study E-Commerce Usability?
- **Key Challenges in Real-World Commerce**:
  - **70.19% Average Cart Abandonment**: Global benchmark (Baymard Institute) shows 7 out of 10 shopping carts are abandoned before completion.
  - **Cognitive Overload**: Complicated form layouts, unexpected discount rules, and comparison difficulties fatigue users.
  - **Production Limitations**: Commercial e-commerce stores cannot be used for controlled scientific experiments due to constantly shifting A/B tests, proprietary analytics, and financial/privacy constraints.
- **Our Solution**:
  - A zero-risk, sandbox environment with full observability down to individual clickstreams, form corrections, and page dwell times.

> **Speaker Notes**:
> "E-commerce checkout flows are notoriously prone to abandonment. In the real world, researchers cannot isolate experimental variables on live commercial platforms. Our simulator provides a stable, reproducible lab environment with simulated transactions where every click, mistake, and delay is tracked."

---

## Slide 3: Primary Research Question

- **Header**: Core Research Question
- **Central Question Callout**:
  > *"Which specific stages of a multi-step purchasing process introduce the greatest cognitive load and interaction friction for users?"*
- **Investigative Pillars**:
  1. **Product Discovery & Comparison**: How easily can users find and compare products across attribute matrices?
  2. **Cart Management**: Does quantity modification and promotional voucher application cause input friction?
  3. **Multi-Step Checkout**: Where do users hesitate, backtrack, or make form validation errors?

> **Speaker Notes**:
> "Our core objective is not simply to record whether a user finished a purchase, but to map the exact touchpoints where users experience friction, repeat actions, or backtrack. This slide establishes our guiding research question across discovery, cart manipulation, and checkout."

---

## Slide 4: Target User Groups & Personas

- **Header**: Target Audience & Experimental Personas
- **Experimental Stakeholders**:
  - **Test Participants**: Everyday consumers (ages 18–65) with varying digital literacy performing standardized tasks.
  - **UX Researchers / Observers**: Evaluators observing live participant sessions and extracting quantitative interaction logs.
  - **System Administrators**: Researchers configuring product catalogues, discount codes, and test scenarios.
- **Three Persona Profiles**:
  - *The Focused Buyer*: Goal-oriented, relies heavily on search and quick checkout.
  - *The Comparison Shopper*: Analytical, inspects detailed specifications and weighs price-to-performance.
  - *The Discount Hunter*: Price-sensitive, focuses on coupon vouchers and cart total updates.

> **Speaker Notes**:
> "We designed the simulator to support diverse consumer behaviors. We defined three key personas: the focused buyer who searches directly, the comparison shopper who evaluates specs across multiple devices, and the discount hunter who tests vouchers and modifies cart items."

---

## Slide 5: Full-Stack Technical Stack

- **Header**: Modern Full-Stack Architecture
- **Technology Breakdown Table**:

| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript | Component-level isolation, type safety, predictable rendering |
| **Build & Tooling** | Vite 5 | Instant HMR, rapid compilation, optimized asset bundling |
| **Styling & Design System** | Tailwind CSS v4 | Consistent design tokens, responsive layouts, rapid prototyping |
| **State Management** | Zustand | Lightweight client stores (Cart, Compare, Filters, Session) |
| **Routing** | React Router v6 | Single Page App (SPA) navigation with route-change tracking |
| **Backend Framework** | Node.js + Express.js | High-throughput async REST endpoints, JSON payload handling |
| **ORM & Database** | Prisma ORM + SQLite | Zero-infrastructure deployment, typed models, relational integrity |
| **Icons & UI Assets** | Lucide React | Consistent, accessible iconography |

> **Speaker Notes**:
> "We selected a modern, cohesive TypeScript stack. React 18 with Vite and Tailwind CSS v4 ensures ultra-fast client responsiveness, while Zustand provides lightweight state stores. The backend is an Express.js API backed by Prisma ORM and SQLite, giving us a portable, zero-configuration database that stores both the product catalog and granular user telemetry."

---

## Slide 6: System Architecture & Data Flow

- **Header**: High-Level Architecture
- **Architecture Diagram**:
  ```
  ┌──────────────────────────────────────────────────────────┐
  │                   Client Browser (React 18)              │
  │  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐  │
  │  │ UI Component │   │ Zustand State│   │ EventTracker │  │
  │  │ (Pages/Views)│◄─►│ (Cart/Compare)│   │  (Telemetry) │  │
  │  └───────┬──────┘   └──────────────┘   └───────┬──────┘  │
  └──────────┼─────────────────────────────────────┼─────────┘
             │                                     │
      HTTP REST API                         Batch Events
    (Proxy /api :5173)                   (5s Buffer / Beacon)
             │                                     │
  ┌──────────▼─────────────────────────────────────▼─────────┐
  │                  Express Backend (:3001)                 │
  │  ┌───────────────────────┐     ┌──────────────────────┐  │
  │  │  Commerce Endpoints   │     │  Telemetry Ingestion │  │
  │  │ (/products, /cart...) │     │ (/events, /sessions) │  │
  │  └───────────┬───────────┘     └──────────┬───────────┘  │
  │              └──────────────┬─────────────┘              │
  │                             ▼                            │
  │                        Prisma ORM                        │
  │                             ▼                            │
  │                     SQLite (dev.db)                      │
  └──────────────────────────────────────────────────────────┘
  ```
- **Key Architectural Highlights**:
  - Automatic event buffering (up to 10 events or 5-second interval) to prevent UI thread lag.
  - Fallback beacon flushing (`navigator.sendBeacon`) on page unload.
  - Complete separation of study telemetry from business logic.

> **Speaker Notes**:
> "This diagram demonstrates how telemetry is cleanly decoupled from core business operations. As users navigate the store, our custom EventTracker buffers interactions in memory and flushes batches to the server. If a participant suddenly closes their tab, the browser's beacon API guarantees the final events are saved."

---

## Slide 7: Database & Data Modeling

- **Header**: Relational Data Schema (Prisma + SQLite)
- **9 Core Entities**:
  1. **Category**: Hierarchical tree structure (Electronics, Apparel, Home & Kitchen) with self-referencing parent/child relationships.
  2. **Product**: 42 seeded catalog items with pricing, inventory stock, JSON specifications, and key features.
  3. **CartSession & CartItem**: UUID session tracking, item quantities, and relations.
  4. **DiscountCode**: Configurable percentage (`SAVE20`) or fixed deduction (`WELCOME10`) vouchers with minimum spend rules.
  5. **Order**: Simulated transactions with address details, payment method, order total, and discount audits.
  6. **TestSession**: Research session metadata (participant ID, scenario ID, browser user-agent, screen resolution).
  7. **InteractionEvent**: Time-series log containing event type, target selector, route, JSON metadata, and sequence counter.
  8. **TaskProgress**: Per-task lifecycle (`pending` → `in_progress` → `completed` / `abandoned`).

> **Speaker Notes**:
> "Our schema contains 9 Prisma models. Notice how the database is split into two halves: the e-commerce entities (products, cart, orders) and the research instrumentation entities (test sessions, interaction events, task progress). This allows us to correlate specific product attributes directly with participant behavior."

---

## Slide 8: Key Functional Features

- **Header**: Application Features Overview
- **Feature Set**:
  - 🔍 **Product Discovery & Search**: Full-text keyword search with live result counts.
  - 🏷️ **Faceted Filtering**: Multilevel category tree, price range sliders, minimum star ratings, and in-stock toggles.
  - ⚖️ **Side-by-Side Comparison Matrix**: Compare 2 to 4 products concurrently across technical specs and feature highlights.
  - 🛒 **Interactive Shopping Cart**: Quantity stepper (+/−), line items, instant subtotal calculation, and remove triggers.
  - 🎟️ **Promo Voucher Engine**: Validates active discount codes (`SAVE20`, `WELCOME10`), updates order totals, and provides visual error cues.
  - 💳 **4-Step Checkout Wizard**: Step-by-step progress bar (Shipping Form with inline validation → Simulated Payment → Order Review → Confirmation).

> **Speaker Notes**:
> "The simulator includes every essential feature of a modern online retailer. Users can search, filter by multiple criteria, compare up to four products in a clean columnar matrix, adjust cart quantities, apply discount codes, and complete a 4-step checkout wizard."

---

## Slide 9: Usability Telemetry & Interaction Logging

- **Header**: The Telemetry & Tracking Engine
- **Event Taxonomy**:

| Event Type | Trigger | Captured Metadata |
| :--- | :--- | :--- |
| `page_view` | Route change | Previous route, current route, timestamp |
| `click` | User interaction | Target element, CSS selector, inner text |
| `search_query` | Search submission | Query keywords, returned product count |
| `filter_apply` | Filter sidebar change | Filter type (price, rating, category), value |
| `compare_add` | Adding product to compare | Product ID, total items currently comparing |
| `compare_view` | Visiting comparison matrix | Array of compared product IDs |
| `quantity_change` | Stepper or input edit | Old quantity, new quantity, stepper vs. keyboard |
| `discount_apply` | Voucher submission | Code entered, success status, error message |
| `checkout_step` | Wizard step progression | Step index (1–4), step name |
| `checkout_back` | User backtracks in wizard | Origin step, destination step |
| `checkout_complete` | Final purchase submission | Order ID, total amount, applied discount |

> **Speaker Notes**:
> "This slide details our telemetry engine. Every meaningful micro-action emits a structured JSON event. We capture explicit actions like quantity modifications and voucher validation attempts, as well as navigation behaviors like checkout backtracking and filter resets."

---

## Slide 10: Study Design & Usability Test Tasks

- **Header**: Usability Test Protocol & Tasks
- **Protocol Details**:
  - Moderated test sessions (45–60 minutes per participant).
  - Think-aloud protocol combined with automated background data collection.
  - On-screen persistent Study Task Banner (`?task=1..5`) guiding users.
- **5 Standardized Tasks**:
  - **Task 1 (Baseline)**: Search for 'wireless headphones', select the top result, and complete purchase.
  - **Task 2 (Filtering)**: Browse Electronics, filter for a laptop under $1000 with 4+ stars, and add to cart.
  - **Task 3 (Comparison)**: Search for Galaxy S24, compare against iPhone 15, and choose one.
  - **Task 4 (Cart Management)**: Adjust quantity to 3 units, apply discount code `SAVE20`, and verify discount.
  - **Task 5 (Checkout)**: Complete multi-step shipping and payment wizard.

> **Speaker Notes**:
> "We defined five standardized experimental tasks. Task 1 provides a baseline. Tasks 2 and 3 measure discovery and comparative decision making. Tasks 4 and 5 directly test cart manipulation and checkout flow friction."

---

## Slide 11: The Reference Scenario Walkthrough

- **Header**: Reference Usability Scenario
- **Scenario Narrative (from Project Brief)**:
  > *"Find a specified product, compare it with another product, add the selected product to the shopping cart, change the quantity to three units, apply a provided discount code, and proceed to the final checkout screen."*
- **Step-by-Step Flow**:
  1. **Search**: Search for "Galaxy S24".
  2. **Compare**: Add Galaxy S24 and iPhone 15 to comparison tray; inspect specifications.
  3. **Add to Cart**: Select Galaxy S24 directly from comparison table.
  4. **Quantity Modification**: Change unit count from 1 to 3 in cart.
  5. **Apply Voucher**: Apply promo code `SAVE20` (receives 20% discount: $2,399.97 → $1,919.98).
  6. **Checkout Wizard**: Fill simulated shipping data, select payment method, and complete order.

> **Speaker Notes**:
> "This slide highlights the exact reference scenario specified in the project requirements. It touches every major system component: search, side-by-side comparison, cart addition, quantity stepper, discount voucher engine, and the 4-step checkout wizard."

---

## Slide 12: Researcher / Admin Analytics Dashboard

- **Header**: Researcher Analytics & Observation Center
- **Dashboard Capabilities**:
  - **Live Session Monitoring**: Table of all participant sessions with start times, completion status, and event tallies.
  - **Telemetry Inspection**: Detailed session drill-down showing chronological interaction event logs with timestamps.
  - **Aggregate Usability Metrics**:
    - Average task completion duration.
    - Funnel completion rates.
    - Common validation error hotspots.
  - **Data Export**: One-click JSON data export for offline statistical analysis (e.g., in Python, R, or SPSS).

> **Speaker Notes**:
> "The Admin Dashboard provides researchers with immediate visibility into participant sessions. Evaluators can view aggregate metrics, inspect granular chronological event logs for any session, or export complete JSON datasets for statistical analysis in external tools."

---

## Slide 13: Evaluation Metrics Framework

- **Header**: Usability Metrics & Evaluation Criteria
- **Dual-Method Measurement Approach**:

### Objective Telemetry Metrics
- **Task Completion Rate (TCR)**: Percentage of participants successfully finishing each task.
- **Time-on-Task (ToT)**: Duration from `task_start` to `task_complete`.
- **Navigation Efficiency**: Number of page visits compared to the optimal navigation path.
- **Backtracking Frequency**: Number of `checkout_back` events indicating confusion.
- **Error Frequency**: Form validation rejections and failed voucher applications.

### Subjective Evaluation
- **System Usability Scale (SUS)**: Standard 10-item questionnaire yielding a normalized 0–100 usability score.
- **Single Ease Question (SEQ)**: 7-point post-task difficulty rating.
- **Qualitative Think-Aloud Feedback**: Participant verbalizations of frustration or uncertainty.

> **Speaker Notes**:
> "Our evaluation combines objective telemetry with subjective psychometric instruments. By correlating quantitative metrics like backtracking and dwell times with qualitative think-aloud notes and SUS scores, we gain a comprehensive understanding of user difficulties."

---

## Slide 14: Key Usability Difficulties Identified

- **Header**: Preliminary Findings & Usability Friction Points
- **Top 4 Usability Bottlenecks Discovered**:
  1. **Comparison Affordance Discoverability**:
     - *Issue*: Participants initially overlooked the compare checkbox on product cards.
     - *Fix*: Added a prominent floating comparison indicator and badge count in the top navigation.
  2. **Voucher Code Error Feedback**:
     - *Issue*: Case sensitivity and subtle error messages caused confusion when promo codes were rejected.
     - *Fix*: Normalized input to uppercase automatically and added clear inline error alerts with minimum spend thresholds.
  3. **Checkout Form Re-entry & Backtracking**:
     - *Issue*: Users who navigated back from Review to Shipping worried their form data was erased.
     - *Fix*: Preserved form state in session memory so previous entries remain intact when backtracking.
  4. **Cart Badge Notification**:
     - *Issue*: Users were unsure whether items were added without opening the cart.
     - *Fix*: Added animated badges and instant button feedback ('Added to Cart!').

> **Speaker Notes**:
> "During our preliminary usability testing, we identified four major friction points: discovering the comparison feature, ambiguity during discount code entry, apprehension when backtracking during checkout, and feedback after adding to cart. We immediately implemented iterative design improvements to address each issue."

---

## Slide 15: Project Milestones & Execution Roadmap

- **Header**: Project Milestones (Milestones 1–5)
- **Timeline Overview**:
  - **Milestone 1 — Proposal & Analysis**: Problem definition, requirements specification, and UX relevance analysis.
  - **Milestone 2 — UX/UI Design & Prototyping**: Information architecture, 5 core user flows, Figma wireframes, and scenario design.
  - **Milestone 3 — Functional Prototype**: Full-stack application implementation, 42-product database seeding, and telemetry logging engine.
  - **Milestone 4 — Usability Testing**: Execution of 5 test scenarios, interaction log analysis, and SUS survey administration.
  - **Milestone 5 — Final Product & Defence**: Usability evaluation report, source code repository packaging, and live demonstration.

> **Speaker Notes**:
> "Our project progressed through five structured milestones: from initial problem definition in Milestone 1, to wireframing and prototyping in Milestone 2, full-stack implementation and telemetry integration in Milestone 3, formal usability testing in Milestone 4, and final documentation and defense today in Milestone 5."

---

## Slide 16: Live Demonstration Plan

- **Header**: Live Demonstration Script
- **Demonstration Steps**:
  1. **Homepage & Search**: Demonstrate full-text search for `Galaxy S24`.
  2. **Faceted Filtering**: Filter catalog by price range and star rating.
  3. **Product Comparison**: Add Galaxy S24 and iPhone 15 to the comparison matrix; inspect attributes.
  4. **Cart Manipulation**: Add to cart, adjust quantity to 3 via the stepper, apply code `SAVE20`, and verify discount.
  5. **Checkout Wizard**: Complete Shipping, Payment, and Review steps to generate order confirmation.
  6. **Admin Dashboard**: Open `/admin` to show the newly recorded session and inspect the exact chronological event timeline.

> **Speaker Notes**:
> "We will now demonstrate the application live. We will execute the reference scenario end-to-end, and then navigate directly to the Admin Dashboard to show the real-time event logs and metrics captured during the workflow."

---

## Slide 17: Conclusion & Future Work

- **Header**: Conclusion & Future Extensions
- **Key Takeaways**:
  - Built a robust, instrumented e-commerce simulator tailored for academic UX research.
  - Demonstrated that checkout friction is heavily driven by ambiguous form states and voucher affordances.
  - Validated that lightweight telemetry capture provides actionable insight without impacting user experience.
- **Future Enhancements**:
  - Visual click/scroll heatmaps generated directly from stored coordinates.
  - Automated session replay using DOM mutation snapshots (e.g., rrweb).
  - A/B testing module allowing researchers to toggle between one-page vs. multi-step checkout layouts.

> **Speaker Notes**:
> "In conclusion, the E-Commerce Usability Simulator successfully delivers a controlled, observable research platform that bridges the gap between software engineering and UX evaluation. In future iterations, we plan to incorporate automated session replay and dynamic A/B test toggles. Thank you for your time, and we welcome your questions."

---

## Slide 18: Q&A / Thank You Slide

- **Slide Title**: Questions & Answers
- **Text**: Thank you for your attention!
- **Project Links**:
  - Repository: `ecommerce-usability-simulator`
  - Documentation: `README.md` & `build-status-report.md`
  - Live Demo: `http://localhost:5173`
