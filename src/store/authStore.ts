import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../api/client";
import type { Address } from "../api/mockApi";

// ─────────────────────────────────────────────────────────────────────────────
// Auth store — wired to real MongoDB backend via /api/auth
// JWT token is persisted and attached to every API call by client.ts
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
  role: "customer" | "admin";
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, phone: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (fields: Partial<Pick<AuthUser, "name" | "phone" | "email" | "instagram">>) => Promise<void>;
  addAddress: (addr: Omit<Address, "id">) => void;
  updateAddress: (id: string, addr: Partial<Omit<Address, "id">>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

let addrSeq = 100;

interface LoginResponse {
  token: string;
  user: {
    id: string; _id?: string; name: string; phone: string;
    email: string; instagram?: string; role: "customer" | "admin";
    createdAt?: string;
  };
}

function mapUser(u: LoginResponse["user"]): AuthUser {
  return {
    id: String(u.id ?? u._id ?? ""),
    name: u.name ?? "",
    phone: u.phone ?? "",
    email: u.email ?? "",
    instagram: u.instagram ?? "",
    joinedAt: u.createdAt ?? new Date().toISOString(),
    totalSpend: 0,
    addresses: [],
    role: u.role ?? "customer",
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      login: async (email, password) => {
        const res = await api.post<LoginResponse>("/auth/login", { email, password });
        set({ token: res.token, user: mapUser(res.user), isLoggedIn: true });
      },

      signup: async (name, phone, email, password) => {
        const res = await api.post<LoginResponse>("/auth/signup", { name, phone, email, password });
        set({ token: res.token, user: mapUser(res.user), isLoggedIn: true });
      },

      logout: () => set({ user: null, token: null, isLoggedIn: false }),

      updateProfile: async (fields) => {
        const res = await api.patch<{ user: LoginResponse["user"] }>("/auth/me", fields);
        set((s) => s.user
          ? { user: { ...s.user, ...fields, name: res.user.name, phone: res.user.phone } }
          : {},
        );
      },

      // Address management remains local (will be wired to /api/addresses in Phase E)
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
          return { user: { ...s.user, addresses: s.user.addresses.map((a) => a.id === id ? { ...a, ...fields } : a) } };
        }),

      deleteAddress: (id) =>
        set((s) => {
          if (!s.user) return {};
          const addresses = s.user.addresses.filter((a) => a.id !== id);
          if (addresses.length > 0 && !addresses.some((a) => a.isDefault)) addresses[0].isDefault = true;
          return { user: { ...s.user, addresses } };
        }),

      setDefaultAddress: (id) =>
        set((s) => {
          if (!s.user) return {};
          return { user: { ...s.user, addresses: s.user.addresses.map((a) => ({ ...a, isDefault: a.id === id })) } };
        }),
    }),
    {
      name: "liltreats-auth",
      partialize: (s) => ({ user: s.user, token: s.token, isLoggedIn: s.isLoggedIn }),
    },
  ),
);
