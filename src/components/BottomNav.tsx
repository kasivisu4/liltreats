import { Link } from "@tanstack/react-router";
import { Home, Sparkles, Receipt, UserCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuthStore } from "../store/authStore";

interface Tab {
  label: string;
  icon: LucideIcon;
  authTo: string;   // destination when logged in
  guestTo: string;  // destination when logged out
  exactActive?: boolean;
}

const TABS: Tab[] = [
  { label: "Home",    icon: Home,        authTo: "/",        guestTo: "/",       exactActive: true },
  { label: "Scoops",  icon: Sparkles,    authTo: "/inventory", guestTo: "/inventory" },
  { label: "Orders",  icon: Receipt,     authTo: "/orders",  guestTo: "/login"   },
  { label: "Account", icon: UserCircle,  authTo: "/account", guestTo: "/login"   },
];

export function BottomNav() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

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
                <span
                  className={`text-[8px] font-bold uppercase tracking-[0.5px] ${
                    isActive ? "text-gold" : "text-ink-mute"
                  }`}
                >
                  {label}
                </span>
                <span
                  className={`mt-0.5 h-1 w-1 rounded-full ${
                    isActive ? "bg-gold" : "bg-transparent"
                  }`}
                />
              </>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
