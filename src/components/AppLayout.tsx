import { Outlet, useRouterState } from "@tanstack/react-router";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

// Booking-flow routes hide the bottom nav (they use a back button instead).
const HIDE_NAV_PREFIXES = ["/book", "/cart", "/confirm"];

export function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const showBottomNav = !HIDE_NAV_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <div className="flex h-[100dvh] bg-cream text-ink">
      <Sidebar />
      <div className="flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden">
        <Outlet />
        {showBottomNav && (
          <div className="md:hidden">
            <BottomNav />
          </div>
        )}
      </div>
    </div>
  );
}
