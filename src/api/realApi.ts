/**
 * realApi.ts — Real API calls to the MongoDB backend.
 *
 * All frontend data fetching goes through here.
 * The mock API is kept for reference but is no longer called by queries.ts.
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

// ── Backend shapes ────────────────────────────────────────────────────────────

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
  categoryId: string | { _id: string; name: string };
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

interface BackendCustomer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  instagram?: string;
  totalOrders?: number;
  totalSpend?: number;
  lastOrderAt?: string | null;
  createdAt: string;
}

// ── Mapping helpers ───────────────────────────────────────────────────────────

function mapOrder(o: BackendOrder): Order {
  const scoopItem = o.items?.find((i) => i.scoopConfigId);
  const indivItems = o.items?.filter((i) => i.productId && !i.scoopConfigId) ?? [];

  return {
    id: o.orderNumber ?? o._id,
    _id: o._id,
    customerId: o.userId,
    customerName: o.customerName ?? "",
    customerPhone: o.customerPhone ?? "",
    customerEmail: o.customerEmail ?? "",
    customerInstagram: o.customerInstagram ?? "",
    tierId: null,
    tierName: scoopItem?.name ?? (indivItems.length > 0 ? "Individual Items" : ""),
    icon: "✦",
    price: o.subtotal,
    videoAddon: false,
    videoDate: null,
    videoTime: null,
    videoSlotId: null,
    shipping: o.shippingCost,
    total: o.totalAmount,
    itemsPreview: (o.items ?? []).slice(0, 3).map((i) => i.name),
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
    bookedCount: s.bookedCount + (s.reservedCount ?? 0),
    isBlocked: s.status === "blocked",
  };
}

function mapInventory(inv: BackendInventory): IndividualItem {
  const p = inv.productId;
  const catName = typeof p.categoryId === "object" && p.categoryId
    ? (p.categoryId as { name: string }).name
    : String(p.categoryId ?? "");
  return {
    id: p._id,
    name: p.name,
    category: catName || "Accessories",
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

function mapScoopBooking(b: BackendScoopBooking): ScoopBooking {
  const orderId = typeof b.orderId === "object"
    ? (b.orderId.orderNumber ?? String(b.orderId))
    : String(b.orderId ?? "");
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

function mapCustomer(c: BackendCustomer): Customer {
  return {
    id: c._id,
    name: c.name ?? "",
    phone: c.phone ?? "",
    email: c.email ?? "",
    instagram: c.instagram ?? "",
    totalOrders: c.totalOrders ?? 0,
    totalSpend: c.totalSpend ?? 0,
    lastOrderAt: c.lastOrderAt ?? null,
    joinedAt: c.createdAt,
    addresses: [],
  };
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function fetchCurrentUser() {
  return api.get<{ user: BackendCustomer }>("/auth/me");
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function fetchOrdersReal(): Promise<Order[]> {
  const res = await api.get<{ orders: BackendOrder[] }>("/orders");
  return res.orders.map(mapOrder);
}

export async function fetchAllOrdersReal(): Promise<Order[]> {
  const res = await api.get<{ orders: BackendOrder[] }>("/orders/admin/all");
  return res.orders.map(mapOrder);
}

export async function createOrderReal(
  input: CreateOrderInput & {
    street?: string; city?: string; state?: string; email?: string;
    itemCostTotal?: number; netProfit?: number; packagingCost?: number;
    paymentGatewayFee?: number; discount?: number;
    scoopConfigId?: string;
  },
): Promise<Order> {
  const subtotal = (input as { price?: number }).price ?? 0;
  const shippingCost = input.shipping ?? 0;
  const discount = input.discount ?? 0;
  const packagingCost = input.packagingCost ?? 25;
  const paymentGatewayFee = input.paymentGatewayFee ?? Math.round(subtotal * 0.02);
  const itemCostTotal = input.itemCostTotal ?? 0;
  const totalAmount = subtotal + shippingCost - discount;
  const netProfit = totalAmount - itemCostTotal - packagingCost - shippingCost - paymentGatewayFee - discount;

  const payload = {
    items: input.scoopConfigId
      ? [{ scoopConfigId: input.scoopConfigId, name: input.tierId ?? "", quantity: 1, sellingPrice: subtotal, costPrice: itemCostTotal, subtotal, sku: input.tierId ?? "" }]
      : [],
    scoopBookingData: input.tierId ? {
      tier: input.tierId,
      scoopName: input.tierId,
      experience: input.videoAddon ? "with_video" : "without_video",
      preferences: { vibe: [], favouriteCategories: [], avoidNote: "" },
    } : undefined,
    reservationId: (input as { reservationId?: string }).reservationId,
    subtotal,
    shippingCost,
    discount,
    packagingCost,
    paymentGatewayFee,
    totalAmount,
    itemCostTotal,
    netProfit,
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
    customerInstagram: input.instagram ?? "",
    note: input.note ?? "",
    paymentMethod: input.paymentMethod ?? "upi",
  };

  const res = await api.post<{ order: BackendOrder }>("/orders", payload);
  return mapOrder(res.order);
}

export async function updateOrderStatusReal(orderId: string, status: string): Promise<void> {
  await api.patch(`/orders/${orderId}/status`, { status });
}

export async function updateDeliveryReal(
  orderId: string,
  courier: string,
  trackingNumber: string,
  trackingUrl: string,
): Promise<void> {
  await api.patch(`/orders/${orderId}/delivery`, { courier, trackingNumber, trackingUrl });
}

export async function cancelOrderReal(orderId: string, reason: string): Promise<void> {
  await api.post(`/orders/${orderId}/cancel`, { reason });
}

// ── Video Slots ───────────────────────────────────────────────────────────────

export async function fetchVideoSlotsReal(fromDate: string, toDate: string): Promise<VideoSlot[]> {
  const res = await api.get<{ slots: BackendVideoSlot[] }>(
    `/video/slots?from=${fromDate}&to=${toDate}`,
  );
  return res.slots.map(mapSlot);
}

export async function blockVideoSlotReal(slotId: string, blocked: boolean): Promise<void> {
  await api.patch(`/video/slots/${slotId}`, { status: blocked ? "blocked" : "available" });
}

export async function addVideoSlotReal(date: string, startTime: string, endTime?: string): Promise<VideoSlot> {
  const res = await api.post<{ slot: BackendVideoSlot }>("/video/slots", {
    date,
    startTime,
    endTime: endTime ?? "",
    maxCapacity: 1,
  });
  return mapSlot(res.slot);
}

export async function deleteVideoSlotReal(slotId: string): Promise<void> {
  await api.del(`/video/slots/${slotId}`);
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

export async function fetchVideoAvailabilityReal(fromDate: string, toDate: string) {
  return api.get<{
    availability: Array<{ date: string; booked: number; capacity: number; available: number; fullyBooked: boolean }>;
    maxBookingsPerDay: number;
  }>(`/video/availability?from=${fromDate}&to=${toDate}`);
}

export async function fetchVideoConfigReal() {
  return api.get<{
    config: {
      minimumLeadDays: number;
      bookingWindowDays: number;
      maxBookingsPerDay: number;
      reservationTimeoutMinutes: number;
    };
  }>("/video/config");
}

// ── Products / Inventory ──────────────────────────────────────────────────────

export async function fetchIndividualItemsReal(): Promise<IndividualItem[]> {
  const res = await api.get<{ items: BackendInventory[] }>("/inventory");
  return res.items.filter((i) => i.productId?.isActive).map(mapInventory);
}

export async function fetchAllInventoryItemsReal(): Promise<IndividualItem[]> {
  const res = await api.get<{ items: BackendInventory[] }>("/inventory");
  return res.items.map(mapInventory);
}

export async function fetchInventoryMovementsReal(productId?: string): Promise<InventoryMovement[]> {
  const path = productId
    ? `/inventory/movements/${productId}`
    : "/inventory/movements";
  const res = await api.get<{ movements: BackendMovement[] }>(path);
  return res.movements.map(mapMovement);
}

export async function addStockReal(
  itemId: string,
  qty: number,
  costPrice: number,
  note: string,
): Promise<void> {
  await api.post("/inventory/add-stock", { productId: itemId, quantity: qty, costPrice, note });
}

export async function manualDebitStockReal(
  itemId: string,
  qty: number,
  reason: string,
): Promise<void> {
  await api.post("/inventory/manual-debit", { productId: itemId, quantity: qty, reason });
}

export async function adjustStockReal(
  itemId: string,
  newQty: number,
  reason: string,
): Promise<void> {
  await api.post("/inventory/adjust", { productId: itemId, newQuantity: newQty, reason });
}

export async function saveProductReal(product: {
  id?: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  description: string;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
}): Promise<void> {
  const payload = {
    name: product.name,
    sku: product.sku,
    costPrice: product.costPrice,
    sellingPrice: product.sellingPrice,
    currentStock: product.stock,
    minimumStock: product.minStock,
    description: product.description,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
  };

  if (product.id) {
    await api.patch(`/products/${product.id}`, payload);
  } else {
    await api.post("/products", {
      ...payload,
      slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    });
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function fetchDashboardStatsReal(): Promise<DashboardStats> {
  const res = await api.get<DashboardStats>("/admin/dashboard");
  return res;
}

// ── Scoop Bookings ────────────────────────────────────────────────────────────

export async function fetchScoopBookingsReal(): Promise<ScoopBooking[]> {
  const res = await api.get<{ bookings: BackendScoopBooking[] }>("/bookings");
  return res.bookings.map(mapScoopBooking);
}

export async function fetchAllScoopBookingsReal(): Promise<ScoopBooking[]> {
  const res = await api.get<{ bookings: BackendScoopBooking[] }>("/bookings/admin/all");
  return res.bookings.map(mapScoopBooking);
}

// ── Customers (admin) ─────────────────────────────────────────────────────────

export async function fetchCustomersReal(): Promise<Customer[]> {
  const res = await api.get<{ customers: BackendCustomer[] }>("/admin/customers");
  return res.customers.map(mapCustomer);
}

// ── Scoop configs (public) ────────────────────────────────────────────────────

export async function fetchScoopConfigsReal() {
  return api.get<{
    scoops: Array<{
      _id: string; tier: string; name: string; price: number;
      itemRange: string; description: string; isActive: boolean;
    }>;
  }>("/scoops");
}

// ── Categories (public) ───────────────────────────────────────────────────────

export async function fetchCategoriesReal() {
  return api.get<{
    categories: Array<{ _id: string; name: string; slug: string }>;
  }>("/categories");
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function fetchNotificationsReal() {
  return api.get<{
    notifications: Array<{
      _id: string; type: string; title: string; message: string;
      isRead: boolean; createdAt: string;
    }>;
  }>("/notifications");
}

export async function markNotificationReadReal(notificationId: string) {
  return api.patch(`/notifications/${notificationId}/read`, {});
}
