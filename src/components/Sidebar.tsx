import { Link, useNavigate } from "@tanstack/react-router";
import { Home, Sparkles, Receipt, MessageCircle, Instagram, UserCircle, LogIn, LogOut, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { _useInlineAuth } from "./BottomNav";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const BASE_NAV: NavItem[] = [
  { to: "/",         label: "Home",              icon: Home,        exact: true },
  { to: "/inventory", label: "This week's scoops", icon: Sparkles },
  { to: "/orders",   label: "My orders",          icon: Receipt },
  { to: "/contact",  label: "Contact",            icon: MessageCircle },
];

const IG_URL = "https://www.instagram.com/_liltreats_/";

export function Sidebar() {
  const { isLoggedIn, role } = _useInlineAuth();
  const navigate = useNavigate();

  function handleLogout() {
    // Clear persisted auth state and cookie
    _useInlineAuth.setState({ isLoggedIn: false, role: null });
    document.cookie = "lt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    navigate({ to: "/" });
  }

  const NAV: NavItem[] = [
    ...BASE_NAV,
    ...(isLoggedIn
      ? [{ to: "/account", label: "My account", icon: UserCircle }]
      : [{ to: "/login", label: "Sign in", icon: LogIn }]),
    ...(role === "admin"
      ? [{ to: "/admin", label: "Admin panel", icon: ShieldCheck }]
      : []),
  ];

  return (
    <aside className="hidden h-[100dvh] w-64 shrink-0 flex-col border-r border-line bg-cream/70 px-5 py-7 md:flex lg:w-72">
      <div className="mb-9 px-2">
        <div className="font-serif text-[26px] font-semibold leading-none text-deep">liltreats</div>
        <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[2px] text-gold">mystery scoops</div>
      </div>

      <nav className="flex flex-col gap-1.5">
        {NAV.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: !!exact }}
            className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[14px] font-bold text-ink-soft transition-colors hover:bg-white/60"
            activeProps={{ className: "!bg-white !text-deep shadow-soft" }}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="mt-1 flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[14px] font-bold text-ink-soft transition-colors hover:bg-white/60 hover:text-deep"
          >
            <LogOut size={20} />
            Sign out
          </button>
        )}
      </nav>

      <a
        href={IG_URL}
        target="_blank"
        rel="noreferrer"
        className="mt-auto rounded-2xl border border-lav-deep/40 bg-lav p-4"
      >
        <div className="mb-1 font-serif text-[14px] font-semibold text-lav-deep">Never miss a drop</div>
        <div className="mb-2.5 text-[11px] font-semibold leading-snug text-lav-deep/80">New scoops every Monday on Instagram.</div>
        <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-lav-deep py-2.5 text-[12px] font-bold text-white">
          <Instagram size={15} /> @_liltreats_
        </span>
      </a>
    </aside>
  );
}
