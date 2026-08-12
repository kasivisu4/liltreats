import { Link } from "@tanstack/react-router";
import { Home, Sparkles, Receipt, UserCircle } from "lucide-react";

// Cookie auth helper — reads token without any external store
function hasToken(): boolean {
  return document.cookie.split(";").some(c => c.trim().startsWith("lt_token=") && c.split("=")[1]?.length > 0);
}

const TABS = [
  { label: "Home",    icon: Home,        to: "/",          exact: true  },
  { label: "Scoops",  icon: Sparkles,    to: "/inventory", exact: false },
  { label: "Orders",  icon: Receipt,     to: "/orders",    exact: false },
  { label: "Account", icon: UserCircle,  to: "/orders",    exact: false },
];

export function BottomNav() {
  return (
    <nav className="grid grid-cols-4 border-t border-line bg-cream/95 px-1 pb-1.5 pt-2.5 backdrop-blur-sm">
      {TABS.map(({ label, icon: Icon, to, exact }) => (
        <Link
          key={label}
          to={to}
          activeOptions={{ exact }}
          className="flex flex-col items-center gap-0.5 py-1 text-ink-mute"
          activeProps={{ className: "!text-deep" }}
        >
          {({ isActive }) => (
            <>
              <Icon size={20} className={isActive ? "text-deep" : "text-ink-mute"} />
              <span className={`text-[8px] font-bold uppercase tracking-[0.5px] ${isActive ? "text-gold-DEFAULT" : "text-ink-mute"}`}>
                {label}
              </span>
              <span className={`mt-0.5 h-1 w-1 rounded-full ${isActive ? "bg-gold-DEFAULT" : "bg-transparent"}`} />
            </>
          )}
        </Link>
      ))}
    </nav>
  );
}
