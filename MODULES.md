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
| 30 | MongoDB Backend Integration | ⬜ Not Started | P0 — Atlas URI provided, ready to build |

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
**Status:** ✅ Complete

### What is built
- Login tab: email + password with inline field validation and server error banner
- Signup tab: name, phone, email, password, confirm password — all validated
- Forgot password view: email input → mock "check your inbox" success screen
- Auth store (`src/store/authStore.ts`): persisted via zustand, mock login/signup, Supabase-ready shape
- Redirect to `/account` (or `?redirect=` param) after successful auth
- Google / OTP social login buttons (UI only, wired when Supabase is connected)
- Animated field error messages, loading spinner, success state

### Acceptance criteria
- [x] Login form with validation
- [x] Signup form with validation and confirm password
- [x] Forgot password flow with success screen
- [x] Error states shown inline per field and as banner
- [x] Successful login navigates to /account
- [x] Auth persisted across page refreshes (zustand persist)

---

## MODULE 8 – CUSTOMER ACCOUNT & PROFILE

**Route:** `/account`
**File:** `src/routes/AccountRoute.tsx`
**Status:** ✅ Complete

### What is built
- Unauthenticated state: prompts sign in instead of showing account
- Profile header: name, phone, instagram, edit button (pencil icon)
- Profile edit sub-view: name, phone, email, instagram — saves to auth store
- Stats: total orders, active, delivered (from real order data)
- Upcoming video booking highlight card
- Total spend + member since (from auth store)
- Menu: My Orders, My Bookings, Shop, Track Scoop, Saved Addresses, Profile, Notifications
- Notification badge on bell icon (unread count)
- Notifications sub-view: list with read/unread state, mark as read on tap
- Saved Addresses sub-view:
  - Add address (label, building, area, city, state, pin, set-as-default)
  - Edit address inline
  - Delete address
  - Set default address
- Default address preview with "Manage" link
- Sign out button (clears auth store, navigates to home)

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

### Business rule clarification
- Maximum **2 confirmed video bookings per calendar day** — this is a daily cap, not a per-slot cap
- Each time slot holds **1 booking** (one customer per slot, one at a time)
- So the system has 2 slots per day by default, and max daily bookings = 2
- "Max capacity per slot" and "max bookings per day" are intentionally separate settings:
  - `maxCapacity` per slot = 1 (one customer per time slot)
  - `maxBookingsPerDay` = 2 (two slots available per day)
- Admin configures how many slots exist per day, not a separate "daily cap" number

### Exists
- Block / unblock individual slots per date

### To build
- Add new time slot for a date (time, duration)
- Edit slot time
- Delete slot
- Configure global settings: lead time (default 5 days), booking window (default 30 days)
- Configure max bookings per day via number of active slots (not a separate override)
- Per-slot block / unblock (already partial)

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

## MODULE 30 – MONGODB BACKEND INTEGRATION

**Status:** ⬜ Not Started
**Priority:** P0 (everything else depends on this for production)
**Database:** MongoDB Atlas
**API Layer:** Node.js + Express + Mongoose
**Frontend connection:** Vite proxy `/api/*` → Express on port 4000

---

### Overview

The current frontend uses `src/api/mockApi.ts` — an in-memory store that resets on every page refresh. Module 30 replaces this with a real MongoDB Atlas database connected through a Node.js API server. The frontend UI does not change. Only the data layer is replaced.

**Golden rule:** The MongoDB URI is never exposed to the frontend. All database operations happen on the server. The frontend calls `/api/*` endpoints only.

---

### Environment Variables

```
# Backend only — never in frontend code
MONGODB_URI=mongodb+srv://liltreats26_db_user:<password>@cluster0.y1sv9kc.mongodb.net
DB_NAME=liltreats
JWT_SECRET=<strong random string>
JWT_EXPIRES_IN=7d
PORT=4000

# Frontend only — safe to expose
VITE_API_URL=/api
```

---

### Architecture

```
Browser (React/Vite on :3000)
  │
  │  /api/* requests
  ▼
Vite Dev Proxy → Express Server (:4000)
                    │
                    │  Mongoose ODM
                    ▼
              MongoDB Atlas
              (liltreats database)
```

In production (GitHub Pages / Soffi deployment):
- Frontend: static build served from dist/
- Backend: Node.js service running on port 4000
- Both behind a reverse proxy or on separate domains

---

### Server File Structure

```
server/
  index.ts              ← Express app entry point (port 4000)
  db.ts                 ← MongoDB connection via MONGODB_URI
  middleware/
    auth.ts             ← JWT verify, attach req.user
    adminGuard.ts       ← Reject non-admin requests
    errorHandler.ts     ← Centralised error responses
  models/
    User.ts
    Address.ts
    Category.ts
    Product.ts
    ScoopConfig.ts
    ScoopItemMapping.ts
    VideoConfig.ts
    VideoSlot.ts
    VideoBooking.ts
    Order.ts
    ScoopBooking.ts
    Inventory.ts
    InventoryMovement.ts
    Payment.ts
    Delivery.ts
    Notification.ts
    AdminUser.ts
    WebsiteContent.ts
    Faq.ts
  routes/
    auth.ts             ← /api/auth
    products.ts         ← /api/products
    categories.ts       ← /api/categories
    scoops.ts           ← /api/scoops
    scoopMappings.ts    ← /api/scoop-mappings
    video.ts            ← /api/video
    orders.ts           ← /api/orders
    bookings.ts         ← /api/bookings
    inventory.ts        ← /api/inventory
    payments.ts         ← /api/payments
    delivery.ts         ← /api/delivery
    notifications.ts    ← /api/notifications
    admin/
      customers.ts      ← /api/admin/customers
      reports.ts        ← /api/admin/reports
      profit.ts         ← /api/admin/profit
      content.ts        ← /api/admin/content
  services/
    orderService.ts     ← Order creation, P&L snapshot
    inventoryService.ts ← Auto-deduction, idempotency
    slotService.ts      ← Reservation, timeout, release
    notificationService.ts
  utils/
    generateOrderNumber.ts  ← LT-YYYY-NNNNN format
    hashPassword.ts
    jwt.ts
```

---

### MongoDB Collections

#### `users`
```
_id, name, email, phone, passwordHash, role (customer|admin),
status (active|suspended), createdAt, updatedAt, lastLoginAt
```
- Passwords hashed with bcrypt (never stored plain)
- role field gates admin API access

#### `addresses`
```
_id, userId, name, phone, house, street, area, city, state,
pincode, label (Home|Work|Other), isDefault, createdAt, updatedAt
```

#### `categories`
```
_id, name, slug, isActive, sortOrder, createdAt
```

#### `products`
```
_id, sku (unique), name, slug, description, images[],
categoryId, costPrice, sellingPrice, currentStock,
minimumStock, isActive, isFeatured, isNew, createdAt, updatedAt
```
- SKU must be unique (enforced by MongoDB unique index)
- currentStock must never go below 0

#### `scoopConfigs`
```
_id, tier (mini|magic|premium), name, slug, price, itemRange,
description, images[], isActive, createdAt, updatedAt
```
Seed data:
- Mini Scoop: ₹499, 5–6 items
- Magic Scoop: ₹899, 8–10 items
- Premium Scoop: ₹1099, 10–12 items

#### `scoopItemMappings`
```
_id, scoopId, productId, quantity, createdAt, updatedAt
```
- One record per product per scoop tier
- Admin can add, remove, change quantity
- Used for automatic inventory deduction on order confirmation
- Example: Magic Scoop → Charm A × 1, Bracelet B × 1, Sticker C × 2

#### `videoConfig`
```
_id, minimumLeadDays (default 5), bookingWindowDays (default 30),
maxBookingsPerDay (default 2), reservationTimeoutMinutes (default 15)
```
- Single document (singleton collection)
- Admin-configurable from admin panel

#### `videoSlots`
```
_id, date (YYYY-MM-DD), startTime (HH:MM), endTime (HH:MM),
maxCapacity (default 1), bookedCount (default 0),
status (available|blocked), createdAt, updatedAt
```
- Business rule: max 2 confirmed video bookings per calendar day
- Each slot has its own capacity (typically 1)
- Admin can block individual slots

#### `videoBookings`
```
_id, bookingId (readable ID), orderId, userId, scoopBookingId,
scoopTier, videoDate, videoSlotId, startTime, endTime,
status (reserved|confirmed|completed|cancelled|expired), createdAt, updatedAt
```
- reserved → confirmed (on payment success)
- reserved → expired (after 15-minute timeout)
- confirmed → cancelled (on order cancellation)

#### `orders`
```
_id, orderNumber (LT-YYYY-NNNNN, unique), userId, items[],
scoopBookings[], subtotal, shippingCost, discount,
paymentGatewayFee, packagingCost, otherCost, totalAmount,
paymentStatus (pending|processing|successful|failed|refunded|cancelled),
orderStatus (confirmed|preparing|packed|shipped|out_for_delivery|delivered|cancelled),
deliveryStatus, shippingAddress (snapshot), costSnapshot,
profitSnapshot, createdAt, updatedAt, cancelledAt, cancelReason
```
- orderNumber generated as LT-YYYY-NNNNN with atomic counter
- shippingAddress is a snapshot (not a reference) — never changes after order placed
- costSnapshot and profitSnapshot saved at order creation time so historical P&L is always accurate even if product costs change later

#### `order items (embedded in orders.items[])`
```
productId, sku, name, quantity, sellingPrice,
costPrice (snapshot), subtotal
```
- costPrice is the price AT THE TIME OF ORDER, not current product cost

#### `scoopBookings`
```
_id, bookingId, orderId, userId, scoopId, tier, scoopName,
price, experience (with_video|without_video), videoBookingId,
preferences { vibe[], favouriteCategories[], avoidNote },
mappedItems[] (snapshot of item mapping + cost at time of order),
itemCostTotal (calculated), status, createdAt, updatedAt
```
- mappedItems is a snapshot — protects historical P&L if mappings change later

#### `inventory`
```
_id, productId, sku, currentStock, minimumStock,
costPrice, stockValue (currentStock × costPrice), updatedAt
```
- Mirror of the stock level, kept in sync with inventoryMovements
- currentStock must never go below 0 (enforced in inventoryService)

#### `inventoryMovements`
```
_id, productId, sku, type (stock_entry|automatic_debit|manual_debit|adjustment|order_reversal),
quantity (positive = added, negative = deducted), previousStock, newStock,
reason, referenceType (order|admin|adjustment), referenceId,
createdBy (userId), createdAt
```
- Every inventory change creates a movement record — never deleted
- Order reversals create a new movement (order_reversal), not delete the original

#### `payments`
```
_id, orderId, userId, orderNumber, amount, currency (INR),
gateway (razorpay|manual), transactionId, paymentMethod,
status (pending|processing|successful|failed|refunded|cancelled),
gatewayResponse (raw), paidAt, createdAt, updatedAt
```
- Payment verification happens on backend via webhook — never trust client-side payment status
- Idempotency: check if orderId already has a successful payment before processing

#### `deliveries`
```
_id, orderId, userId, courierName, trackingNumber, trackingUrl,
status (preparing|packed|shipped|out_for_delivery|delivered|cancelled),
shippedAt, deliveredAt, createdAt, updatedAt
```

#### `notifications`
```
_id, userId, type, title, message,
referenceType (order|booking|inventory), referenceId,
isRead (default false), createdAt
```
Customer events: payment_successful, order_confirmed, video_booking_confirmed,
order_packed, order_shipped, out_for_delivery, delivered, video_reminder
Admin events: new_order, new_payment, new_video_booking, low_stock, out_of_stock, failed_payment

#### `adminUsers`
```
_id, userId, name, email, role (super_admin), isActive, createdAt, updatedAt
```

#### `websiteContent`
```
_id, section (home|about|contact|announcement),
content {}, images[], isActive, updatedAt, updatedBy
```

#### `faqs`
```
_id, question, answer, sortOrder, isActive, createdAt, updatedAt
```

---

### API Routes

#### Public (no auth)
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/forgot-password
GET    /api/products
GET    /api/products/:slug
GET    /api/categories
GET    /api/scoops
GET    /api/video/config
GET    /api/video/slots?date=YYYY-MM-DD
GET    /api/content/:section
GET    /api/faqs
```

#### Customer (JWT required, role: customer)
```
GET    /api/auth/me
PUT    /api/auth/me
GET    /api/addresses
POST   /api/addresses
PUT    /api/addresses/:id
DELETE /api/addresses/:id
POST   /api/orders
GET    /api/orders
GET    /api/orders/:id
POST   /api/video/reserve          ← reserve a slot (15-min timeout)
DELETE /api/video/reserve/:id      ← release reservation
GET    /api/bookings
GET    /api/bookings/:id
GET    /api/notifications
PUT    /api/notifications/:id/read
POST   /api/payments/initiate      ← create payment intent with gateway
POST   /api/payments/verify        ← verify on frontend after gateway redirect
```

#### Admin (JWT required, role: admin)
```
GET    /api/admin/orders
GET    /api/admin/orders/:id
PUT    /api/admin/orders/:id/status
PUT    /api/admin/orders/:id/cancel
GET    /api/admin/scoop-bookings
GET    /api/admin/video-bookings
GET    /api/admin/video-config
PUT    /api/admin/video-config
POST   /api/admin/video-slots
PUT    /api/admin/video-slots/:id
DELETE /api/admin/video-slots/:id
GET    /api/admin/products
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
GET    /api/admin/scoop-mappings/:scoopId
PUT    /api/admin/scoop-mappings/:scoopId
GET    /api/admin/inventory
POST   /api/admin/inventory/add-stock
POST   /api/admin/inventory/manual-debit
POST   /api/admin/inventory/adjust
GET    /api/admin/inventory/:productId/history
GET    /api/admin/payments
GET    /api/admin/customers
GET    /api/admin/customers/:id
GET    /api/admin/profit
GET    /api/admin/reports/sales
GET    /api/admin/reports/inventory
GET    /api/admin/reports/bookings
GET    /api/admin/reports/customers
GET    /api/admin/content
PUT    /api/admin/content/:section
GET    /api/admin/faqs
POST   /api/admin/faqs
PUT    /api/admin/faqs/:id
DELETE /api/admin/faqs/:id
GET    /api/admin/notifications
```

---

### Critical Business Logic Rules

#### Order Confirmation Flow (must happen in this exact sequence)
```
1. Customer submits checkout → POST /api/orders (status: pending)
2. If With Video → slot marked reserved (15-min TTL index in MongoDB)
3. POST /api/payments/initiate → create Razorpay order, return order_id
4. Customer pays on frontend via Razorpay SDK
5. POST /api/payments/verify → backend verifies signature with Razorpay secret
6. If verified:
   a. Payment status = successful
   b. Order status = confirmed
   c. Video booking status = confirmed (if applicable)
   d. inventoryService.deductForOrder(orderId) ← idempotent
   e. Cost snapshot saved to order
   f. Profit calculated and saved to order
   g. Customer notification created
   h. Admin notification created
7. Return order confirmation to frontend
```

#### Inventory Deduction (idempotent)
```
// inventoryService.deductForOrder
1. Check if order already has inventoryDeducted: true → skip (idempotency)
2. Load scoopBookings for this order → get mappedItems[]
3. Load order.items[] (individual products)
4. For each item, deduct quantity:
   a. currentStock - quantity (never below 0, throw error if insufficient)
   b. Create inventoryMovement record (type: automatic_debit)
5. Mark order.inventoryDeducted = true (atomic update)
```
Duplicate payment webhooks cannot deduct stock twice because of the inventoryDeducted flag.

#### Video Slot Reservation
```
// slotService.reserve
1. Load videoConfig (lead time, window, max per day)
2. Check date is within allowed window
3. Count confirmed + reserved bookings for that date
4. If count >= maxBookingsPerDay → throw "Fully booked"
5. Create videoBooking with status: reserved
6. Set MongoDB TTL index on videoBooking.expiresAt (now + 15 min)
7. MongoDB automatically removes expired reservations via TTL index
   → slot becomes available again automatically
```

#### Order Cancellation
```
1. Admin marks order cancelled
2. If video booking exists → status = cancelled
3. If inventoryDeducted = true:
   a. For each deducted item: add stock back
   b. Create inventoryMovement (type: order_reversal)
   c. Never delete original deduction movement
4. If payment successful → record refund in payments collection
5. Create customer notification
```

#### P&L Snapshot (saved with every order)
```
Revenue = order.totalAmount
Cost =
  itemsCost (sum of item.costPrice × quantity)
  + scoopItemsCost (sum of mappedItem.costPrice × quantity)
  + packagingCost (₹30 default, admin-configurable)
  + shippingCost (order.shippingCost)
  + paymentGatewayFee (2% of totalAmount, admin-configurable)
  + discount (order.discount)
  + otherCost
NetProfit = Revenue - Cost
Margin = (NetProfit / Revenue) × 100

All saved as order.profitSnapshot at confirmation time.
Historical P&L is always accurate even if costs change later.
```

---

### Frontend Integration Strategy

The frontend is NOT rebuilt. Only `src/api/mockApi.ts` is updated, function by function, to call real API endpoints. The UI, routes, components, and stores remain exactly as-is.

#### Phase A — Auth
- `login()` → `POST /api/auth/login` (returns JWT)
- `signup()` → `POST /api/auth/register`
- Store JWT in authStore (already shaped for this)
- All subsequent requests send `Authorization: Bearer <token>` header

#### Phase B — Products & Scoops
- `getProducts()` → `GET /api/products`
- `getScoopConfigs()` → `GET /api/scoops`
- `getScoopMapping()` → `GET /api/admin/scoop-mappings/:scoopId`

#### Phase C — Video Slots
- `getVideoSlots(date)` → `GET /api/video/slots?date=...`
- `reserveSlot()` → `POST /api/video/reserve`
- `releaseSlot()` → `DELETE /api/video/reserve/:id`

#### Phase D — Orders & Checkout
- `createOrder()` → `POST /api/orders`
- `initiatePayment()` → `POST /api/payments/initiate`
- `verifyPayment()` → `POST /api/payments/verify`

#### Phase E — Customer Account
- `getOrders()` → `GET /api/orders`
- `getBookings()` → `GET /api/bookings`
- `getNotifications()` → `GET /api/notifications`
- `getAddresses()` → `GET /api/addresses`

#### Phase F — Admin
- Replace all admin mock functions with real `/api/admin/*` calls

---

### Build Steps (in order)

1. Create `server/` directory with `index.ts`, `db.ts`
2. Install dependencies: `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`
3. Create all 18 Mongoose models
4. Create `generateOrderNumber` utility (atomic, LT-YYYY-NNNNN)
5. Create auth routes + JWT middleware
6. Create product + scoop routes
7. Create video slot routes + reservation logic with TTL
8. Create order routes + payment verify endpoint
9. Create inventory service with idempotent deduction
10. Create admin routes (orders, bookings, inventory, reports, profit)
11. Create notification creation service
12. Add Vite proxy config (`vite.config.ts`: proxy `/api` → `http://localhost:4000`)
13. Seed database: 3 scoop configs, sample products, default video config
14. Replace mock API calls in frontend — Phase A through F
15. End-to-end test: full Magic Scoop + video booking flow

---

### Test Scenarios (must all pass before Module 30 is marked ✅)

| Scenario | Expected |
|----------|----------|
| Successful Magic Scoop + Video booking | Order created, slot confirmed, inventory deducted, P&L saved |
| Payment failure | No confirmed order, slot released, inventory unchanged |
| Duplicate payment webhook | Only one deduction (idempotency check) |
| Two customers competing for last slot | Only one succeeds, second gets "slot taken" error |
| Order cancellation after fulfillment | Slot released, inventory reversed, reversal logged |
| Low stock on checkout | Error before payment, not after |
| Admin changes scoop mapping | Future orders use new mapping, historical P&L unchanged |

---

### What Does NOT Change

- All frontend routes, components, and UI
- `src/store/cartStore.ts` structure
- `src/store/authStore.ts` structure (already JWT-shaped)
- Admin panel layout and navigation
- Design system (Tailwind tokens)
- TanStack Router setup
- Zustand stores

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
