# LILTREATS V1 – Module Build Tracker

> Single source of truth for build progress.
> Update status after every module is completed.
> Status: ✅ Complete | 🔄 In Progress | ⬜ Not Started

---

## PROGRESS OVERVIEW

| # | Module | Status | Priority |
|---|--------|--------|----------|
| 1 | Home Page | ✅ Complete | P0 |
| 2 | Scoop Detail Page & Booking Flow | ✅ Complete | P0 |
| 3 | Video Date & Slot Picker | ✅ Complete | P0 |
| 4 | Individual Items Shop | ✅ Complete | P0 |
| 5 | Cart & Checkout | ✅ Complete | P0 |
| 6 | Order Confirmation | ✅ Complete | P0 |
| 7 | Login / Signup UI | ✅ Complete | P1 |
| 8 | Customer Account & Profile | ✅ Complete | P1 |
| 9 | My Orders | ✅ Complete | P1 |
| 10 | My Bookings | ✅ Complete | P1 |
| 11 | How It Works | ✅ Complete | P2 |
| 12 | Contact Us | ✅ Complete | P2 |
| 13 | Admin Dashboard | ✅ Complete | P1 |
| 14 | Admin Order Management | ✅ Complete | P1 |
| 15 | Admin Scoop Bookings | ✅ Complete | P1 |
| 16 | Admin Video Bookings Calendar | ✅ Complete | P1 |
| 17 | Admin Inventory Management | ✅ Complete | P1 |
| 18 | Admin Product Management | ✅ Complete | P1 |
| 19 | Admin Scoop Management + Item Mapping | ⬜ Not Started | P1 |
| 20 | Admin Payments | ✅ Complete | P1 |
| 21 | Admin Customer Management | ✅ Complete | P1 |
| 22 | Admin Delivery Management | ✅ Complete | P1 |
| 23 | Admin Profit & Loss | ✅ Complete | P1 |
| 24 | Admin Reports + CSV Export | ✅ Complete | P2 |
| 25 | Admin Video Slot Configuration | 🔄 In Progress | P2 |
| 26 | Website Content Management (CMS) | ⬜ Not Started | P2 |
| 27 | Customer Notifications | ⬜ Not Started | P3 |
| 28 | Admin Notifications | ⬜ Not Started | P3 |
| 29 | Coupon / Discount System | ⬜ Not Started | Future |
| 30 | Supabase Backend (Real Database) | ⬜ Not Started | Future |

---

## MODULE 1 – HOME PAGE

**Route:** `/`
**File:** `src/routes/HomeRoute.tsx`
**Status:** ✅ Complete

### What is built
- Hero: correct spec headline "Your Mystery Scoop. Your Surprise. Your LilTreat!"
- Two CTA buttons: "Explore Scoops" (scrolls to tier section) + "Shop Individual Items" (→ /shop)
- How It Works: 4-step grid (Choose Scoop / With or Without Video / Pick date & slot / Pay & enjoy)
- Live drop badge with countdown
- Week strip with per-tier slot counts
- "Our Scoops" section with TierCards (vessel animation, detail panel accordion)
- **"View Details" + "Book Now" buttons on every tier card detail panel** ✅ Added
- Individual Items promo strip with "Shop now" → /shop
- Past drops carousel (links to IG)
- Testimonials
- IG follow strip
- Referral card
- Contact button
- Sticky "Book now" CTA appears after tier selection

### Acceptance criteria — all met
- [x] Hero headline matches spec
- [x] Two CTA buttons: Explore Scoops + Shop Individual Items
- [x] How It Works has 4 steps
- [x] Tier cards show "View Details" and "Book Now" buttons in detail panel
- [x] Mobile-first, works at 375px

---

## MODULE 2 – SCOOP BOOKING FLOW

**Route:** `/book/$tier`
**File:** `src/routes/PreferencesRoute.tsx`
**Status:** ✅ Complete

### What is built
- Tier summary card (name, price, items, perks) at top of page
- Step indicator: Choose → Experience → (Slot) → Cart
- Vibe selection (multi-select chips)
- Favourite categories grid
- Avoid note (text input)
- With Video / Without Video prominent choice cards
- VideoSlotPicker revealed when With Video selected
- Continue button: disabled until slot selected (if video), or always enabled (if no video)
- Navigates to /cart on continue

### Spec flow implemented
```
Home → tap tier → tap "Book Now" → /book/$tier
→ fill preferences → choose With/Without Video
→ (if With Video) pick date and slot
→ Continue → /cart
```

---

## MODULE 3 – VIDEO DATE & SLOT PICKER

**Component:** `src/components/VideoSlotPicker.tsx`
**Status:** ✅ Complete

### Rules enforced
- Minimum lead time: 5 days from today
- Booking window: 30 days from earliest eligible date (total 35-day calendar)
- Maximum bookings per day: 2 (fully booked dates greyed out)
- Slot times configurable from mock data (replaceable with Supabase)

### What is built
- Horizontal scrollable date strip (35 days, starting 5 days from today)
- Fully booked dates shown as red/disabled
- Per-date slot list with availability
- Selected slot stored in cartStore: selectedVideoSlotId, selectedVideoDate, selectedVideoTime

---

## MODULE 4 – INDIVIDUAL ITEMS SHOP

**Routes:** `/shop`, `/shop/$itemId`
**Files:** `src/routes/ShopRoute.tsx`, `src/routes/ShopItemRoute.tsx`
**Status:** ✅ Complete

### What is built
- ShopRoute: 2-column grid, search bar, category filter, sort (newest/popular/price asc/desc)
- Out-of-stock items pushed to bottom with badge
- Add to Cart on grid tile
- ShopItemRoute: item detail page, quantity selector, Add to Cart / Buy Now
- Cart badge updates in real time
- Linked from Home hero "Shop Individual Items" button

### Still needs (future)
- Real product images (currently emoji placeholders)
- Best Selling sort (needs real order data)

---

## MODULE 5 – CART & CHECKOUT

**Route:** `/cart`
**File:** `src/routes/CartRoute.tsx`
**Status:** ✅ Complete

### What is built
- Unified cart: scoop booking + individual items together
- Scoop row: icon, name, tier, price, video add-on row with date/time
- Individual items: list with +/- quantity and remove
- Order summary: subtotal, shipping, total
- Delivery form: name, phone, email, Instagram, house/flat, street, area, city, state, pincode, note
- Payment method selector (UPI / Card / Wallet)
- Place Order creates order via useCreateOrder
- Disabled until required fields filled
- Video slot still-available check before submit

### Spec fields — all present
- [x] Full Name
- [x] Mobile Number
- [x] Email
- [x] House/Flat
- [x] Street
- [x] Area
- [x] City
- [x] State
- [x] Pincode

---

## MODULE 6 – ORDER CONFIRMATION

**Route:** `/confirm`
**File:** `src/routes/ConfirmRoute.tsx`
**Status:** ✅ Complete

### What is built
- Confetti animation on mount
- Order ID: LT-YYYY-NNNNN format
- Order summary: tier, price, video details, delivery area, status
- Share / Track my order / Back to home buttons

---

## MODULE 7 – LOGIN / SIGNUP UI

**Route:** `/login`
**File:** `src/routes/LoginRoute.tsx`
**Status:** ⬜ Not Started

### To build
- Login tab: phone/email + password, validation, error states
- Signup tab: name, phone, email, password, confirm password
- Forgot password link
- After login: redirect to intended page or /account
- Auth context / store (mock for now, Supabase later)

### Acceptance criteria
- [ ] Login form with validation
- [ ] Signup form with validation
- [ ] Error states (wrong password, user exists, etc.)
- [ ] Successful login navigates to account
- [ ] Checkout prompts login if not logged in

---

## MODULE 8 – CUSTOMER ACCOUNT & PROFILE

**Route:** `/account`
**File:** `src/routes/AccountRoute.tsx`
**Status:** ⬜ Not Started

### Current state
- Profile header with stats (mock data only)
- Navigation menu links
- No edit functionality wired

### To build
- Profile edit: name, phone, email (saves to store/Supabase)
- Address management: add, edit, delete, set default
- Notification list
- Payment/transaction history tab
- All data driven by logged-in user (after Module 7)

---

## MODULE 9 – MY ORDERS

**Route:** `/orders`
**File:** `src/routes/OrdersRoute.tsx`
**Status:** ✅ Complete

### What is built
- Order cards (expandable) with all spec fields
- Status timeline with dot indicators (7 statuses)
- Payment badge
- Video booking info
- Delivery address + courier tracking with external link

---

## MODULE 10 – MY BOOKINGS

**Route:** `/bookings`
**File:** `src/routes/BookingsRoute.tsx`
**Status:** ✅ Complete

### What is built
- Video bookings section (separate card per booking)
- Normal scoop bookings section
- Per-booking: ID, order ID, tier, experience, video date/time, status

---

## MODULE 11 – HOW IT WORKS

**Route:** `/how-it-works`
**File:** `src/routes/HowItWorksRoute.tsx`
**Status:** ✅ Complete

### What is built
- 4-step visual flow matching spec
- FAQ accordion below steps

---

## MODULE 12 – CONTACT US

**Route:** `/contact`
**File:** `src/routes/ContactRoute.tsx`
**Status:** ✅ Complete

---

## MODULE 13 – ADMIN DASHBOARD

**Route:** `/admin/`
**File:** `src/routes/admin/AdminDashboardRoute.tsx`
**Status:** ✅ Complete

### KPI sections
- Sales: Today / Weekly / Monthly / Total
- Orders: Today / Pending / Processing / Shipped / Delivered / Cancelled
- Video Bookings: Today / Upcoming / Fully booked dates
- Inventory: Total SKUs / Low stock / Out of stock / Stock value
- Profit: Today / Monthly / Total

---

## MODULE 14 – ADMIN ORDER MANAGEMENT

**Route:** `/admin/orders`
**File:** `src/routes/admin/AdminOrdersRoute.tsx`
**Status:** ✅ Complete

### What is built
- Order list with expandable rows
- Status filter tabs
- Customer + address details
- Status update (all 7 statuses)
- Delivery tracking form (courier, number, URL)
- Financials: revenue, cost, profit per order

---

## MODULE 15 – ADMIN SCOOP BOOKINGS

**Route:** `/admin/scoop-bookings`
**File:** `src/routes/admin/AdminScoopBookingsRoute.tsx`
**Status:** ✅ Complete

### What is built
- Scoop booking list with filters: Mini / Magic / Premium / With Video / Without Video
- Per-booking: booking ID, order ID, customer, tier, experience, video date/slot, status
- Payment info, cost, profit per booking

---

## MODULE 16 – ADMIN VIDEO BOOKINGS CALENDAR

**Route:** `/admin/video-bookings`
**File:** `src/routes/admin/AdminVideoBookingsRoute.tsx`
**Status:** ✅ Complete

### What is built
- Week-by-week calendar navigation
- Per-date: booked count / capacity / remaining
- Colour coding: available / partial / fully booked
- Date drill-down: booking list for that day
- Slot block / unblock per date

### Needs (Module 25)
- Add / edit / delete time slots
- Configure max capacity, lead time, booking window

---

## MODULE 17 – ADMIN INVENTORY MANAGEMENT

**Route:** `/admin/inventory`
**File:** `src/routes/admin/AdminInventoryRoute.tsx`
**Status:** ✅ Complete

### What is built
- Summary cards: Total SKUs / Low stock / Out of stock / Stock value
- Per-item: cost, sell price, current stock, stock value, min stock
- Add Stock form (qty, cost, note)
- Manual Debit form (qty, reason)
- Adjust form (set physical count, difference calculated)
- Movement history: type, qty, reason, balance, date
- Low stock / out of stock alerts

---

## MODULE 18 – ADMIN PRODUCT MANAGEMENT

**Route:** `/admin/products`
**File:** `src/routes/admin/AdminProductsRoute.tsx`
**Status:** ✅ Complete

### What is built
- Product list with SKU, name, category, cost, sell price, stock
- Add product form: all spec fields (name, SKU, category, cost, sell, stock, min stock, description, featured/new flags)
- Edit product inline
- Toggle active / inactive

---

## MODULE 19 – ADMIN SCOOP MANAGEMENT + ITEM MAPPING

**Route:** `/admin/scoop-management`
**File:** `src/routes/admin/AdminScoopManagementRoute.tsx`
**Status:** ⬜ Not Started

### Critical feature
Each scoop tier must define which inventory items it contains and in what quantity.
When an order is confirmed, the system uses this mapping to auto-deduct stock.

```
Magic Scoop:
  Charm A × 1
  Bracelet B × 1
  Sticker C × 2
  → Total cost calculated from item cost prices
```

### To build
- Per-tier config: price, description, available toggle, images
- Item mapping UI: add items from product list, set quantity per item
- Cost calculator: shows total mapped cost vs selling price → margin
- Save mapping to store (Supabase later)
- Order confirm hook: reads mapping → deducts each item from inventory

### Acceptance criteria
- [ ] Admin can add/remove items from each scoop tier
- [ ] Quantity per item is editable
- [ ] Cost is calculated automatically from item cost prices
- [ ] Saving mapping persists across sessions
- [ ] Order confirmation triggers auto-deduction using the saved mapping

---

## MODULE 20 – ADMIN PAYMENTS

**Route:** `/admin/payments`
**File:** `src/routes/admin/AdminPaymentsRoute.tsx`
**Status:** ✅ Complete

### What is built
- Payment list: order ID, customer, amount, date, gateway, transaction ID, status
- Filter by: All / Successful / Failed / Pending / Refunded
- Mark as refunded action
- View linked order

---

## MODULE 21 – ADMIN CUSTOMER MANAGEMENT

**Route:** `/admin/customers`
**File:** `src/routes/admin/AdminCustomersRoute.tsx`
**Status:** ✅ Complete

### What is built
- Customer list: name, phone, email, total orders, total spend, last order date
- Search customers
- Customer detail drill-down: order history, booking history, total profit generated
- Address history

---

## MODULE 22 – ADMIN DELIVERY MANAGEMENT

**Route:** `/admin/delivery`
**File:** `src/routes/admin/AdminDeliveryRoute.tsx`
**Status:** ✅ Complete

### What is built
- Delivery list per order
- Update courier, tracking number, tracking URL
- Update delivery status (Preparing / Packed / Shipped / Out for Delivery / Delivered)

---

## MODULE 23 – ADMIN PROFIT & LOSS

**Route:** `/admin/profit`
**File:** `src/routes/admin/AdminProfitRoute.tsx`
**Status:** ✅ Complete

### What is built
- Period filter: Today / This week / This month / All time
- Top stats: Revenue / Net profit / Total cost / Avg order profit
- Margin bar: Revenue vs Cost vs Profit
- Scoop-wise breakdown
- Order-wise P&L with full cost component breakdown (items / packaging / shipping / gateway / discount)

---

## MODULE 24 – ADMIN REPORTS + EXPORT

**Route:** `/admin/reports`
**File:** `src/routes/admin/AdminReportsRoute.tsx`
**Status:** ✅ Complete

### What is built
- Sales tab: total orders, revenue, avg order, by tier, by experience
- Inventory tab: SKUs, units, stock value, low/out of stock list
- Bookings tab: total, by experience, by tier
- Customers tab: total, returning, total spend, avg spend
- CSV export working for all tabs

---

## MODULE 25 – ADMIN VIDEO SLOT CONFIGURATION

**Embedded in:** `/admin/video-bookings`
**Status:** 🔄 In Progress

### Exists
- Block / unblock individual slots per date

### To build
- Add new time slot
- Edit slot time
- Delete slot
- Set max capacity per slot
- Configure global lead time (default: 5 days)
- Configure booking window (default: 30 days)
- Configure max bookings per day (default: 2)

---

## MODULE 26 – WEBSITE CONTENT MANAGEMENT (CMS)

**Route:** `/admin/content` (not built)
**Status:** ⬜ Not Started

### To build
- Home banners: edit headline, subtext, image URL, CTA button labels
- FAQs: add / edit / delete questions and answers
- About Us: rich text edit
- Contact info: phone, email, address, IG handle
- Announcements: create / archive banners shown on home page

---

## MODULE 27 – CUSTOMER NOTIFICATIONS

**Status:** ⬜ Not Started

### Events to notify on
- Payment successful
- Order confirmed
- Video booking confirmed
- Video booking reminder (day before)
- Order packed → shipped → out for delivery → delivered

### V1 implementation: in-app notification bell + list

---

## MODULE 28 – ADMIN NOTIFICATIONS

**Status:** ⬜ Not Started

### Events
- New order placed
- New payment
- New video booking
- Low stock alert
- Out of stock alert
- Failed payment

---

## MODULE 29 – COUPON / DISCOUNT SYSTEM

**Status:** ⬜ Not Started (Future — not required for V1)

---

## MODULE 30 – SUPABASE BACKEND

**Status:** ⬜ Not Started (Future)

### All current data is in-memory mock via `src/api/mockApi.ts`
### Tables needed when wiring Supabase
- customers, products, scoop_configs, scoop_item_mappings
- video_slots, orders, order_items, scoop_bookings
- inventory_movements, payments, delivery, addresses
- notifications, admin_users, content

---

## COMPLETE CUSTOMER JOURNEY MAP

### Scoop With Video
```
Home → "Explore Scoops" → tap tier vessel → "Book Now"
→ /book/$tier → fill preferences → "With Video"
→ pick date (calendar) → pick slot
→ "Continue" → /cart → fill delivery → pay
→ slot reserved → payment confirmed → order LT-YYYY-NNNNN created
→ inventory auto-deducted → /confirm → confetti
→ Preparing → Packed → Shipped → Delivered
```

### Scoop Without Video
```
Home → tap tier → "Book Now" → /book/$tier
→ "Without Video" → "Continue" → /cart → pay
→ order confirmed → inventory deducted → /confirm
```

### Individual Items
```
Home → "Shop Individual Items" → /shop
→ search/filter → tap item → /shop/$itemId
→ qty → "Add to Cart" → /cart → pay → /confirm
```

---

## ORDER SYSTEM LOGIC

```
1. Customer selects products
2. With Video → slot temporarily reserved (timeout: 15 min)
3. Fill delivery details
4. Pay via gateway
5. Webhook confirms payment
6. Order status = "confirmed", Order ID = LT-YYYY-NNNNN
7. Video slot = permanently booked
8. Inventory auto-deducted (scoop mapping + individual items)
9. Costs calculated → profit recorded
10. Customer notification sent
11. Admin notified of new order
```

**Payment failure:**
- Order NOT confirmed
- Slot reservation released after timeout
- Inventory NOT deducted

**Order cancelled:**
- Admin marks cancelled
- Slot released (if video)
- Inventory reversal logged with reason

---

## NEXT MODULE TO BUILD

**Next:** Module 7 – Login / Signup UI
**Then:** Module 8 – Customer Account & Profile
**Then:** Module 19 – Admin Scoop Management + Item Mapping
**Then:** Module 25 – Admin Video Slot Configuration (complete)
**Then:** Module 26 – Website CMS
**Then:** Modules 27 & 28 – Notifications
