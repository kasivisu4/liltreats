import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address } from "../api/mockApi";

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  instagram: string;
  joinedAt: string;
  totalSpend: number;
  addresses: Address[];
  role: "customer" | "admin";
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, phone: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (fields: Partial<Pick<AuthUser, "name" | "phone" | "email" | "instagram">>) => void;
  addAddress: (addr: Omit<Address, "id">) => void;
  updateAddress: (id: string, addr: Partial<Omit<Address, "id">>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

let addrSeq = 100;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      login: async (email, password) => {
        // Mock login — swap for real API call in Module 30
        await new Promise((r) => setTimeout(r, 800));
        if (password.length < 6) throw new Error("Invalid email or password.");
        const mockUser: AuthUser = {
          id: "u001",
          name: email.split("@")[0],
          phone: "+91 98765 43210",
          email,
          instagram: "@liltreats_fan",
          joinedAt: new Date().toISOString(),
          totalSpend: 0,
          addresses: [],
          role: "customer",
        };
        set({ user: mockUser, token: "mock-jwt-token", isLoggedIn: true });
      },

      signup: async (name, phone, email, _password) => {
        await new Promise((r) => setTimeout(r, 900));
        const mockUser: AuthUser = {
          id: `u-${Date.now()}`,
          name,
          phone,
          email,
          instagram: "",
          joinedAt: new Date().toISOString(),
          totalSpend: 0,
          addresses: [],
          role: "customer",
        };
        set({ user: mockUser, token: "mock-jwt-token", isLoggedIn: true });
      },

      logout: () => set({ user: null, token: null, isLoggedIn: false }),

      updateProfile: (fields) =>
        set((s) =>
          s.user ? { user: { ...s.user, ...fields } } : {},
        ),

      addAddress: (addr) => {
        const id = `addr-${String(addrSeq++).padStart(3, "0")}`;
        set((s) => {
          if (!s.user) return {};
          const addresses = addr.isDefault
            ? [...s.user.addresses.map((a) => ({ ...a, isDefault: false })), { ...addr, id }]
            : [...s.user.addresses, { ...addr, id }];
          return { user: { ...s.user, addresses } };
        });
      },

      updateAddress: (id, fields) =>
        set((s) => {
          if (!s.user) return {};
          return {
            user: {
              ...s.user,
              addresses: s.user.addresses.map((a) =>
                a.id === id ? { ...a, ...fields } : a,
              ),
            },
          };
        }),

      deleteAddress: (id) =>
        set((s) => {
          if (!s.user) return {};
          const addresses = s.user.addresses.filter((a) => a.id !== id);
          if (addresses.length > 0 && !addresses.some((a) => a.isDefault))
            addresses[0].isDefault = true;
          return { user: { ...s.user, addresses } };
        }),

      setDefaultAddress: (id) =>
        set((s) => {
          if (!s.user) return {};
          return {
            user: {
              ...s.user,
              addresses: s.user.addresses.map((a) => ({
                ...a,
                isDefault: a.id === id,
              })),
            },
          };
        }),
    }),
    {
      name: "liltreats-auth",
      partialize: (s) => ({ user: s.user, token: s.token, isLoggedIn: s.isLoggedIn }),
    },
  ),
);
