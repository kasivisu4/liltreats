import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
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
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Star,
} from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { useAuthStore, type AuthUser } from "../store/authStore";
import { useOrders, useScoopBookings } from "../api/queries";
import type { Address } from "../api/mockApi";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-views
// ─────────────────────────────────────────────────────────────────────────────

type SubView = "main" | "profile" | "addresses" | "notifications";

// ── Profile edit ──────────────────────────────────────────────────────────────

function ProfileEdit({ user, onBack }: { user: AuthUser; onBack: () => void }) {
  const { updateProfile } = useAuthStore();
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone,
    email: user.email,
    instagram: user.instagram,
  });
  const [saved, setSaved] = useState(false);

  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleSave() {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => { setSaved(false); onBack(); }, 700);
  }

  return (
    <div className="px-5 pb-10 pt-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-[18px] font-bold text-deep">Edit profile</h2>
        <button onClick={onBack} className="text-ink-mute">
          <X size={20} />
        </button>
      </div>

      {/* Avatar */}
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#F2DCE4] to-[#EDE0F4] font-serif text-[30px] font-bold text-deep shadow-glow">
            {form.name.charAt(0).toUpperCase()}
          </div>
          <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-deep text-white shadow">
            <Pencil size={12} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="field-label">Full name</label>
          <input value={form.name} onChange={upd("name")} className="field-input" placeholder="Your name" />
        </div>
        <div>
          <label className="field-label">WhatsApp / Phone</label>
          <input type="tel" value={form.phone} onChange={upd("phone")} className="field-input" placeholder="+91 98765 43210" />
        </div>
        <div>
          <label className="field-label">Email address</label>
          <input type="email" value={form.email} onChange={upd("email")} className="field-input" placeholder="your@email.com" />
        </div>
        <div>
          <label className="field-label">Instagram handle</label>
          <input value={form.instagram} onChange={upd("instagram")} className="field-input" placeholder="@yourhandle" />
        </div>
      </div>

      <button
        onClick={handleSave}
        className={`btn-main mt-6 flex w-full items-center justify-center gap-2 transition-all ${saved ? "bg-[#2A6030]" : ""}`}
      >
        {saved ? <><Check size={16} /> Saved!</> : "Save changes"}
      </button>
    </div>
  );
}

// ── Address management ────────────────────────────────────────────────────────

const CITY_DEFAULT = "Hyderabad";
const STATE_DEFAULT = "Telangana";

const EMPTY_ADDR: Omit<Address, "id"> = {
  label: "Home",
  building: "",
  area: "",
  city: CITY_DEFAULT,
  state: STATE_DEFAULT,
  pin: "",
  isDefault: false,
};

function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Omit<Address, "id">;
  onSave: (addr: Omit<Address, "id">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const upd = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const canSave = form.building.trim() && form.area.trim() && form.pin.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-line bg-white/80 p-4"
    >
      <div className="mb-3 grid grid-cols-3 gap-1.5">
        {["Home", "Work", "Other"].map((l) => (
          <button
            key={l}
            onClick={() => setForm((f) => ({ ...f, label: l }))}
            className={`rounded-lg py-1.5 text-[12px] font-bold transition-all ${
              form.label === l ? "bg-deep text-white" : "border border-line bg-white/60 text-ink-soft"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
      <div className="space-y-2.5">
        <div>
          <label className="field-label">House / Flat / Building</label>
          <input value={form.building} onChange={upd("building")} className="field-input" placeholder="Flat 402, Serene Residency" />
        </div>
        <div>
          <label className="field-label">Area / Locality</label>
          <input value={form.area} onChange={upd("area")} className="field-input" placeholder="Banjara Hills" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="field-label">City</label>
            <input value={form.city} onChange={upd("city")} className="field-input" placeholder="Hyderabad" />
          </div>
          <div>
            <label className="field-label">Pincode</label>
            <input value={form.pin} onChange={upd("pin")} className="field-input" placeholder="500034" maxLength={6} />
          </div>
        </div>
        <div>
          <label className="field-label">State</label>
          <input value={form.state} onChange={upd("state")} className="field-input" placeholder="Telangana" />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-[12px] font-bold text-deep">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
            className="accent-deep"
          />
          Set as default address
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onSave(form)}
          disabled={!canSave}
          className="flex-1 rounded-xl bg-deep py-2.5 text-[13px] font-bold text-white disabled:opacity-40"
        >
          Save address
        </button>
        <button
          onClick={onCancel}
          className="rounded-xl border border-line px-4 py-2.5 text-[13px] font-bold text-ink-soft"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}

function AddressManager({ user, onBack }: { user: AuthUser; onBack: () => void }) {
  const { addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuthStore();
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  return (
    <div className="px-5 pb-10 pt-4">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-[18px] font-bold text-deep">Saved addresses</h2>
        <button onClick={onBack} className="text-ink-mute">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {user.addresses.map((addr) =>
          editId === addr.id ? (
            <AddressForm
              key={addr.id}
              initial={addr}
              onSave={(updated) => {
                updateAddress(addr.id, updated);
                if (updated.isDefault) setDefaultAddress(addr.id);
                setEditId(null);
              }}
              onCancel={() => setEditId(null)}
            />
          ) : (
            <motion.div
              key={addr.id}
              layout
              className={`rounded-2xl border p-4 ${
                addr.isDefault ? "border-gold/40 bg-gold-pale/60" : "border-line bg-white/60"
              }`}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-bold text-deep shadow-sm">
                  {addr.label}
                </span>
                {addr.isDefault && (
                  <span className="flex items-center gap-1 rounded-full bg-gold-pale px-2 py-0.5 text-[10px] font-bold text-gold">
                    <Star size={9} fill="currentColor" /> Default
                  </span>
                )}
              </div>
              <p className="text-[13px] font-semibold text-deep">{addr.building}</p>
              <p className="text-[12px] text-ink-soft">
                {addr.area}, {addr.city} – {addr.pin}
              </p>
              <p className="text-[11px] text-ink-mute">{addr.state}</p>

              <div className="mt-3 flex items-center gap-2">
                {!addr.isDefault && (
                  <button
                    onClick={() => setDefaultAddress(addr.id)}
                    className="rounded-lg border border-line bg-white/70 px-3 py-1.5 text-[11px] font-bold text-deep"
                  >
                    Set as default
                  </button>
                )}
                <button
                  onClick={() => setEditId(addr.id)}
                  className="ml-auto rounded-lg border border-line bg-white/70 p-1.5 text-ink-soft"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => deleteAddress(addr.id)}
                  className="rounded-lg border border-[#F0C0C0] bg-[#FFF4F6] p-1.5 text-[#B02840]"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ),
        )}

        {user.addresses.length === 0 && !adding && (
          <div className="rounded-2xl border border-dashed border-line bg-white/40 p-8 text-center">
            <MapPin size={28} className="mx-auto mb-2 text-ink-mute" />
            <p className="text-[13px] font-semibold text-ink-soft">No saved addresses yet</p>
          </div>
        )}

        {adding ? (
          <AddressForm
            initial={{ ...EMPTY_ADDR }}
            onSave={(addr) => { addAddress(addr); setAdding(false); }}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-deep/30 py-3.5 text-[13px] font-bold text-deep"
          >
            <Plus size={16} /> Add new address
          </button>
        )}
      </div>
    </div>
  );
}

// ── Notifications placeholder ─────────────────────────────────────────────────

const MOCK_NOTIFICATIONS = [
  {
    id: "n1",
    icon: "✅",
    title: "Order confirmed",
    body: "Your Magic Scoop (LT-2026-00042) has been confirmed.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "n2",
    icon: "🎬",
    title: "Video booking confirmed",
    body: "Your video slot is locked in. We'll tag you on the day!",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "n3",
    icon: "📦",
    title: "Order delivered",
    body: "Your Mini Scoop (LT-2026-00031) has been delivered. Enjoy!",
    time: "8 days ago",
    read: true,
  },
];

function NotificationList({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);

  return (
    <div className="px-5 pb-10 pt-4">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-[18px] font-bold text-deep">Notifications</h2>
        <button onClick={onBack} className="text-ink-mute">
          <X size={20} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="mt-16 text-center text-[13px] font-semibold text-ink-mute">
          <Bell size={32} className="mx-auto mb-3 text-ink-mute/40" />
          No notifications yet
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                n.read ? "border-line bg-white/40" : "border-rose/20 bg-gradient-to-br from-[#FFF8FA] to-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-[22px]">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-deep">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-rose flex-shrink-0" />}
                  </div>
                  <p className="mt-0.5 text-[12px] font-semibold leading-relaxed text-ink-soft">{n.body}</p>
                  <p className="mt-1 text-[11px] font-semibold text-ink-mute">{n.time}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-line bg-white/70 px-4 py-3">
      <div className="font-serif text-[22px] font-bold text-deep">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wide text-ink-mute">{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AccountRoute
// ─────────────────────────────────────────────────────────────────────────────

export function AccountRoute() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuthStore();
  const { data: orders } = useOrders();
  const { data: bookings } = useScoopBookings();
  const [subView, setSubView] = useState<SubView>("main");

  // If not logged in, redirect to login
  if (!isLoggedIn || !user) {
    return (
      <Screen top={<TopBar title="My account" />}>
        <div className="flex flex-col items-center px-6 pt-24 text-center">
          <div className="mb-4 text-[48px]">🎀</div>
          <h2 className="mb-2 font-serif text-[22px] font-bold text-deep">Sign in to your account</h2>
          <p className="mb-6 text-[13px] font-semibold leading-relaxed text-ink-soft">
            Track your scoops, manage bookings, and view your order history — all in one place.
          </p>
          <button
            onClick={() => navigate({ to: "/login" })}
            className="btn-main w-full max-w-xs"
          >
            Sign in / Create account
          </button>
        </div>
      </Screen>
    );
  }

  // Sub-views
  if (subView === "profile") {
    return (
      <Screen top={<TopBar title="Edit profile" showBack />}>
        <ProfileEdit user={user} onBack={() => setSubView("main")} />
      </Screen>
    );
  }
  if (subView === "addresses") {
    return (
      <Screen top={<TopBar title="Saved addresses" showBack />}>
        <AddressManager user={user} onBack={() => setSubView("main")} />
      </Screen>
    );
  }
  if (subView === "notifications") {
    return (
      <Screen top={<TopBar title="Notifications" showBack />}>
        <NotificationList onBack={() => setSubView("main")} />
      </Screen>
    );
  }

  // ── Main dashboard ──────────────────────────────────────────────────────────

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

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  const menuItems = [
    {
      icon: Receipt,
      label: "My Orders",
      sub: `${(orders ?? []).length} total`,
      action: () => navigate({ to: "/orders" }),
    },
    {
      icon: CalendarDays,
      label: "My Bookings",
      sub: `${(bookings ?? []).length} scoops`,
      action: () => navigate({ to: "/bookings" }),
    },
    {
      icon: ShoppingBag,
      label: "Shop Individual Items",
      sub: "Browse our collection",
      action: () => navigate({ to: "/shop" }),
    },
    {
      icon: Package,
      label: "Track my Scoop",
      sub: "Live delivery tracking",
      action: () => navigate({ to: "/orders" }),
    },
    {
      icon: MapPin,
      label: "Saved Addresses",
      sub: `${user.addresses.length} address${user.addresses.length !== 1 ? "es" : ""}`,
      action: () => setSubView("addresses"),
    },
    {
      icon: User,
      label: "Profile",
      sub: "Name, phone, email",
      action: () => setSubView("profile"),
    },
    {
      icon: Bell,
      label: "Notifications",
      sub: unreadCount > 0 ? `${unreadCount} unread` : "All caught up",
      badge: unreadCount > 0 ? unreadCount : undefined,
      action: () => setSubView("notifications"),
    },
  ] as const;

  return (
    <Screen top={<TopBar title="My account" />}>
      <div className="p-4">
        {/* Profile header */}
        <div className="mb-5 flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#F2DCE4] to-[#EDE0F4] p-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-deep font-serif text-[20px] font-bold text-cream shadow">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-serif text-[17px] font-bold text-deep">{user.name}</div>
            <div className="text-[12px] font-semibold text-ink-soft">{user.phone}</div>
            {user.instagram && (
              <div className="text-[11px] font-semibold text-mauve">{user.instagram}</div>
            )}
          </div>
          <button
            onClick={() => setSubView("profile")}
            className="rounded-xl border border-white/60 bg-white/60 p-2 shadow-sm"
          >
            <Pencil size={14} className="text-deep" />
          </button>
        </div>

        {/* Stats */}
        <div className="mb-5 grid grid-cols-3 gap-2">
          <StatCard label="Orders" value={(orders ?? []).length} />
          <StatCard label="Active" value={activeOrders} />
          <StatCard label="Delivered" value={completedOrders} />
        </div>

        {/* Upcoming video booking */}
        {upcomingVideo && (
          <div className="mb-4 rounded-2xl border border-rose/30 bg-gradient-to-br from-[#FFF8FA] to-[#F9F0F4] p-4">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-rose">
              🎬 Upcoming video booking
            </div>
            <div className="font-serif text-[15px] font-bold text-deep">
              {upcomingVideo.scoopTier.charAt(0).toUpperCase() + upcomingVideo.scoopTier.slice(1)}{" "}
              Scoop
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
            <div className="text-[11px] font-bold uppercase tracking-wide text-gold">
              Total spent
            </div>
            <div className="font-serif text-[20px] font-bold text-deep">
              ₹{user.totalSpend.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">
              Member since
            </div>
            <div className="text-[12px] font-bold text-deep">
              {new Date(user.joinedAt).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="card-glass overflow-hidden">
          {menuItems.map(({ icon: Icon, label, sub, action, ...rest }, i) => {
            const badge = "badge" in rest ? (rest as { badge?: number }).badge : undefined;
            return (
              <button
                key={label}
                onClick={action}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-white/50 ${
                  i < menuItems.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/70">
                  <Icon size={16} className="text-deep" />
                  {badge !== undefined && badge > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose text-[9px] font-bold text-white">
                      {badge}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-deep">{label}</div>
                  <div className="text-[11px] font-semibold text-ink-mute">{sub}</div>
                </div>
                <ChevronRight size={15} className="flex-shrink-0 text-ink-mute" />
              </button>
            );
          })}
        </div>

        {/* Default address preview */}
        {user.addresses.length > 0 && (
          <div className="mt-4 rounded-2xl border border-line bg-white/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">
                Default address
              </div>
              <button
                onClick={() => setSubView("addresses")}
                className="text-[11px] font-bold text-deep"
              >
                Manage
              </button>
            </div>
            {user.addresses
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
        <button
          onClick={() => { logout(); navigate({ to: "/" }); }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#F0C0C0] py-3 text-[13px] font-bold text-[#B02840] transition-colors active:bg-[#FFF0F0]"
        >
          <LogOut size={15} /> Sign out
        </button>
        <div className="h-8" />
      </div>
    </Screen>
  );
}
