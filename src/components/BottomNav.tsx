import { Link } from "@tanstack/react-router";
import { Home, Sparkles, Receipt, MessageCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Tab {
  to: string;
  label: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/inventory", label: "Scoops", icon: Sparkles },
  { to: "/orders", label: "My orders", icon: Receipt },
  { to: "/contact", label: "Contact", icon: MessageCircle },
];

export function BottomNav() {
  return (
    <nav className="grid grid-cols-4 border-t border-line bg-cream/95 px-1 pb-1.5 pt-2.5 backdrop-blur-sm">
      {TABS.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact: to === "/" }}
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
      ))}
    </nav>
  );
}
