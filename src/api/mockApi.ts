import { INVENTORY, type ScoopItem } from "../data/inventory";
import { TIERS, TIER_BY_ID, type TierId } from "../data/tiers";

// ──────────────────────────────────────────────────────────────────────────
// In-memory mock backend. Mirrors the shape of the eventual Supabase layer so
// swapping fetch implementations later is a drop-in. All functions are async
// with simulated latency so TanStack Query behaves like it will in production.
// ──────────────────────────────────────────────────────────────────────────

export type OrderStatus = "confirmed" | "preparing" | "dispatched" | "delivered";

export interface Order {
  id: string;
  tierId: TierId;
  tierName: string;
  icon: string;
  price: number;
  videoAddon: boolean;
  shipping: number;
  total: number;
  itemsPreview: string[];
  status: OrderStatus;
  placedAt: string; // ISO
  area: string;
}

export interface SlotMap {
  mini: number;
  magic: number;
  premium: number;
}

export interface CreateOrderInput {
  tierId: TierId;
  videoAddon: boolean;
  shipping: number;
  itemsPreview: string[];
  area: string;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Seeded mutable state (resets on reload — stands in for the DB).
const slots: SlotMap = {
  mini: TIER_BY_ID("mini").slots,
  magic: TIER_BY_ID("magic").slots,
  premium: TIER_BY_ID("premium").slots,
};

const orders: Order[] = [
  {
    id: "ORD-042",
    tierId: "magic",
    tierName: "Magic Scoop",
    icon: "✨",
    price: 899,
    videoAddon: true,
    shipping: 60,
    total: 1058,
    itemsPreview: ["Pearl drop earrings", "Hair bow clips", "Mini perfume vial"],
    status: "preparing",
    placedAt: "2026-06-23T10:20:00.000Z",
    area: "Banjara Hills",
  },
  {
    id: "ORD-031",
    tierId: "mini",
    tierName: "Mini Scoop",
    icon: "🌿",
    price: 499,
    videoAddon: false,
    shipping: 50,
    total: 549,
    itemsPreview: ["Surprise curation"],
    status: "delivered",
    placedAt: "2026-06-16T09:00:00.000Z",
    area: "Kondapur",
  },
];

let orderSeq = 43;

export async function fetchSlots(): Promise<SlotMap> {
  await wait(450);
  return { ...slots };
}

export async function fetchInventory(): Promise<ScoopItem[]> {
  await wait(550);
  return INVENTORY.map((i) => ({ ...i }));
}

export async function fetchOrders(): Promise<Order[]> {
  await wait(400);
  return orders.map((o) => ({ ...o })).sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  await wait(900);
  const tier = TIER_BY_ID(input.tierId);
  if (slots[input.tierId] <= 0) {
    throw new Error(`${tier.name} is sold out for this week.`);
  }
  slots[input.tierId] -= 1;
  const total = tier.price + input.shipping + (input.videoAddon ? 99 : 0);
  const order: Order = {
    id: `ORD-${String(orderSeq++).padStart(3, "0")}`,
    tierId: tier.id,
    tierName: tier.name,
    icon: tier.icon,
    price: tier.price,
    videoAddon: input.videoAddon,
    shipping: input.shipping,
    total,
    itemsPreview: input.itemsPreview,
    status: "confirmed",
    placedAt: new Date().toISOString(),
    area: input.area || "Hyderabad",
  };
  orders.unshift(order);
  return { ...order };
}

export const TOTAL_SLOTS: SlotMap = {
  mini: TIERS[0].slots,
  magic: TIERS[1].slots,
  premium: TIERS[2].slots,
};
