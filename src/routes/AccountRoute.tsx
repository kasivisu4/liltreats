import { useNavigate } from "@tanstack/react-router";
import {
  Receipt,
  CalendarDays,
  MapPin,
  User,
  Bell,
  LogOut,
  ChevronRight,
  Package,
  ShoppingBag,
} from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { MOCK_CUSTOMER } from "../api/mockApi";
import { useOrders, useScoopBookings } from "../api/queries";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-line bg-white/70 px-4 py-3">
      <div className="font-serif text-[22px] font-bold text-deep">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wide text-ink-mute">{label}</div>
    </div>
  );
}

export function AccountRoute() {
  const navigate = useNavigate();
  const { data: orders } = useOrders();
  const { data: bookings } = useScoopBookings();

  const activeOrders = (orders ?? []).filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled",
  ).length;
  const completedOrders = (orders ?? []).filter((o) => o.status === "delivered").length;
  const upcomingVideo = (bookings ?? []).find(
    (b) =>
      b.experience === "with_video" &&
      b.videoDate &&
      b.videoDate >= new Date().toISOString().split("T")[0] &&
      b.status === "confirmed",
  );

  const menuItems = [
    { icon: Receipt, label: "My Orders", sub: `${(orders ?? []).length} total`, to: "/orders" },
    { icon: CalendarDays, label: "My Bookings", sub: `${(bookings ?? []).length} scoops`, to: "/bookings" },
    { icon: ShoppingBag, label: "Shop Individual Items", sub: "Browse our collection", to: "/shop" },
    { icon: Package, label: "Track my Scoop", sub: "Live delivery tracking", to: "/orders" },
    { icon: MapPin, label: "Saved Addresses", sub: `${MOCK_CUSTOMER.addresses.length} address${MOCK_CUSTOMER.addresses.length !== 1 ? "es" : ""}`, to: "#" },
    { icon: User, label: "Profile", sub: "Name, phone, email", to: "#" },
    { icon: Bell, label: "Notifications", sub: "Order & booking alerts", to: "#" },
  ] as const;

  return (
    <Screen top={<TopBar title="My account" />}>
      <div className="p-4">
        {/* Profile header */}
        <div className="mb-5 flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#F2DCE4] to-[#EDE0F4] p-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-deep font-serif text-[20px] font-bold text-cream">
            {MOCK_CUSTOMER.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-serif text-[17px] font-bold text-deep">{MOCK_CUSTOMER.name}</div>
            <div className="text-[12px] font-semibold text-ink-soft">{MOCK_CUSTOMER.phone}</div>
            <div className="text-[11px] font-semibold text-mauve">{MOCK_CUSTOMER.instagram}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          <StatCard label="Orders" value={(orders ?? []).length} />
          <StatCard label="Active" value={activeOrders} />
          <StatCard label="Delivered" value={completedOrders} />
        </div>

        {/* Upcoming video booking highlight */}
        {upcomingVideo && (
          <div className="mb-4 rounded-2xl border border-rose/30 bg-gradient-to-br from-[#FFF8FA] to-[#F9F0F4] p-4">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-rose">
              🎬 Upcoming video booking
            </div>
            <div className="font-serif text-[15px] font-bold text-deep">
              {upcomingVideo.scoopTier.charAt(0).toUpperCase() + upcomingVideo.scoopTier.slice(1)} Scoop
            </div>
            <div className="mt-0.5 text-[12px] font-semibold text-ink-soft">
              {new Date(upcomingVideo.videoDate! + "T00:00:00").toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              {upcomingVideo.videoTime && ` at ${upcomingVideo.videoTime}`}
            </div>
            <div className="mt-1.5 inline-block rounded-full bg-[#D8F0D8] px-2.5 py-0.5 text-[10px] font-bold text-[#2A6030]">
              Confirmed
            </div>
          </div>
        )}

        {/* Spending summary */}
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-gold/30 bg-gold-pale px-4 py-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-gold">Total spent</div>
            <div className="font-serif text-[20px] font-bold text-deep">
              ₹{MOCK_CUSTOMER.totalSpend.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">Member since</div>
            <div className="text-[12px] font-bold text-deep">
              {new Date(MOCK_CUSTOMER.joinedAt).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="card-glass overflow-hidden">
          {menuItems.map(({ icon: Icon, label, sub, to }, i) => (
            <button
              key={label}
              onClick={() => navigate({ to: to as "/" })}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-white/50 ${
                i < menuItems.length - 1 ? "border-b border-line" : ""
              }`}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/70">
                <Icon size={16} className="text-deep" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-bold text-deep">{label}</div>
                <div className="text-[11px] font-semibold text-ink-mute">{sub}</div>
              </div>
              <ChevronRight size={15} className="flex-shrink-0 text-ink-mute" />
            </button>
          ))}
        </div>

        {/* Saved address preview */}
        {MOCK_CUSTOMER.addresses.length > 0 && (
          <div className="mt-4 rounded-2xl border border-line bg-white/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">
                Default address
              </div>
              <span className="rounded-full bg-gold-pale px-2 py-0.5 text-[10px] font-bold text-gold">
                Default
              </span>
            </div>
            {MOCK_CUSTOMER.addresses
              .filter((a) => a.isDefault)
              .map((addr) => (
                <div key={addr.id} className="text-[13px] font-semibold text-deep">
                  <div>{addr.building}</div>
                  <div className="text-ink-soft">
                    {addr.area}, {addr.city} – {addr.pin}
                  </div>
                  <div className="text-[11px] text-ink-mute">{addr.state}</div>
                </div>
              ))}
          </div>
        )}

        {/* Logout */}
        <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#F0C0C0] py-3 text-[13px] font-bold text-[#B02840] transition-colors active:bg-[#FFF0F0]">
          <LogOut size={15} /> Sign out
        </button>
        <div className="h-8" />
      </div>
    </Screen>
  );
}
