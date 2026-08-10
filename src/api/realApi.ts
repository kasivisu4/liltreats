/**
 * realApi.ts — Real API calls to the MongoDB backend.
 *
 * These functions replace their counterparts in mockApi.ts.
 * Import from here for any function that has been wired to the backend.
 * The rest of the app continues to import from mockApi.ts during the migration.
 */

import { api } from "./client";
import type {
  Order,
  VideoSlot,
  IndividualItem,
  InventoryMovement,
  Customer,
  DashboardStats,
  CreateOrderInput,
  ScoopBooking,
} from "./mockApi";
import type { TierId } from "../data/tiers";

// ── Types returned by real backend ───────────────────────────────────────────

interface BackendOrder {
  _id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerInstagram: string;
  items: Array<{
    productId: string | null;
    scoopConfigId: string | null;
    name: string;
    quantity: number;
    sellingPrice: number;
    costPrice: number;
    subtotal: number;
    sku: string;
  }>;
  subtotal: number;
  shippingCost: number;
  discount: number;
  packagingCost: number;
  paymentGatewayFee: number;
  totalAmount: number;
  itemCostTotal: number;
  netProfit: number;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: {
    name: string; phone: string; email: string;
    house: string; street: string; area: string;
    city: string; state: string; pincode: string;
  };
  courier: string;
  trackingNumber: string;
  trackingUrl: string;
  note: string;
  cancelReason: string;
  cancelledAt: string | null;
  inventoryDeducted: boolean;
  createdAt: string;
}

interface BackendVideoSlot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  reservedCount: number;
  status: string;
}

interface BackendProduct {
  _id: string;
  sku: string;
  name: string;
  description: string;
  images: string[];
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStock: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  categoryId: string;
}

interface BackendInventory {
  _id: string;
  productId: BackendProduct;
  sku: string;
  currentStock: number;
  minimumStock: number;
  costPrice: number;
  stockValue: number;
}

interface BackendMovement {
  _id: string;
  productId: { name: string; sku: string } | null;
  sku: string;
  type: string;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  referenceId: string | null;
  createdAt: string;
}

// ── Mapping helpers ───────────────────────────────────────────────────────────

function mapOrder(o: BackendOrder): Order {
  // Determine scoop tier from items
  const scoopItem = o.items.find((i) => i.scoopConfigId);
  const indivItems = o.items.filter((i) => i.productId && !i.scoopConfigId);

  return {
    id: o.orderNumber,
    customerId: o.userId,
    customerName: o.customerName ?? "",
    customerPhone: o.customerPhone ?? "",
    customerEmail: o.customerEmail ?? "",
    customerInstagram: o.customerInstagram ?? "",
    tierId: null, // populated separately if needed
    tierName: scoopItem?.name ?? (indivItems.length > 0 ? "Individual Items" : ""),
    icon: "✦",
    price: o.subtotal,
    videoAddon: false, // enriched by booking query if needed
    videoDate: null,
    videoTime: null,
    videoSlotId: null,
    shipping: o.shippingCost,
    total: o.totalAmount,
    itemsPreview: o.items.slice(0, 3).map((i) => i.name),
    status: o.orderStatus as Order["status"],
    paymentStatus: o.paymentStatus as Order["paymentStatus"],
    placedAt: o.createdAt,
    area: o.shippingAddress?.area ?? "",
    building: `${o.shippingAddress?.house ?? ""} ${o.shippingAddress?.street ?? ""}`.trim(),
    pin: o.shippingAddress?.pincode ?? "",
    note: o.note ?? "",
    courier: o.courier ?? "",
    trackingNumber: o.trackingNumber ?? "",
    trackingUrl: o.trackingUrl ?? "",
    scoopBookingId: null,
    itemCost: o.itemCostTotal ?? 0,
    packagingCost: o.packagingCost ?? 0,
    shippingCost: o.shippingCost ?? 0,
    paymentGatewayCost: o.paymentGatewayFee ?? 0,
    discount: o.discount ?? 0,
    netProfit: o.netProfit ?? 0,
  };
}

function mapSlot(s: BackendVideoSlot): VideoSlot {
  return {
    id: s._id,
    date: s.date,
    time: s.startTime,
    maxCapacity: s.maxCapacity,
    bookedCount: s.bookedCount + s.reservedCount,
    isBlocked: s.status === "blocked",
  };
}

function mapProduct(inv: BackendInventory): IndividualItem {
  const p = inv.productId;
  return {
    id: p._id,
    name: p.name,
    category: p.categoryId ?? "Accessories",
    emoji: "✦",
    description: p.description ?? "",
    sellingPrice: p.sellingPrice,
    costPrice: inv.costPrice,
    stock: inv.currentStock,
    minStock: inv.minimumStock,
    sku: inv.sku,
    isNew: p.isNew ?? false,
    isLimited: false,
    isFeatured: p.isFeatured ?? false,
    isActive: p.isActive ?? true,
    imageUrl: p.images?.[0] ?? "",
  };
}

function mapMovement(m: BackendMovement): InventoryMovement {
  return {
    id: m._id,
    itemId: typeof m.productId === "object" && m.productId ? m.productId.sku : m.sku,
    itemName: typeof m.productId === "object" && m.productId ? m.productId.name : m.sku,
    type: (m.type === "automatic_debit" ? "auto_debit"
      : m.type === "order_reversal" ? "reversal"
      : m.type) as InventoryMovement["type"],
    quantity: m.quantity,
    reason: m.reason,
    adminNote: "",
    orderId: m.referenceId ?? null,
    balanceBefore: m.previousStock,
    balanceAfter: m.newStock,
    createdAt: m.createdAt,
  };
}

// ── Phase D — Orders ──────────────────────────────────────────────────────────

export async function fetchOrdersReal(): Promise<Order[]> {
  const res = await api.get<{ orders: BackendOrder[] }>("/orders");
  return res.orders.map(mapOrder);
}

export async function fetchAllOrdersReal(): Promise<Order[]> {
  const res = await api.get<{ orders: BackendOrder[] }>("/orders/admin/all");
  return res.orders.map(mapOrder);
}

export async function createOrderReal(input: CreateOrderInput & {
  street?: string; city?: string; state?: string; email?: string;
}): Promise<Order> {
  const payload = {
    items: [],
    scoopBookingData: {
      tier: input.tierId,
      scoopName: input.tierId,
      experience: input.videoAddon ? "with_video" : "without_video",
      preferences: { vibe: [], favouriteCategories: [], avoidNote: "" },
    },
    subtotal: 0,
    shippingCost: input.shipping,
    discount: 0,
    totalAmount: 0,
    shippingAddress: {
      name: input.name,
      phone: input.phone,
      email: input.email ?? "",
      house: input.building,
      street: input.street ?? "",
      area: input.area,
      city: input.city ?? "Hyderabad",
      state: input.state ?? "Telangana",
      pincode: input.pin,
    },
    customerName: input.name,
    customerPhone: input.phone,
    customerEmail: input.email ?? "",
    customerInstagram: input.instagram,
    note: input.note,
    paymentMethod: input.paymentMethod,
  };

  const res = await api.post<{ order: BackendOrder }>("/orders", payload);
  return mapOrder(res.order);
}

export async function updateOrderStatusReal(orderId: string, status: string): Promise<void> {
  // orderId here is the orderNumber (LT-2026-XXXXX); we need the _id
  // The admin order list includes _id — for now patch by orderNumber via admin route
  await api.patch(`/orders/${orderId}/status`, { status });
}

// ── Phase C — Video Slots ─────────────────────────────────────────────────────

export async function fetchVideoSlotsReal(fromDate: string, toDate: string): Promise<VideoSlot[]> {
  const res = await api.get<{ slots: BackendVideoSlot[] }>(
    `/video/slots?from=${fromDate}&to=${toDate}`,
  );
  return res.slots.map(mapSlot);
}

export async function reserveVideoSlotReal(slotId: string): Promise<{ reservationId: string; expiresAt: string }> {
  const res = await api.post<{ reservationId: string; expiresAt: string }>(
    "/video/reserve",
    { slotId },
  );
  return res;
}

export async function releaseVideoSlotReal(reservationId: string): Promise<void> {
  await api.post(`/video/release/${reservationId}`, {});
}

// ── Phase B — Products ────────────────────────────────────────────────────────

export async function fetchIndividualItemsReal(): Promise<IndividualItem[]> {
  const res = await api.get<{ items: BackendInventory[] }>("/inventory");
  return res.items.filter((i) => i.productId?.isActive).map(mapProduct);
}

export async function fetchAllInventoryItemsReal(): Promise<IndividualItem[]> {
  const res = await api.get<{ items: BackendInventory[] }>("/inventory");
  return res.items.map(mapProduct);
}

// ── Inventory movements ───────────────────────────────────────────────────────

export async function fetchInventoryMovementsReal(productId?: string): Promise<InventoryMovement[]> {
  const path = productId
    ? `/inventory/movements/${productId}`
    : "/inventory/movements";
  const res = await api.get<{ movements: BackendMovement[] }>(path);
  return res.movements.map(mapMovement);
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function fetchDashboardStatsReal(): Promise<DashboardStats> {
  const res = await api.get<DashboardStats>("/admin/dashboard");
  return res;
}

// ── Scoop Bookings ────────────────────────────────────────────────────────────

interface BackendScoopBooking {
  _id: string;
  bookingId?: string;
  orderId: string | { orderNumber?: string };
  userId: string;
  tier: TierId;
  scoopName: string;
  experience: "with_video" | "without_video";
  videoBookingId: string | null;
  status: string;
  createdAt: string;
}

function mapScoopBooking(b: BackendScoopBooking): ScoopBooking {
  const orderId = typeof b.orderId === "object" ? (b.orderId.orderNumber ?? "") : String(b.orderId ?? "");
  return {
    id: b.bookingId ?? b._id,
    orderId,
    customerId: b.userId,
    scoopTier: b.tier,
    experience: b.experience,
    videoSlotId: b.videoBookingId ?? null,
    videoDate: null,
    videoTime: null,
    status: b.status as "confirmed" | "cancelled",
    createdAt: b.createdAt,
  };
}

export async function fetchScoopBookingsReal(): Promise<ScoopBooking[]> {
  const res = await api.get<{ bookings: BackendScoopBooking[] }>("/bookings");
  return res.bookings.map(mapScoopBooking);
}

export async function fetchAllScoopBookingsReal(): Promise<ScoopBooking[]> {
  const res = await api.get<{ bookings: BackendScoopBooking[] }>("/bookings/admin/all");
  return res.bookings.map(mapScoopBooking);
}

// ── Customers (admin) ─────────────────────────────────────────────────────────

interface BackendCustomer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  instagram?: string;
  createdAt: string;
}

function mapCustomer(c: BackendCustomer): Customer {
  return {
    id: c._id,
    name: c.name ?? "",
    phone: c.phone ?? "",
    email: c.email ?? "",
    instagram: c.instagram ?? "",
    totalOrders: 0,
    totalSpend: 0,
    lastOrderAt: null,
    joinedAt: c.createdAt,
    addresses: [],
  };
}

export async function fetchCustomersReal(): Promise<Customer[]> {
  const res = await api.get<{ customers: BackendCustomer[] }>("/admin/customers");
  return res.customers.map(mapCustomer);
}
