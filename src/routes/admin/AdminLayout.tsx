import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingBag,
  CalendarDays,
  Video,
  Package,
  Boxes,
  Users,
  TrendingUp,
  ArrowLeft,
  Menu,
  X,
  BarChart2,
  CreditCard,
  Truck,
  Settings,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  section?: string;
}

const NAV: NavItem[] = [
  { path: "/admin/", label: "Dashboard", icon: LayoutDashboard, section: "Overview" },
  { path: "/admin/orders", label: "Orders", icon: ShoppingBag, section: "Operations" },
  { path: "/admin/scoop-bookings", label: "Scoop Bookings", icon: Package },
  { path: "/admin/video-bookings", label: "Video Bookings", icon: Video },
  { path: "/admin/delivery", label: "Delivery", icon: Truck },
  { path: "/admin/payments", label: "Payments", icon: CreditCard, section: "Finance" },
  { path: "/admin/profit", label: "Profit & Loss", icon: TrendingUp },
  { path: "/admin/reports", label: "Reports", icon: BarChart2 },
  { path: "/admin/inventory", label: "Inventory", icon: Boxes, section: "Catalog" },
  { path: "/admin/products", label: "Products", icon: Package },
  { path: "/admin/scoop-management", label: "Scoop Config", icon: Settings },
  { path: "/admin/customers", label: "Customers", icon: Users, section: "People" },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/admin/" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(path);

  return (
    <div className="flex h-[100dvh] bg-[#F4EDE8] text-ink">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-line bg-[#FBF6F0] md:flex">
        <div className="border-b border-line px-4 py-4">
          <div className="font-serif text-[18px] font-bold text-deep">liltreats</div>
          <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-gold">Admin panel</div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV.map(({ path, label, icon: Icon, section }) => (
            <div key={path}>
              {section && (
                <div className="mb-1 mt-3 px-2 text-[9px] font-bold uppercase tracking-[1.5px] text-ink-mute first:mt-0">
                  {section}
                </div>
              )}
              <button
                onClick={() => navigate({ to: path as "/" })}
                className={`mb-0.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-bold transition-colors ${
                  isActive(path)
                    ? "bg-deep text-cream"
                    : "text-ink-soft hover:bg-white/60 hover:text-deep"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            </div>
          ))}
        </nav>
        <div className="border-t border-line px-4 py-3">
          <button
            onClick={() => navigate({ to: "/" })}
            className="flex w-full items-center gap-2 text-[12px] font-bold text-ink-mute"
          >
            <ArrowLeft size={13} /> Back to store
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-[#FBF6F0]">
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <div>
                <div className="font-serif text-[18px] font-bold text-deep">liltreats</div>
                <div className="text-[10px] font-bold uppercase tracking-[1.5px] text-gold">Admin panel</div>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X size={18} className="text-ink-mute" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-2 py-3">
              {NAV.map(({ path, label, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => { navigate({ to: path as "/" }); setMobileOpen(false); }}
                  className={`mb-0.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-bold transition-colors ${
                    isActive(path)
                      ? "bg-deep text-cream"
                      : "text-ink-soft hover:bg-white/60 hover:text-deep"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </nav>
            <div className="border-t border-line px-4 py-3">
              <button
                onClick={() => navigate({ to: "/" })}
                className="flex w-full items-center gap-2 text-[12px] font-bold text-ink-mute"
              >
                <ArrowLeft size={13} /> Back to store
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-line bg-[#FBF6F0] px-4 py-3 md:hidden">
          <button onClick={() => setMobileOpen(true)}>
            <Menu size={20} className="text-deep" />
          </button>
          <div className="font-serif text-[16px] font-bold text-deep">liltreats admin</div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
