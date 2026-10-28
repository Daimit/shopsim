# Usability Testing Protocol & Experimental Procedure

**Project:** ShopSim – E-Commerce Usability Simulator  
**Milestone:** Milestone 4 – UX & Usability Testing  
**Lead Research Team:** Usability Engineering Group  
**Target Date:** October 2026  

---

## 1. Research Objectives & Context

### 1.1 Main Research Question
> **"Which parts of a multi-step purchasing process create the greatest usability difficulties for users?"**

### 1.2 Specific Empirical Targets
The testing protocol is designed to quantitatively and qualitatively measure:
1. **Task Completion Rate (TCR):** Proportion of participants successfully completing each stage without external assistance.
2. **Time on Task (ToT):** Duration in seconds from task initiation to task completion.
3. **Lostness & Backtracking Frequency:** Number of reverse navigation events (`navigation_back`) indicating disorientation or dead ends.
4. **Input Error Frequency:** Count of client-side validation errors in checkout, coupons, and cart steppers.
5. **Subjective Satisfaction:** Standardized System Usability Scale (SUS) composite rating.

---

## 2. Experimental Design

- **Study Type:** Within-Subjects Controlled Usability Lab Experiment.
- **Participant Sample:** $N = 8$ participants representing diverse demographic cohorts (ages 19–55, mixed technical proficiency, mobile and desktop viewports).
- **Session Duration:** 15–20 minutes per participant.
- **Environment:**
  - Chrome / Safari / Edge standard web browsers.
  - Client viewport configurations: Desktop ($1920 \times 1080$, $1440 \times 900$), Laptop ($1366 \times 768$), and Mobile ($390 \times 844$).
  - Telemetry logging: Background batch buffer flushing to SQLite every 5 seconds.

---

## 3. Pre-Test Procedure (Minutes 0–5)

1. **Reception & Welcome:**
   - Welcome the participant and escort them to the testing station.
   - Explain that the purpose is to test the **system's usability**, not the participant's intelligence or skill.
2. **Informed Consent:**
   - Administer the [Informed Consent Form](CONSENT_FORM.md).
   - Ensure the participant understands that no real financial transactions take place.
3. **Demographic Intake:**
   - Record age, gender, frequency of online shopping, and self-rated technical comfort.
4. **Think-Aloud Briefing:**
   - Instruct the participant to vocalize their thoughts as they navigate:
     > *"Please tell me what you are looking for, what you expect to happen when you click something, and if anything confuses or surprises you."*

---

## 4. Predefined Evaluation Scenarios (Minutes 5–15)

The interactive application features a persistent **Task Banner** (`?task=1..5`) showing instructions and detecting task completion.

```
┌────────────────────────────────────────────────────────────────────────┐
│  Task 1/5: Search & Buy Headphones                                     │
│  Instruction: Search for 'wireless headphones', select first result... │
│  [Progress: 1/5]                    [Dismiss]                          │
└────────────────────────────────────────────────────────────────────────┘
```

### Scenario 1 (Task 1): Search & Buy Headphones
- **Task Goal:** Test direct search discovery and simple single-item checkout addition.
- **Prompt Given to User:** *"Search for 'wireless headphones', pick the first result, and add it to your shopping cart."*
- **Optimal Path:** Home $\rightarrow$ Click Search $\rightarrow$ Type "wireless headphones" $\rightarrow$ Press Enter $\rightarrow$ Click Product Card $\rightarrow$ Click "Add to Cart".
- **Optimal Metrics:** $\approx 3$ pages, 6 clicks, $< 60$ seconds.
- **Failure Condition:** Inability to find search bar, selecting incorrect category, or abandoning search results.

### Scenario 2 (Task 2): Filter Sub-$1000 Laptop
- **Task Goal:** Test multi-criteria faceted filtering (price threshold + rating minimum).
- **Prompt Given to User:** *"Browse Electronics > Laptops and find a laptop under $1000 with at least 4 stars rating. Add it to your cart."*
- **Optimal Path:** Categories dropdown $\rightarrow$ Laptops $\rightarrow$ Adjust price slider $\le 1000$ $\rightarrow$ Select 4+ stars $\rightarrow$ Click ASUS ZenBook 14 $\rightarrow$ Add to Cart.
- **Optimal Metrics:** $\approx 2$ pages, 7 clicks, $< 90$ seconds.
- **Key Observation Point:** Precision of price slider and clear display of rating filter pills.

### Scenario 3 (Task 3): Compare Flagship Phones
- **Task Goal:** Test comparative shopping mechanism and specification matrix evaluation.
- **Prompt Given to User:** *"Find the 'Galaxy S24' and compare it side-by-side with the 'iPhone 15'. Add your preferred phone to the cart."*
- **Optimal Path:** Search "Galaxy S24" $\rightarrow$ Click "Compare" button $\rightarrow$ Search "iPhone 15" $\rightarrow$ Click "Compare" button $\rightarrow$ View Comparison Table $\rightarrow$ Click "Add to Cart" on winner.
- **Optimal Metrics:** $\approx 4$ pages, 8 clicks, $< 110$ seconds.
- **Key Observation Point:** Visibility of the comparison tray and ease of finding technical attribute discrepancies.

### Scenario 4 (Task 4): Cart Quantity & Promo Code Application
- **Task Goal:** Test shopping cart configuration, stepper controls, and promotional voucher validation.
- **Prompt Given to User:** *"Open your cart, change the quantity of an item to 3 units, and apply the discount code 'SAVE20'."*
- **Optimal Path:** Open Cart $\rightarrow$ Click `+` on quantity stepper until count equals 3 $\rightarrow$ Enter `SAVE20` in promo box $\rightarrow$ Click "Apply".
- **Optimal Metrics:** 1 page, 4 clicks, $< 50$ seconds.
- **Key Observation Point:** Responsive subtotal recalculation and clear visual validation feedback.

### Scenario 5 (Task 5): Multi-Step Checkout Wizard
- **Task Goal:** Complete multi-step shipping, delivery, and simulated payment workflows without error.
- **Prompt Given to User:** *"Proceed through checkout. Fill in any valid simulated shipping address, select delivery, choose payment, and complete the order."*
- **Optimal Path:** Checkout $\rightarrow$ Step 1 (Shipping Form) $\rightarrow$ Next $\rightarrow$ Step 2 (Delivery Method) $\rightarrow$ Next $\rightarrow$ Step 3 (Payment Form) $\rightarrow$ Next $\rightarrow$ Step 4 (Review) $\rightarrow$ Place Order $\rightarrow$ Order Confirmed.
- **Optimal Metrics:** 4 wizard steps, 14 form fields, $< 140$ seconds.
- **Key Observation Point:** Field validation error recovery, step indicator progress, and form persistence upon back navigation.

---

## 5. Post-Test Procedure (Minutes 15–20)

1. **System Usability Scale Administration:**
   - Present the 10-item [SUS Questionnaire](SUS_QUESTIONNAIRE.md).
   - Ensure the participant scores each question without researcher intervention.
2. **Semi-Structured Debrief Interview:**
   - *Question 1:* "Which part of the purchasing journey felt most effortless?"
   - *Question 2:* "Where did you feel the most hesitation or uncertainty?"
   - *Question 3:* "How did the checkout process compare to e-commerce sites you frequently use?"
   - *Question 4:* "If you could change one aspect of the navigation or layout, what would it be?"
3. **Session Closure:**
   - Thank the participant for their time and conclude the telemetry session.
