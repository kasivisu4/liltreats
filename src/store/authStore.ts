import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address } from "../api/mockApi";
import { _useInlineAuth } from "../components/BottomNav";

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

const API = "/api/auth";

// Cookie helpers — no expiry means session survives until explicit logout
function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}
function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

async function apiFetch(path: string, body: object) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

function toAuthUser(u: any, joinedAt?: string): AuthUser {
  return {
    id: u.id || u._id,
    name: u.name,
    phone: u.phone || "",
    email: u.email,
    instagram: u.instagram || "",
    joinedAt: joinedAt || u.createdAt || new Date().toISOString(),
    totalSpend: u.totalSpend || 0,
    addresses: [],
    role: u.role || "customer",
  };
}

let addrSeq = 100;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      login: async (email, password) => {
        const data = await apiFetch("/login", { email, password });
        setCookie("lt_token", data.token);
        set({
          user: toAuthUser(data.user),
          token: data.token,
          isLoggedIn: true,
        });
      },

      signup: async (name, phone, email, password) => {
        const data = await apiFetch("/signup", { name, phone, email, password });
        setCookie("lt_token", data.token);
        set({
          user: toAuthUser(data.user),
          token: data.token,
          isLoggedIn: true,
        });
      },

      logout: () => {
        clearCookie("lt_token");
        set({ user: null, token: null, isLoggedIn: false });
      },

      updateProfile: (fields) =>
        set((s) => (s.user ? { user: { ...s.user, ...fields } } : {})),

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
