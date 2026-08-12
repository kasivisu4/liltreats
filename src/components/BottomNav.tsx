import { Link, useNavigate } from "@tanstack/react-router";
import { Home, Sparkles, Receipt, UserCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Inline auth store (self-contained so this file has no external store dep) ──
interface InlineAuthState {
  isLoggedIn: boolean;
  role: "customer" | "admin" | null;
  _hydrated: boolean;
}
export const _useInlineAuth = create<InlineAuthState>()(
  persist(
    () => ({ isLoggedIn: false, role: null as "customer" | "admin" | null, _hydrated: false }),
    { name: "liltreats-auth", partialize: (s) => ({ isLoggedIn: s.isLoggedIn, role: s.role }) },
  ),
);

interface Tab {
  label: string;
  icon: LucideIcon;
  authTo: string;
  guestTo: string;
  exactActive?: boolean;
}

const TABS: Tab[] = [
  { label: "Home",    icon: Home,       authTo: "/",         guestTo: "/",        exactActive: true },
  { label: "Scoops",  icon: Sparkles,   authTo: "/inventory", guestTo: "/inventory" },
  { label: "Orders",  icon: Receipt,    authTo: "/orders",   guestTo: "/login"    },
  { label: "Account", icon: UserCircle, authTo: "/account",  guestTo: "/login"    },
];

export function BottomNav() {
  const isLoggedIn = _useInlineAuth((s) => s.isLoggedIn);

  return (
    <nav className="grid grid-cols-4 border-t border-line bg-cream/95 px-1 pb-1.5 pt-2.5 backdrop-blur-sm">
      {TABS.map(({ label, icon: Icon, authTo, guestTo, exactActive }) => {
        const to = isLoggedIn ? authTo : guestTo;
        return (
          <Link
            key={label}
            to={to}
            activeOptions={{ exact: !!exactActive }}
            className="flex flex-col items-center gap-0.5 py-1 text-ink-mute"
            activeProps={{ className: "!text-deep" }}
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? "text-deep" : "text-ink-mute"} />
                <span className={`text-[8px] font-bold uppercase tracking-[0.5px] ${isActive ? "text-gold" : "text-ink-mute"}`}>
                  {label}
                </span>
                <span className={`mt-0.5 h-1 w-1 rounded-full ${isActive ? "bg-gold" : "bg-transparent"}`} />
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
