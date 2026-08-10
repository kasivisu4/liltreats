import { INVENTORY, type ScoopItem } from "../data/inventory";
import { TIERS, TIER_BY_ID, VIDEO_ADDON_PRICE, type TierId } from "../data/tiers";

// ─────────────────────────────────────────────────────────────────────────────
// In-memory mock backend.
// Mirrors the shape of an eventual Supabase layer so swapping is a drop-in.
// ─────────────────────────────────────────────────────────────────────────────

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Types ─────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "confirmed"
  | "preparing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "successful" | "failed" | "refunded";

export type ExperienceType = "with_video" | "without_video";

export interface VideoSlot {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // "10:00 AM"
  maxCapacity: number;
  bookedCount: number;
  isBlocked: boolean;
}

export interface ScoopBooking {
  id: string;
  orderId: string;
  customerId: string;
  scoopTier: TierId;
  experience: ExperienceType;
  videoSlotId: string | null;
  videoDate: string | null;
  videoTime: string | null;
  status: "confirmed" | "cancelled";
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string | null; // null = scoop
  scoopTier: TierId | null;
  name: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerInstagram: string;
  tierId: TierId | null; // null = individual items only
  tierName: string;
  icon: string;
  price: number;
  videoAddon: boolean;
  videoDate: string | null;
  videoTime: string | null;
  videoSlotId: string | null;
  shipping: number;
  total: number;
  itemsPreview: string[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  placedAt: string;
  area: string;
  building: string;
  pin: string;
  note: string;
  courier: string;
  trackingNumber: string;
  trackingUrl: string;
  scoopBookingId: string | null;
  // Cost & Profit
  itemCost: number;
  packagingCost: number;
  shippingCost: number;
  paymentGatewayCost: number;
  discount: number;
  netProfit: number;
}

export interface SlotMap {
  mini: number;
  magic: number;
  premium: number;
}

export interface CreateOrderInput {
  tierId: TierId;
  videoAddon: boolean;
  videoSlotId: string | null;
  shipping: number;
  itemsPreview: string[];
  name: string;
  phone: string;
  email: string;
  instagram: string;
  building: string;
  area: string;
  pin: string;
  note: string;
  paymentMethod: string;
}

export interface IndividualItem {
  id: string;
  name: string;
  category: string;
  emoji: string;
  description: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  minStock: number;
  sku: string;
  isNew: boolean;
  isLimited: boolean;
  isFeatured: boolean;
  isActive: boolean;
  imageUrl: string;
}

export interface CartItem {
  itemId: string;
  quantity: number;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: "stock_entry" | "auto_debit" | "manual_debit" | "adjustment" | "reversal";
  quantity: number; // positive = add, negative = deduct
  reason: string;
  adminNote: string;
  orderId: string | null;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  instagram: string;
  totalOrders: number;
  totalSpend: number;
  lastOrderAt: string | null;
  joinedAt: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  label: string;
  building: string;
  area: string;
  city: string;
  state: string;
  pin: string;
  isDefault: boolean;
}

// ── Seeded data ───────────────────────────────────────────────────────────────

const BASE_CUSTOMER_ID = "cust-001";

export const MOCK_CUSTOMER: Customer = {
  id: BASE_CUSTOMER_ID,
  name: "Priya Sharma",
  phone: "+91 98765 43210",
  email: "priya@example.com",
  instagram: "@priyastyled",
  totalOrders: 3,
  totalSpend: 2607,
  lastOrderAt: "2026-06-23T10:20:00.000Z",
  joinedAt: "2026-04-01T00:00:00.000Z",
  addresses: [
    {
      id: "addr-001",
      label: "Home",
      building: "Flat 402, Serene Residency",
      area: "Banjara Hills",
      city: "Hyderabad",
      state: "Telangana",
      pin: "500034",
      isDefault: true,
    },
  ],
};

// ── Video slots (30 days from today+5) ────────────────────────────────────────

const SLOT_TIMES = [
  "10:00 AM", "11:00 AM", "12:00 PM",
  "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

function generateVideoSlots(): VideoSlot[] {
  const slots: VideoSlot[] = [];
  const today = new Date();
  for (let d = 5; d <= 35; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];
    // Pre-book some slots for realism
    const bookedCounts: Record<string, number> = {};
    if (d === 5) bookedCounts["10:00 AM"] = 1;
    if (d === 6) bookedCounts["10:00 AM"] = 2;
    if (d === 7) { bookedCounts["10:00 AM"] = 1; bookedCounts["11:00 AM"] = 1; }

    SLOT_TIMES.forEach((time) => {
      const booked = bookedCounts[time] ?? 0;
      slots.push({
        id: `slot-${dateStr}-${time.replace(/[: ]/g, "")}`,
        date: dateStr,
        time,
        maxCapacity: 2,
        bookedCount: booked,
        isBlocked: false,
      });
    });
  }
  return slots;
}

export let videoSlots: VideoSlot[] = generateVideoSlots();

// ── Stock tracking ────────────────────────────────────────────────────────────

const stockMap: Map<string, number> = new Map(INVENTORY.map((i) => [i.id, i.stock]));

export const inventoryMovements: InventoryMovement[] = [
  {
    id: "mov-001",
    itemId: "i01",
    itemName: "Pearl drop earrings",
    type: "stock_entry",
    quantity: 20,
    reason: "New stock",
    adminNote: "Opening stock",
    orderId: null,
    balanceBefore: 0,
    balanceAfter: 20,
    createdAt: "2026-06-01T09:00:00.000Z",
  },
  {
    id: "mov-002",
    itemId: "i01",
    itemName: "Pearl drop earrings",
    type: "auto_debit",
    quantity: -6,
    reason: "Orders: ORD-031, ORD-032, ORD-033",
    adminNote: "",
    orderId: "ORD-031",
    balanceBefore: 20,
    balanceAfter: 14,
    createdAt: "2026-06-16T09:05:00.000Z",
  },
];

let movSeq = 3;

function recordMovement(
  itemId: string,
  itemName: string,
  type: InventoryMovement["type"],
  qty: number,
  reason: string,
  orderId: string | null,
): void {
  const before = stockMap.get(itemId) ?? 0;
  const after = before + qty;
  stockMap.set(itemId, Math.max(0, after));
  inventoryMovements.push({
    id: `mov-${String(movSeq++).padStart(3, "0")}`,
    itemId,
    itemName,
    type,
    quantity: qty,
    reason,
    adminNote: "",
    orderId,
    balanceBefore: before,
    balanceAfter: Math.max(0, after),
    createdAt: new Date().toISOString(),
  });
}

// ── Individual items shop ─────────────────────────────────────────────────────

export const individualItems: IndividualItem[] = [
  { id: "p01", name: "Pearl drop earrings", category: "Jewellery", emoji: "💎", description: "Delicate freshwater pearl drops on gold-plated hooks. Perfect for everyday glam.", sellingPrice: 249, costPrice: 80, stock: 14, minStock: 5, sku: "JWL-001", isNew: true, isLimited: false, isFeatured: true, isActive: true, imageUrl: "" },
  { id: "p02", name: "Charm bracelet", category: "Jewellery", emoji: "🌟", description: "Adjustable gold-tone bracelet with celestial and floral charms.", sellingPrice: 349, costPrice: 110, stock: 4, minStock: 5, sku: "JWL-002", isNew: false, isLimited: true, isFeatured: true, isActive: true, imageUrl: "" },
  { id: "p03", name: "Dainty ring set (×3)", category: "Jewellery", emoji: "💍", description: "Three stackable thin rings — midi, classic, and wave styles. Gold-filled.", sellingPrice: 299, costPrice: 90, stock: 16, minStock: 8, sku: "JWL-003", isNew: true, isLimited: false, isFeatured: false, isActive: true, imageUrl: "" },
  { id: "p04", name: "Hair bow clips (set of 4)", category: "Hair", emoji: "🎀", description: "Satin-finish bow clips in blush, ivory, sage & lavender. Fits all hair types.", sellingPrice: 199, costPrice: 55, stock: 20, minStock: 10, sku: "HAIR-001", isNew: false, isLimited: false, isFeatured: true, isActive: true, imageUrl: "" },
  { id: "p05", name: "Velvet headband", category: "Hair", emoji: "🎗️", description: "Padded velvet headband in berry — comfy all-day wear, no-slip grip.", sellingPrice: 179, costPrice: 50, stock: 11, minStock: 5, sku: "HAIR-002", isNew: true, isLimited: false, isFeatured: false, isActive: true, imageUrl: "" },
  { id: "p06", name: "Butterfly bobby pins (×6)", category: "Hair", emoji: "🦋", description: "Gold-tone butterfly micro pins — scatter through hair or stack on one side.", sellingPrice: 149, costPrice: 40, stock: 5, minStock: 5, sku: "HAIR-003", isNew: false, isLimited: true, isFeatured: false, isActive: true, imageUrl: "" },
  { id: "p07", name: "Celestial phone charm", category: "Accessories", emoji: "🌙", description: "Crescent moon + star pendant on a thin bead string — fits all phone cases.", sellingPrice: 199, costPrice: 60, stock: 6, minStock: 5, sku: "ACC-001", isNew: true, isLimited: true, isFeatured: true, isActive: true, imageUrl: "" },
  { id: "p08", name: "Mini tote bag", category: "Accessories", emoji: "👛", description: "Canvas mini tote, 'liltreats' lettered in gold. Perfect for your essentials.", sellingPrice: 499, costPrice: 150, stock: 7, minStock: 3, sku: "ACC-002", isNew: false, isLimited: false, isFeatured: false, isActive: true, imageUrl: "" },
  { id: "p09", name: "Retro sunglasses", category: "Accessories", emoji: "🕶️", description: "Rounded tortoise-shell frames with UV400 lenses. Very Y2K.", sellingPrice: 399, costPrice: 120, stock: 3, minStock: 5, sku: "ACC-003", isNew: false, isLimited: true, isFeatured: true, isActive: true, imageUrl: "" },
  { id: "p10", name: "Tinted lip balm", category: "Beauty", emoji: "💄", description: "Sheer berry tint with vitamin E + shea butter. SPF 15. Soft-focus finish.", sellingPrice: 149, costPrice: 45, stock: 17, minStock: 10, sku: "BEA-001", isNew: false, isLimited: false, isFeatured: false, isActive: true, imageUrl: "" },
  { id: "p11", name: "Mini perfume vial", category: "Beauty", emoji: "🌺", description: "10ml eau de parfum — jasmine & vanilla base. Refillable aluminium case.", sellingPrice: 299, costPrice: 85, stock: 10, minStock: 5, sku: "BEA-002", isNew: true, isLimited: false, isFeatured: true, isActive: true, imageUrl: "" },
  { id: "p12", name: "Crystal nail charms (set)", category: "Beauty", emoji: "✨", description: "Mixed-shape rhinestone charms for nail art. UV-gel and regular polish friendly.", sellingPrice: 129, costPrice: 35, stock: 12, minStock: 8, sku: "BEA-003", isNew: false, isLimited: false, isFeatured: false, isActive: true, imageUrl: "" },
  { id: "p13", name: "Kawaii keychain plush", category: "Trinkets", emoji: "🧸", description: "5cm plush bear keyring with satin ribbon charm. BPA-free stuffing.", sellingPrice: 179, costPrice: 50, stock: 3, minStock: 5, sku: "TRK-001", isNew: false, isLimited: true, isFeatured: false, isActive: true, imageUrl: "" },
  { id: "p14", name: "Holographic sticker sheet", category: "Trinkets", emoji: "🌈", description: "A4 sheet with 30 holographic die-cut stickers — stars, moons, flowers.", sellingPrice: 99, costPrice: 25, stock: 22, minStock: 10, sku: "TRK-002", isNew: false, isLimited: false, isFeatured: false, isActive: true, imageUrl: "" },
  { id: "p15", name: "Crystal pocket stone", category: "Trinkets", emoji: "🔮", description: "Tumbled rose quartz stone — for intention-setting or just aesthetic desk vibes.", sellingPrice: 149, costPrice: 40, stock: 8, minStock: 5, sku: "TRK-003", isNew: false, isLimited: false, isFeatured: true, isActive: true, imageUrl: "" },
  { id: "p16", name: "Pressed flower bookmark", category: "Stationery", emoji: "🌷", description: "Laminated pressed wildflower bookmark with gold tassel. Each one unique.", sellingPrice: 99, costPrice: 28, stock: 9, minStock: 5, sku: "STA-001", isNew: false, isLimited: false, isFeatured: false, isActive: true, imageUrl: "" },
  { id: "p17", name: "Mini notebook", category: "Stationery", emoji: "📓", description: "A6 dot-grid notebook with floral cover. 80 pages, perforated corners.", sellingPrice: 149, costPrice: 40, stock: 12, minStock: 8, sku: "STA-002", isNew: false, isLimited: false, isFeatured: false, isActive: true, imageUrl: "" },
  { id: "p18", name: "Scented candle (tin)", category: "Lifestyle", emoji: "🕯️", description: "60g soy wax candle — white tea & fig. 20hr burn. Reusable tin.", sellingPrice: 349, costPrice: 100, stock: 6, minStock: 3, sku: "LIF-001", isNew: true, isLimited: false, isFeatured: true, isActive: true, imageUrl: "" },
  { id: "p19", name: "Herbal tea sampler (×5)", category: "Lifestyle", emoji: "🍵", description: "5 flavours: chamomile, hibiscus, jasmine, mint, rose. Each 3g pyramid bag.", sellingPrice: 199, costPrice: 60, stock: 15, minStock: 8, sku: "LIF-002", isNew: false, isLimited: false, isFeatured: false, isActive: true, imageUrl: "" },
  { id: "p20", name: "Trinket dish (ceramic)", category: "Lifestyle", emoji: "🍃", description: "Hand-painted leaf-shaped ceramic dish — perfect for rings, pins, and all your tiny things.", sellingPrice: 249, costPrice: 75, stock: 5, minStock: 3, sku: "LIF-003", isNew: false, isLimited: false, isFeatured: false, isActive: true, imageUrl: "" },
];

// ── Orders ────────────────────────────────────────────────────────────────────

const SCOOP_ITEM_COST: Record<TierId, number> = {
  mini: 180,
  magic: 320,
  premium: 420,
};

export const orders: Order[] = [
  {
    id: "LT-2026-00042",
    customerId: BASE_CUSTOMER_ID,
    customerName: "Priya Sharma",
    customerPhone: "+91 98765 43210",
    customerEmail: "priya@example.com",
    customerInstagram: "@priyastyled",
    tierId: "magic",
    tierName: "Magic Scoop",
    icon: "✨",
    price: 899,
    videoAddon: true,
    videoDate: (() => {
      const d = new Date(); d.setDate(d.getDate() + 8); return d.toISOString().split("T")[0];
    })(),
    videoTime: "11:00 AM",
    videoSlotId: null,
    shipping: 60,
    total: 1058,
    itemsPreview: ["Pearl drop earrings", "Hair bow clips", "Mini perfume vial"],
    status: "preparing",
    paymentStatus: "successful",
    placedAt: "2026-06-23T10:20:00.000Z",
    area: "Banjara Hills",
    building: "Flat 402, Serene Residency",
    pin: "500034",
    note: "Please wrap nicely, it's a gift!",
    courier: "Delhivery",
    trackingNumber: "",
    trackingUrl: "",
    scoopBookingId: "BKG-042",
    itemCost: SCOOP_ITEM_COST["magic"],
    packagingCost: 30,
    shippingCost: 60,
    paymentGatewayCost: 21,
    discount: 0,
    netProfit: 899 + 99 - SCOOP_ITEM_COST["magic"] - 30 - 60 - 21,
  },
  {
    id: "LT-2026-00031",
    customerId: BASE_CUSTOMER_ID,
    customerName: "Priya Sharma",
    customerPhone: "+91 98765 43210",
    customerEmail: "priya@example.com",
    customerInstagram: "@priyastyled",
    tierId: "mini",
    tierName: "Mini Scoop",
    icon: "🌿",
    price: 499,
    videoAddon: false,
    videoDate: null,
    videoTime: null,
    videoSlotId: null,
    shipping: 60,
    total: 559,
    itemsPreview: ["Sticker sheet", "Hair bow clips", "Crystal nail charms"],
    status: "delivered",
    paymentStatus: "successful",
    placedAt: "2026-06-16T09:00:00.000Z",
    area: "Kondapur",
    building: "H.No 12-3, Trendset Towers",
    pin: "500084",
    note: "",
    courier: "Bluedart",
    trackingNumber: "BDA4829183",
    trackingUrl: "https://www.bluedart.com/tracking",
    scoopBookingId: "BKG-031",
    itemCost: SCOOP_ITEM_COST["mini"],
    packagingCost: 20,
    shippingCost: 60,
    paymentGatewayCost: 11,
    discount: 0,
    netProfit: 499 - SCOOP_ITEM_COST["mini"] - 20 - 60 - 11,
  },
];

export const scoopBookings: ScoopBooking[] = [
  {
    id: "BKG-042",
    orderId: "LT-2026-00042",
    customerId: BASE_CUSTOMER_ID,
    scoopTier: "magic",
    experience: "with_video",
    videoSlotId: null,
    videoDate: orders[0].videoDate,
    videoTime: orders[0].videoTime,
    status: "confirmed",
    createdAt: "2026-06-23T10:21:00.000Z",
  },
  {
    id: "BKG-031",
    orderId: "LT-2026-00031",
    customerId: BASE_CUSTOMER_ID,
    scoopTier: "mini",
    experience: "without_video",
    videoSlotId: null,
    videoDate: null,
    videoTime: null,
    status: "confirmed",
    createdAt: "2026-06-16T09:01:00.000Z",
  },
];

// ── Slots map (weekly availability) ──────────────────────────────────────────

const slots: SlotMap = {
  mini: TIER_BY_ID("mini").slots,
  magic: TIER_BY_ID("magic").slots,
  premium: TIER_BY_ID("premium").slots,
};

let orderSeq = 43;
let bookingSeq = 43;

export const TOTAL_SLOTS: SlotMap = {
  mini: TIERS[0].slots,
  magic: TIERS[1].slots,
  premium: TIERS[2].slots,
};

// ── API functions ─────────────────────────────────────────────────────────────

export async function fetchSlots(): Promise<SlotMap> {
  await wait(350);
  return { ...slots };
}

export async function fetchInventory(): Promise<ScoopItem[]> {
  await wait(400);
  return INVENTORY.map((i) => ({ ...i, stock: stockMap.get(i.id) ?? i.stock }));
}

export async function fetchOrders(customerId = BASE_CUSTOMER_ID): Promise<Order[]> {
  await wait(350);
  return orders
    .filter((o) => o.customerId === customerId)
    .map((o) => ({ ...o }))
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

export async function fetchAllOrders(): Promise<Order[]> {
  await wait(350);
  return [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

export async function fetchScoopBookings(customerId = BASE_CUSTOMER_ID): Promise<ScoopBooking[]> {
  await wait(300);
  return scoopBookings
    .filter((b) => b.customerId === customerId)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function fetchAllScoopBookings(): Promise<ScoopBooking[]> {
  await wait(300);
  return [...scoopBookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function fetchVideoSlots(fromDate: string, toDate: string): Promise<VideoSlot[]> {
  await wait(300);
  return videoSlots.filter((s) => s.date >= fromDate && s.date <= toDate);
}

export async function fetchIndividualItems(): Promise<IndividualItem[]> {
  await wait(400);
  return individualItems.filter((i) => i.isActive).map((i) => ({ ...i }));
}

export async function fetchAllInventoryItems(): Promise<IndividualItem[]> {
  await wait(400);
  return individualItems.map((i) => ({ ...i }));
}

export async function fetchInventoryMovements(itemId?: string): Promise<InventoryMovement[]> {
  await wait(300);
  const all = [...inventoryMovements].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return itemId ? all.filter((m) => m.itemId === itemId) : all;
}

export async function fetchCustomers(): Promise<Customer[]> {
  await wait(350);
  return [MOCK_CUSTOMER];
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  await wait(900);
  const tier = TIER_BY_ID(input.tierId);
  if (slots[input.tierId] <= 0) {
    throw new Error(`${tier.name} is sold out for this week.`);
  }

  // Reserve video slot if applicable
  if (input.videoAddon && input.videoSlotId) {
    const slot = videoSlots.find((s) => s.id === input.videoSlotId);
    if (!slot) throw new Error("Video slot not found.");
    if (slot.bookedCount >= slot.maxCapacity) throw new Error("That video slot is no longer available. Please select another.");
    if (slot.isBlocked) throw new Error("That video slot has been blocked. Please select another.");
    slot.bookedCount += 1;
  }

  slots[input.tierId] -= 1;

  const videoSlot = input.videoSlotId ? videoSlots.find((s) => s.id === input.videoSlotId) : null;
  const itemCost = SCOOP_ITEM_COST[input.tierId];
  const packagingCost = 25;
  const shippingCostInternal = 45;
  const gatewayFee = Math.round(tier.price * 0.02);
  const videoPrice = input.videoAddon ? VIDEO_ADDON_PRICE : 0;
  const total = tier.price + input.shipping + videoPrice;
  const netProfit = total - itemCost - packagingCost - shippingCostInternal - gatewayFee - input.discount;

  const orderId = `LT-2026-${String(orderSeq++).padStart(5, "0")}`;
  const bookingId = `BKG-${String(bookingSeq++).padStart(3, "0")}`;

  const order: Order = {
    id: orderId,
    customerId: BASE_CUSTOMER_ID,
    customerName: input.name,
    customerPhone: input.phone,
    customerEmail: input.email,
    customerInstagram: input.instagram,
    tierId: input.tierId,
    tierName: tier.name,
    icon: tier.icon,
    price: tier.price,
    videoAddon: input.videoAddon,
    videoDate: videoSlot?.date ?? null,
    videoTime: videoSlot?.time ?? null,
    videoSlotId: input.videoSlotId,
    shipping: input.shipping,
    total,
    itemsPreview: input.itemsPreview,
    status: "confirmed",
    paymentStatus: "successful",
    placedAt: new Date().toISOString(),
    area: input.area,
    building: input.building,
    pin: input.pin,
    note: input.note,
    courier: "",
    trackingNumber: "",
    trackingUrl: "",
    scoopBookingId: bookingId,
    itemCost,
    packagingCost,
    shippingCost: shippingCostInternal,
    paymentGatewayCost: gatewayFee,
    discount: 0,
    netProfit,
  };

  orders.unshift(order);

  scoopBookings.unshift({
    id: bookingId,
    orderId,
    customerId: BASE_CUSTOMER_ID,
    scoopTier: input.tierId,
    experience: input.videoAddon ? "with_video" : "without_video",
    videoSlotId: input.videoSlotId,
    videoDate: videoSlot?.date ?? null,
    videoTime: videoSlot?.time ?? null,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  });

  // Auto-deduct inventory (sample deduction from first few items in pool)
  const pool = INVENTORY.filter((i) => i.tiers.includes(input.tierId)).slice(0, 3);
  pool.forEach((item) => {
    recordMovement(item.id, item.name, "auto_debit", -1, `Auto debit: ${orderId}`, orderId);
  });

  // Update customer stats
  MOCK_CUSTOMER.totalOrders += 1;
  MOCK_CUSTOMER.totalSpend += total;
  MOCK_CUSTOMER.lastOrderAt = new Date().toISOString();

  return { ...order };
}

export async function addIndividualItemToCart(
  _items: CartItem[],
): Promise<{ success: boolean }> {
  await wait(200);
  return { success: true };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  await wait(400);
  const order = orders.find((o) => o.id === orderId);
  if (!order) throw new Error("Order not found");
  order.status = status;
  return { ...order };
}

export async function updateDelivery(
  orderId: string,
  courier: string,
  trackingNumber: string,
  trackingUrl: string,
): Promise<Order> {
  await wait(400);
  const order = orders.find((o) => o.id === orderId);
  if (!order) throw new Error("Order not found");
  order.courier = courier;
  order.trackingNumber = trackingNumber;
  order.trackingUrl = trackingUrl;
  order.status = "shipped";
  return { ...order };
}

export async function addStock(
  itemId: string,
  qty: number,
  costPrice: number,
  note: string,
): Promise<IndividualItem> {
  await wait(500);
  const item = individualItems.find((i) => i.id === itemId);
  if (!item) throw new Error("Item not found");
  recordMovement(itemId, item.name, "stock_entry", qty, note || "Stock entry", null);
  item.stock += qty;
  item.costPrice = costPrice > 0 ? costPrice : item.costPrice;
  return { ...item };
}

export async function manualDebitStock(
  itemId: string,
  qty: number,
  reason: string,
): Promise<IndividualItem> {
  await wait(500);
  const item = individualItems.find((i) => i.id === itemId);
  if (!item) throw new Error("Item not found");
  recordMovement(itemId, item.name, "manual_debit", -qty, reason, null);
  item.stock = Math.max(0, item.stock - qty);
  return { ...item };
}

export async function adjustStock(
  itemId: string,
  newQty: number,
  reason: string,
): Promise<IndividualItem> {
  await wait(500);
  const item = individualItems.find((i) => i.id === itemId);
  if (!item) throw new Error("Item not found");
  const diff = newQty - item.stock;
  recordMovement(itemId, item.name, "adjustment", diff, reason || "Physical stock adjustment", null);
  item.stock = newQty;
  return { ...item };
}

export async function saveProduct(item: Partial<IndividualItem> & { id: string }): Promise<IndividualItem> {
  await wait(500);
  const idx = individualItems.findIndex((i) => i.id === item.id);
  if (idx === -1) {
    const newItem: IndividualItem = {
      id: item.id,
      name: item.name ?? "",
      category: item.category ?? "Accessories",
      emoji: item.emoji ?? "✦",
      description: item.description ?? "",
      sellingPrice: item.sellingPrice ?? 0,
      costPrice: item.costPrice ?? 0,
      stock: item.stock ?? 0,
      minStock: item.minStock ?? 5,
      sku: item.sku ?? "",
      isNew: item.isNew ?? false,
      isLimited: item.isLimited ?? false,
      isFeatured: item.isFeatured ?? false,
      isActive: item.isActive ?? true,
      imageUrl: item.imageUrl ?? "",
    };
    individualItems.push(newItem);
    return { ...newItem };
  }
  Object.assign(individualItems[idx], item);
  return { ...individualItems[idx] };
}

export async function blockVideoSlot(slotId: string, blocked: boolean): Promise<VideoSlot> {
  await wait(300);
  const slot = videoSlots.find((s) => s.id === slotId);
  if (!slot) throw new Error("Slot not found");
  slot.isBlocked = blocked;
  return { ...slot };
}

// ── Dashboard stats ───────────────────────────────────────────────────────────

export interface DashboardStats {
  todaySales: number;
  weeklySales: number;
  monthlySales: number;
  totalSales: number;
  todayOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  todayVideoBookings: number;
  upcomingVideoBookings: number;
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  stockValue: number;
  todayProfit: number;
  monthlyProfit: number;
  totalProfit: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  await wait(500);
  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((o) => o.placedAt.startsWith(today));
  const allPaid = orders.filter((o) => o.paymentStatus === "successful");

  return {
    todaySales: todayOrders.reduce((s, o) => s + o.total, 0),
    weeklySales: allPaid.reduce((s, o) => s + o.total, 0),
    monthlySales: allPaid.reduce((s, o) => s + o.total, 0),
    totalSales: allPaid.reduce((s, o) => s + o.total, 0),
    todayOrders: todayOrders.length,
    pendingOrders: orders.filter((o) => o.status === "confirmed").length,
    processingOrders: orders.filter((o) => o.status === "preparing" || o.status === "packed").length,
    shippedOrders: orders.filter((o) => o.status === "shipped" || o.status === "out_for_delivery").length,
    deliveredOrders: orders.filter((o) => o.status === "delivered").length,
    cancelledOrders: orders.filter((o) => o.status === "cancelled").length,
    todayVideoBookings: scoopBookings.filter((b) => b.videoDate === today).length,
    upcomingVideoBookings: scoopBookings.filter(
      (b) => b.videoDate && b.videoDate > today && b.status === "confirmed",
    ).length,
    totalItems: individualItems.length,
    lowStockItems: individualItems.filter((i) => i.stock > 0 && i.stock <= i.minStock).length,
    outOfStockItems: individualItems.filter((i) => i.stock === 0).length,
    stockValue: individualItems.reduce((s, i) => s + i.stock * i.costPrice, 0),
    todayProfit: todayOrders.reduce((s, o) => s + o.netProfit, 0),
    monthlyProfit: allPaid.reduce((s, o) => s + o.netProfit, 0),
    totalProfit: allPaid.reduce((s, o) => s + o.netProfit, 0),
  };
}
