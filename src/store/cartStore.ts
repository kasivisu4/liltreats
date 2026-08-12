import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TierId } from "../data/tiers";
import type { BannerId } from "../data/banners";
import type { Order } from "../api/mockApi";

export interface ContactDetails {
  name: string;
  phone: string;
  email: string;
  instagram: string;
  building: string;
  area: string;
  pin: string;
  note: string;
}

const EMPTY_CONTACT: ContactDetails = {
  name: "",
  phone: "",
  email: "",
  instagram: "",
  building: "",
  area: "",
  pin: "",
  note: "",
};

export const VIBES = ["Minimal", "Cute / kawaii", "Boho", "Elegant", "Trendy", "Y2K"] as const;
export const FAV_CATEGORIES = [
  "Jewellery",
  "Hair accessories",
  "Beauty",
  "Lifestyle",
  "Trinkets",
  "Stationery",
] as const;

export const SHIPPING_FLAT = 60;

export interface ShopCartItem {
  itemId: string;
  name: string;
  emoji: string;
  price: number;
  quantity: number;
}

interface CartState {
  // Scoop booking
  selectedTier: TierId | null;
  videoAddon: boolean;
  selectedVideoSlotId: string | null;
  selectedVideoDate: string | null;
  selectedVideoTime: string | null;
  vibes: string[];
  favCategories: string[];
  avoidNote: string;
  selectedBoard: 1 | 2 | null;
  // Individual items cart
  shopCart: ShopCartItem[];
  // Checkout
  paymentMethod: "upi" | "card" | "wallet";
  contact: ContactDetails;
  banner: BannerId;
  lastOrder: Order | null;

  // Actions – scoop
  setTier: (t: TierId | null) => void;
  setVideoAddon: (v: boolean) => void;
  setVideoSlot: (slotId: string | null, date: string | null, time: string | null) => void;
  toggleVibe: (v: string) => void;
  toggleCategory: (c: string) => void;
  setAvoidNote: (s: string) => void;
  setSelectedBoard: (b: 1 | 2 | null) => void;
  // Actions – shop cart
  addToShopCart: (item: ShopCartItem) => void;
  updateShopCartQty: (itemId: string, qty: number) => void;
  removeFromShopCart: (itemId: string) => void;
  clearShopCart: () => void;
  // Actions – checkout
  setPaymentMethod: (m: "upi" | "card" | "wallet") => void;
  setContactField: (field: keyof ContactDetails, value: string) => void;
  setBanner: (b: BannerId) => void;
  setLastOrder: (o: Order) => void;
  resetBooking: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      selectedTier: null,
      videoAddon: false,
      selectedVideoSlotId: null,
      selectedVideoDate: null,
      selectedVideoTime: null,
      vibes: [],
      favCategories: [],
      avoidNote: "",
      selectedBoard: null,
      shopCart: [],
      paymentMethod: "upi",
      contact: { ...EMPTY_CONTACT },
      banner: "drop",
      lastOrder: null,

      setTier: (t) => set({ selectedTier: t }),
      setVideoAddon: (v) =>
        set({ videoAddon: v, ...(v === false ? { selectedVideoSlotId: null, selectedVideoDate: null, selectedVideoTime: null } : {}) }),
      setVideoSlot: (slotId, date, time) =>
        set({ selectedVideoSlotId: slotId, selectedVideoDate: date, selectedVideoTime: time }),
      toggleVibe: (v) =>
        set((s) => ({
          vibes: s.vibes.includes(v) ? s.vibes.filter((x) => x !== v) : [...s.vibes, v],
        })),
      toggleCategory: (c) =>
        set((s) => ({
          favCategories: s.favCategories.includes(c)
            ? s.favCategories.filter((x) => x !== c)
            : [...s.favCategories, c],
        })),
      setAvoidNote: (s2) => set({ avoidNote: s2 }),

      addToShopCart: (item) =>
        set((s) => {
          const existing = s.shopCart.find((i) => i.itemId === item.itemId);
          if (existing) {
            return {
              shopCart: s.shopCart.map((i) =>
                i.itemId === item.itemId ? { ...i, quantity: i.quantity + item.quantity } : i,
              ),
            };
          }
          return { shopCart: [...s.shopCart, item] };
        }),
      updateShopCartQty: (itemId, qty) =>
        set((s) => ({
          shopCart:
            qty <= 0
              ? s.shopCart.filter((i) => i.itemId !== itemId)
              : s.shopCart.map((i) => (i.itemId === itemId ? { ...i, quantity: qty } : i)),
        })),
      removeFromShopCart: (itemId) =>
        set((s) => ({ shopCart: s.shopCart.filter((i) => i.itemId !== itemId) })),
      clearShopCart: () => set({ shopCart: [] }),

      setPaymentMethod: (m) => set({ paymentMethod: m }),
      setContactField: (field, value) =>
        set((s) => ({ contact: { ...s.contact, [field]: value } })),
      setBanner: (b) => set({ banner: b }),
      setLastOrder: (o) => set({ lastOrder: o }),
      resetBooking: () =>
        set({
          selectedTier: null,
          videoAddon: false,
          selectedVideoSlotId: null,
          selectedVideoDate: null,
          selectedVideoTime: null,
          vibes: [],
          favCategories: [],
          avoidNote: "",
          paymentMethod: "upi",
          contact: { ...EMPTY_CONTACT },
        }),
    }),
    {
      name: "liltreats-cart",
      partialize: (s) => ({
        contact: s.contact,
        shopCart: s.shopCart,
        banner: s.banner,
      }),
    },
  ),
);
