import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address } from "../api/mockApi";

// ─────────────────────────────────────────────────────────────────────────────
// Auth store — mock for now, swap internals for Supabase auth when wiring up.
// Shape is intentionally kept close to Supabase user/session structure.
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  instagram: string;
  joinedAt: string;
  totalSpend: number;
  addresses: Address[];
}

interface AuthState {
  user: AuthUser | null;
  isLoggedIn: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, phone: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (fields: Partial<Pick<AuthUser, "name" | "phone" | "email" | "instagram">>) => void;
  addAddress: (addr: Omit<Address, "id">) => void;
  updateAddress: (id: string, addr: Partial<Omit<Address, "id">>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

// Seeded mock user matches MOCK_CUSTOMER in mockApi.ts
const SEED_USER: AuthUser = {
  id: "cust-001",
  name: "Priya Sharma",
  phone: "+91 98765 43210",
  email: "priya@example.com",
  instagram: "@priyastyled",
  joinedAt: "2026-04-01T00:00:00.000Z",
  totalSpend: 2607,
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

let addrSeq = 2;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,

      login: async (email, _password) => {
        // Mock: any password works; email "priya@example.com" loads seed user
        await new Promise((r) => setTimeout(r, 1100));
        const user: AuthUser =
          email.toLowerCase() === SEED_USER.email
            ? { ...SEED_USER }
            : {
                id: `cust-${Date.now()}`,
                name: email.split("@")[0],
                phone: "",
                email,
                instagram: "",
                joinedAt: new Date().toISOString(),
                totalSpend: 0,
                addresses: [],
              };
        set({ user, isLoggedIn: true });
      },

      signup: async (name, phone, email, _password) => {
        await new Promise((r) => setTimeout(r, 1300));
        const user: AuthUser = {
          id: `cust-${Date.now()}`,
          name,
          phone,
          email,
          instagram: "",
          joinedAt: new Date().toISOString(),
          totalSpend: 0,
          addresses: [],
        };
        set({ user, isLoggedIn: true });
      },

      logout: () => set({ user: null, isLoggedIn: false }),

      updateProfile: (fields) =>
        set((s) =>
          s.user ? { user: { ...s.user, ...fields } } : {},
        ),

      addAddress: (addr) => {
        const id = `addr-${String(addrSeq++).padStart(3, "0")}`;
        set((s) => {
          if (!s.user) return {};
          const addresses = addr.isDefault
            ? [
                ...s.user.addresses.map((a) => ({ ...a, isDefault: false })),
                { ...addr, id },
              ]
            : [...s.user.addresses, { ...addr, id }];
          return { user: { ...s.user, addresses } };
        });
      },

      updateAddress: (id, fields) =>
        set((s) => {
          if (!s.user) return {};
          const addresses = s.user.addresses.map((a) =>
            a.id === id ? { ...a, ...fields } : a,
          );
          return { user: { ...s.user, addresses } };
        }),

      deleteAddress: (id) =>
        set((s) => {
          if (!s.user) return {};
          const addresses = s.user.addresses.filter((a) => a.id !== id);
          // If deleted was default, promote first remaining
          if (addresses.length > 0 && !addresses.some((a) => a.isDefault)) {
            addresses[0].isDefault = true;
          }
          return { user: { ...s.user, addresses } };
        }),

      setDefaultAddress: (id) =>
        set((s) => {
          if (!s.user) return {};
          const addresses = s.user.addresses.map((a) => ({
            ...a,
            isDefault: a.id === id,
          }));
          return { user: { ...s.user, addresses } };
        }),
    }),
    {
      name: "liltreats-auth",
      partialize: (s) => ({ user: s.user, isLoggedIn: s.isLoggedIn }),
    },
  ),
);
