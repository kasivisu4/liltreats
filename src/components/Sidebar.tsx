import { Link } from "@tanstack/react-router";
import { Home, Sparkles, ShoppingBag, Receipt, MessageCircle, Instagram, UserCircle } from "lucide-react";

const NAV = [
  { to: "/",          label: "Home",               icon: Home,          exact: true  },
  { to: "/inventory", label: "This week's scoops", icon: Sparkles,      exact: false },
  { to: "/shop",      label: "Shop items",         icon: ShoppingBag,   exact: false },
  { to: "/orders",    label: "Orders & Account",   icon: UserCircle,    exact: false },
  { to: "/contact",   label: "Contact",            icon: MessageCircle, exact: false },
];

const IG_URL = "https://www.instagram.com/_liltreats_/";

export function Sidebar() {
  return (
    <aside className="hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-line bg-cream/70 px-5 py-7 md:flex lg:w-72">
      <div className="mb-9 px-2">
        <div className="font-serif text-[26px] font-semibold leading-none text-deep">liltreats</div>
        <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[2px] text-gold-DEFAULT">mystery scoops</div>
      </div>

      <nav className="flex flex-col gap-1.5">
        {NAV.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={label}
            to={to}
            activeOptions={{ exact }}
            className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[14px] font-bold text-ink-soft transition-colors hover:bg-white/60"
            activeProps={{ className: "!bg-white !text-deep shadow-sm" }}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>

      <a
        href={IG_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-auto rounded-2xl border border-lav-DEFAULT/40 bg-lav-DEFAULT/20 p-4"
      >
        <div className="mb-1 font-serif text-[14px] font-semibold text-deep">Never miss a drop</div>
        <div className="mb-2.5 text-[11px] font-semibold leading-snug text-ink-soft">New scoops every Monday on Instagram.</div>
        <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-deep py-2.5 text-[12px] font-bold text-white">
          <Instagram size={15} /> @_liltreats_
        </span>
      </a>
    </aside>
  );
}
