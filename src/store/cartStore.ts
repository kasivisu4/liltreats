import { create } from "zustand";
import type { TierId } from "../data/tiers";
import type { BannerId } from "../data/banners";
import type { Order } from "../api/mockApi";

export interface ContactDetails {
  name: string;
  phone: string;
  instagram: string;
  building: string;
  area: string;
  pin: string;
  note: string;
}

const EMPTY_CONTACT: ContactDetails = {
  name: "",
  phone: "",
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

interface CartState {
  selectedTier: TierId | null;
  videoAddon: boolean;
  vibes: string[];
  favCategories: string[];
  avoidNote: string;
  paymentMethod: "upi" | "card" | "wallet";
  contact: ContactDetails;
  banner: BannerId;
  lastOrder: Order | null;

  setTier: (t: TierId) => void;
  setLastOrder: (o: Order) => void;
  setVideoAddon: (v: boolean) => void;
  toggleVibe: (v: string) => void;
  toggleCategory: (c: string) => void;
  setAvoidNote: (s: string) => void;
  setPaymentMethod: (m: "upi" | "card" | "wallet") => void;
  setContactField: (field: keyof ContactDetails, value: string) => void;
  setBanner: (b: BannerId) => void;
  resetBooking: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  selectedTier: null,
  videoAddon: false,
  vibes: [],
  favCategories: [],
  avoidNote: "",
  paymentMethod: "upi",
  contact: { ...EMPTY_CONTACT },
  banner: "drop",
  lastOrder: null,

  setTier: (t) => set({ selectedTier: t }),
  setLastOrder: (o) => set({ lastOrder: o }),
  setVideoAddon: (v) => set({ videoAddon: v }),
  toggleVibe: (v) =>
    set((s) => ({
      vibes: s.vibes.includes(v)
        ? s.vibes.filter((x) => x !== v)
        : [...s.vibes, v],
    })),
  toggleCategory: (c) =>
    set((s) => ({
      favCategories: s.favCategories.includes(c)
        ? s.favCategories.filter((x) => x !== c)
        : [...s.favCategories, c],
    })),
  setAvoidNote: (s2) => set({ avoidNote: s2 }),
  setPaymentMethod: (m) => set({ paymentMethod: m }),
  setContactField: (field, value) =>
    set((s) => ({ contact: { ...s.contact, [field]: value } })),
  setBanner: (b) => set({ banner: b }),
  resetBooking: () =>
    set({
      selectedTier: null,
      videoAddon: false,
      vibes: [],
      favCategories: [],
      avoidNote: "",
      paymentMethod: "upi",
      contact: { ...EMPTY_CONTACT },
    }),
}));
