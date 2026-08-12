import { useState, useEffect } from "react";
import { Receipt, Truck, ExternalLink, Eye, EyeOff, LogOut, User, LayoutDashboard, Package, Users, Video, ChevronDown, ChevronUp, TrendingUp, AlertTriangle, Plus, Minus, Check, Settings, Globe, Bell, Layers, Trash2, Edit3, X, Save } from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { useOrders, useAllOrders, useDashboardStats, useAllInventoryItems, useCustomers, useUpdateOrderStatus, useUpdateDelivery, useAllScoopBookings, useAddStock, useAdjustStock, useBlockVideoSlot } from "../api/queries";
import type { Order, OrderStatus, IndividualItem, Customer, VideoSlot } from "../api/mockApi";
import { videoSlots as _videoSlots, individualItems as _allProducts } from "../api/mockApi";

// ── Inline auth (cookie-backed, no external store needed) ────────────────────
function getToken(): string { return document.cookie.split(";").map(c => c.trim()).find(c => c.startsWith("lt_token="))?.split("=")[1] ?? ""; }
function setToken(t: string) { document.cookie = `lt_token=${t}; path=/; SameSite=Lax`; }
function clearToken() { document.cookie = "lt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"; }
function parseJwt(token: string): { name?: string; email?: string; role?: string } | null {
  try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; }
}

// ── Login / Signup panel ─────────────────────────────────────────────────────
function AuthPanel({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError(""); setLoading(true);
    try {
      const body = mode === "login" ? { email, password } : { name, email, password };
      const res = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setToken(data.token);
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  function fillDemo(e: string, p: string) { setEmail(e); setPassword(p); }

  return (
    <Screen top={<TopBar title={mode === "login" ? "Sign in" : "Create account"} />}>
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          <div className="mb-7 text-center">
            <div className="font-serif text-[28px] font-semibold text-deep">liltreats</div>
            <div className="mt-1 text-[11px] font-bold uppercase tracking-widest text-gold">mystery scoops</div>
            <p className="mt-3 text-[13px] font-semibold text-ink-soft">
              {mode === "login" ? "Welcome back! Sign in to see your orders." : "Create your account to start shopping."}
            </p>
          </div>

          <div className="card-glass space-y-3.5 p-5">
            {mode === "signup" && (
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-mute">Full name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className="w-full rounded-xl border border-line bg-white/70 px-3.5 py-2.5 text-[14px] font-semibold text-deep outline-none focus:border-rose focus:ring-1 focus:ring-rose/20" />
              </div>
            )}
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-mute">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@email.com" className="w-full rounded-xl border border-line bg-white/70 px-3.5 py-2.5 text-[14px] font-semibold text-deep outline-none focus:border-rose focus:ring-1 focus:ring-rose/20" />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-ink-mute">Password</label>
              <div className="relative">
                <input value={password} onChange={e => setPassword(e.target.value)} type={show ? "text" : "password"} placeholder="Password" onKeyDown={e => e.key === "Enter" && submit()} className="w-full rounded-xl border border-line bg-white/70 px-3.5 py-2.5 pr-10 text-[14px] font-semibold text-deep outline-none focus:border-rose focus:ring-1 focus:ring-rose/20" />
                <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute">{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>

            {error && <p className="rounded-xl bg-rose/10 px-3 py-2 text-[12px] font-bold text-rose">{error}</p>}

            <button onClick={submit} disabled={loading} className="btn-primary w-full py-3 text-[14px]">
              {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>

            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} className="w-full text-center text-[12px] font-bold text-ink-soft underline underline-offset-2">
              {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          </div>

          {mode === "login" && (
            <div className="mt-4 rounded-2xl border border-lav-DEFAULT/40 bg-lav-DEFAULT/20 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-mute">Demo accounts</p>
              <div className="flex gap-2">
                <button onClick={() => fillDemo("customer@liltreats.com", "Customer@123")} className="flex-1 rounded-xl border border-line bg-white/60 py-2 text-[11px] font-bold text-deep">
                  👤 Customer
                </button>
                <button onClick={() => fillDemo("admin@liltreats.com", "Admin@123")} className="flex-1 rounded-xl border border-line bg-white/60 py-2 text-[11px] font-bold text-deep">
                  🛡 Admin
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] text-ink-mute">Tap to fill credentials, then sign in</p>
            </div>
          )}
        </div>
      </div>
    </Screen>
  );
}

// ── Account panel ────────────────────────────────────────────────────────────
function AccountPanel({ onLogout }: { onLogout: () => void }) {
  const token = getToken();
  const user = parseJwt(token);
  return (
    <Screen top={<TopBar title="My account" />}>
      <div className="p-5">
        <div className="card-glass mb-4 flex items-center gap-4 p-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose/20">
            <User size={28} className="text-rose" />
          </div>
          <div>
            <div className="font-serif text-[18px] font-semibold text-deep">{user?.name ?? "User"}</div>
            <div className="text-[12px] font-semibold text-ink-soft">{user?.email}</div>
            <span className="mt-1 inline-block rounded-lg bg-lav-DEFAULT/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-deep">
              {user?.role ?? "customer"}
            </span>
          </div>
        </div>
        <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose/30 bg-rose/10 py-3.5 text-[14px] font-bold text-rose">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </Screen>
  );
}

// ── Orders list ──────────────────────────────────────────────────────────────
const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "confirmed", label: "Order confirmed" },
  { key: "preparing", label: "Preparing your scoop" },
  { key: "packed", label: "Packed & ready" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  confirmed: 0, preparing: 1, packed: 2, shipped: 3, out_for_delivery: 4, delivered: 5, cancelled: -1,
};

const STATUS_BADGE: Record<OrderStatus, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "bg-lav-DEFAULT text-deep" },
  preparing: { label: "Preparing", cls: "bg-[#FFF0D0] text-[#8A5000]" },
  packed: { label: "Packed", cls: "bg-[#E0F0FF] text-[#1A4080]" },
  shipped: { label: "Shipped", cls: "bg-[#E0EEFF] text-[#1A4080]" },
  out_for_delivery: { label: "Out for delivery", cls: "bg-[#FFF0D0] text-[#8A4000]" },
  delivered: { label: "Delivered ✓", cls: "bg-[#D8F0D8] text-[#2A6030]" },
  cancelled: { label: "Cancelled", cls: "bg-[#FFE8E8] text-[#B02840]" },
};

const PAYMENT_BADGE: Record<string, { label: string; cls: string }> = {
  successful: { label: "Paid", cls: "text-[#2A6030]" },
  pending: { label: "Pending", cls: "text-[#8A5000]" },
  failed: { label: "Failed", cls: "text-[#B02840]" },
  refunded: { label: "Refunded", cls: "text-[#1A4080]" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const current = STATUS_INDEX[order.status];
  const delivered = order.status === "delivered";
  const cancelled = order.status === "cancelled";
  const badge = STATUS_BADGE[order.status];
  const payBadge = PAYMENT_BADGE[order.paymentStatus] ?? PAYMENT_BADGE.pending;

  return (
    <div className="card-glass mb-3 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="flex w-full items-center gap-2.5 p-4 text-left">
        <span className="text-[26px]">{order.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="font-serif text-[14px] font-semibold text-deep">{order.tierName}</div>
          <div className="mt-0.5 text-[11px] font-semibold text-ink-mute">{fmtDate(order.placedAt)} · {order.id}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-[10px] px-2.5 py-1 text-[10px] font-bold ${badge.cls}`}>{badge.label}</span>
          <span className={`text-[10px] font-bold ${payBadge.cls}`}>{payBadge.label}</span>
        </div>
      </button>

      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
        {order.itemsPreview.map((p) => (
          <span key={p} className="rounded-lg border border-[#E0A8B8] bg-blush px-2 py-[3px] text-[10px] font-bold text-deep">{p}</span>
        ))}
        {order.videoAddon && <span className="rounded-lg border border-gold-DEFAULT/40 bg-gold-DEFAULT/10 px-2 py-[3px] text-[10px] font-bold text-gold-DEFAULT">🎬 Video</span>}
      </div>

      {expanded && (
        <div className="border-t border-line px-4 pb-4 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-ink-soft">Total paid</span>
            <span className="font-serif text-[16px] font-bold text-deep">₹{order.total.toLocaleString("en-IN")}</span>
          </div>
          {order.trackingNumber && (
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-[#B0D8E8] bg-[#E8F4F8] px-3 py-2.5">
              <Truck size={16} className="flex-shrink-0 text-[#1A5080]" />
              <div className="flex-1">
                <div className="text-[11px] font-bold text-[#1A5080]">{order.courier}</div>
                <div className="text-[12px] font-bold text-deep">{order.trackingNumber}</div>
              </div>
              {order.trackingUrl && (
                <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 rounded-lg bg-[#1A5080] px-2.5 py-1.5 text-[11px] font-bold text-white">
                  Track <ExternalLink size={10} />
                </a>
              )}
            </div>
          )}
          {!cancelled ? (
            <div className={`rounded-xl p-3 ${delivered ? "bg-[#EAF4EA]" : "bg-white/50"}`}>
              {STATUS_STEPS.filter(s => s.key !== "cancelled").map((step, i) => {
                const done = i <= current || delivered;
                const active = i === current && !delivered;
                return (
                  <div key={step.key} className="mb-1.5 flex items-center gap-2 last:mb-0">
                    <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${done ? "bg-sage-DEFAULT" : active ? "animate-pulse bg-gold-DEFAULT" : "bg-[#D8C8C8]"}`} />
                    <span className={`text-[12px] font-semibold ${done ? "text-sage-DEFAULT" : active ? "text-gold-DEFAULT" : "text-ink-mute"}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl bg-[#FFE8E8] px-3 py-3 text-center text-[12px] font-bold text-[#B02840]">Order cancelled</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Admin dashboard ───────────────────────────────────────────────────────────
type AdminTab = "dashboard" | "orders" | "inventory" | "customers" | "bookings" | "scoops" | "slots" | "cms" | "notifications";

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white/70 p-3.5">
      <div className={`font-serif text-[22px] font-extrabold ${color ?? "text-deep"}`}>{value}</div>
      <div className="mt-0.5 text-[11px] font-bold text-deep">{label}</div>
      {sub && <div className="mt-0.5 text-[10px] font-semibold text-ink-mute">{sub}</div>}
    </div>
  );
}

function AdminPanel({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const { data: stats } = useDashboardStats();
  const { data: allOrders = [] } = useAllOrders();
  const { data: allItems = [] } = useAllInventoryItems();
  const { data: customers = [] } = useCustomers();
  const { data: bookings = [] } = useAllScoopBookings();
  const updateStatus = useUpdateOrderStatus();
  const updateDelivery = useUpdateDelivery();
  const addStock = useAddStock();
  const adjustStock = useAdjustStock();
  const blockSlot = useBlockVideoSlot();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [courierInput, setCourierInput] = useState<Record<string, { courier: string; tracking: string; url: string }>>({});
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [addQty, setAddQty] = useState("1");
  const [adjustQty, setAdjustQty] = useState("");

  // ── Module 19: Scoop mappings (in-memory for session) ──
  type ScoopMapping = { productId: string; productName: string; qty: number };
  const SCOOP_TIERS = [
    { id: "mini", name: "Mini Scoop", price: 499, icon: "🌿" },
    { id: "magic", name: "Magic Scoop", price: 899, icon: "✨" },
    { id: "premium", name: "Premium Scoop", price: 1099, icon: "👑" },
  ];
  const [scoopMappings, setScoopMappings] = useState<Record<string, ScoopMapping[]>>({
    mini: [
      { productId: "p14", productName: "Holographic sticker sheet", qty: 2 },
      { productId: "p12", productName: "Crystal nail charms", qty: 1 },
      { productId: "p10", productName: "Tinted lip balm", qty: 1 },
    ],
    magic: [
      { productId: "p01", productName: "Pearl drop earrings", qty: 1 },
      { productId: "p04", productName: "Hair bow clips", qty: 1 },
      { productId: "p11", productName: "Mini perfume vial", qty: 1 },
      { productId: "p15", productName: "Crystal pocket stone", qty: 1 },
    ],
    premium: [
      { productId: "p01", productName: "Pearl drop earrings", qty: 1 },
      { productId: "p02", productName: "Charm bracelet", qty: 1 },
      { productId: "p07", productName: "Celestial phone charm", qty: 1 },
      { productId: "p08", productName: "Mini tote bag", qty: 1 },
      { productId: "p18", productName: "Scented candle", qty: 1 },
    ],
  });
  const [activeScoopTier, setActiveScoopTier] = useState("magic");
  const [addProductId, setAddProductId] = useState("");
  const [addProductQty, setAddProductQty] = useState("1");
  const [scoopSaved, setScoopSaved] = useState(false);

  // ── Module 25: Video slot config ──
  const [liveSlots, setLiveSlots] = useState<VideoSlot[]>(() => [..._videoSlots]);
  const [newSlotDate, setNewSlotDate] = useState("");
  const [newSlotTime, setNewSlotTime] = useState("10:00 AM");
  const [slotViewDate, setSlotViewDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 5);
    return d.toISOString().split("T")[0];
  });
  const [videoConfig, setVideoConfig] = useState({ leadDays: 5, windowDays: 30, maxPerDay: 2 });
  const [configSaved, setConfigSaved] = useState(false);

  // ── Module 26: CMS ──
  type CmsSection = "home" | "about" | "contact" | "faq";
  const [cmsTab, setCmsTab] = useState<CmsSection>("home");
  const [cmsData, setCmsData] = useState({
    home: { headline: "Your Mystery Scoop. Your Surprise. Your LilTreat!", subtext: "Curated mystery boxes of jewellery, accessories & trinkets — delivered to your door.", ctaPrimary: "Explore Scoops", ctaSecondary: "Shop Individual Items", announcement: "" },
    about: { story: "LilTreats started as a passion project in 2024 — we believe that the best gifts are the ones that surprise you.", mission: "Bringing joy through curated mystery scoops of handpicked accessories and trinkets.", instagram: "@_liltreats_" },
    contact: { whatsapp: "+910000000000", instagram: "@_liltreats_", phone: "+910000000000", replyTime: "a few hours" },
    faq: [] as { id: string; q: string; a: string }[],
  });
  const [editingFaq, setEditingFaq] = useState<string | null>(null);
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");
  const [cmsSaved, setCmsSaved] = useState<CmsSection | null>(null);

  // ── Modules 27/28: Notifications ──
  type Notif = { id: string; type: "customer" | "admin"; title: string; message: string; isRead: boolean; createdAt: string };
  const [notifications, setNotifications] = useState<Notif[]>([
    { id: "n01", type: "admin", title: "New order placed", message: "LT-2026-00042 · Magic Scoop + Video · ₹1,058 from Priya Sharma", isRead: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: "n02", type: "admin", title: "Low stock alert", message: "Charm bracelet (JWL-002) — only 4 units remaining. Minimum is 5.", isRead: false, createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    { id: "n03", type: "admin", title: "New video booking", message: "BKG-042 · Magic Scoop video on +8 days at 11:00 AM", isRead: true, createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
    { id: "n04", type: "admin", title: "Out of stock", message: "No items currently at 0 stock. Great work!", isRead: true, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: "n05", type: "customer", title: "Order confirmed", message: "Your Magic Scoop order LT-2026-00042 is confirmed and being prepared!", isRead: false, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: "n06", type: "customer", title: "Video booking confirmed", message: "Your video session is booked! See you on your selected date at 11:00 AM.", isRead: true, createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: "n07", type: "customer", title: "Order preparing", message: "We're packing your Mini Scoop order LT-2026-00031. Almost ready!", isRead: true, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
  ]);
  const [notifFilter, setNotifFilter] = useState<"all" | "admin" | "customer">("all");

  const ADMIN_TABS: { id: AdminTab; icon: typeof LayoutDashboard; label: string }[] = [
    { id: "dashboard", icon: LayoutDashboard, label: "Stats" },
    { id: "orders", icon: Receipt, label: "Orders" },
    { id: "inventory", icon: Package, label: "Stock" },
    { id: "customers", icon: Users, label: "Customers" },
    { id: "bookings", icon: Video, label: "Videos" },
    { id: "scoops", icon: Layers, label: "Scoops" },
    { id: "slots", icon: Settings, label: "Slots" },
    { id: "cms", icon: Globe, label: "CMS" },
    { id: "notifications", icon: Bell, label: "Alerts" },
  ];

  const ALL_STATUSES: OrderStatus[] = ["confirmed", "preparing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"];

  return (
    <Screen top={
      <div className="flex items-center gap-2 border-b border-line bg-cream/95 px-4 py-3">
        <button onClick={onBack} className="rounded-xl border border-line bg-white/70 px-3 py-1.5 text-[11px] font-bold text-ink-soft">← Back</button>
        <span className="font-serif text-[16px] font-bold text-deep">Admin Panel</span>
        <span className="ml-auto rounded-lg bg-rose/10 px-2 py-0.5 text-[10px] font-bold text-rose">Admin</span>
      </div>
    }>
      {/* Tab bar */}
      <div className="no-scrollbar flex gap-0 overflow-x-auto border-b border-line bg-white/60">
        {ADMIN_TABS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex flex-1 flex-col items-center gap-0.5 px-2 py-2.5 text-[9px] font-bold uppercase tracking-wide transition-colors ${tab === id ? "border-b-2 border-gold text-deep" : "border-b-2 border-transparent text-ink-mute"}`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* ── Dashboard ── */}
        {tab === "dashboard" && stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard label="Today's sales" value={`₹${stats.todaySales.toLocaleString("en-IN")}`} sub={`${stats.todayOrders} orders`} color="text-gold" />
              <StatCard label="Monthly sales" value={`₹${stats.monthlySales.toLocaleString("en-IN")}`} />
              <StatCard label="Today's profit" value={`₹${stats.todayProfit.toLocaleString("en-IN")}`} color="text-sage-DEFAULT" />
              <StatCard label="Monthly profit" value={`₹${stats.monthlyProfit.toLocaleString("en-IN")}`} color="text-sage-DEFAULT" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Pending" value={stats.pendingOrders} color="text-[#C06820]" />
              <StatCard label="Processing" value={stats.processingOrders} />
              <StatCard label="Delivered" value={stats.deliveredOrders} color="text-sage-DEFAULT" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatCard label="Total items" value={stats.totalItems} />
              <StatCard label="Low stock" value={stats.lowStockItems} color="text-[#C06820]" />
              <StatCard label="Out of stock" value={stats.outOfStockItems} color="text-rose" />
            </div>
            <div className="rounded-2xl border border-gold-light bg-gold-pale px-4 py-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-gold" />
                <span className="font-serif text-[13px] font-bold text-deep">Stock value</span>
                <span className="ml-auto font-serif text-[16px] font-extrabold text-gold">₹{stats.stockValue.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Video today" value={stats.todayVideoBookings} />
              <StatCard label="Video upcoming" value={stats.upcomingVideoBookings} color="text-lav-DEFAULT" />
            </div>
          </div>
        )}

        {/* ── Orders ── */}
        {tab === "orders" && (
          <div>
            <p className="mb-3 text-[11px] font-bold text-ink-mute">{allOrders.length} total orders</p>
            <div className="space-y-2.5">
              {allOrders.map((order) => {
                const expanded = expandedOrder === order.id;
                const ci = courierInput[order.id] ?? { courier: order.courier, tracking: order.trackingNumber, url: order.trackingUrl };
                return (
                  <div key={order.id} className="rounded-2xl border border-line bg-white/70">
                    <button onClick={() => setExpandedOrder(expanded ? null : order.id)} className="flex w-full items-center gap-2.5 p-3.5 text-left">
                      <span className="text-[22px]">{order.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-bold text-deep">{order.customerName}</div>
                        <div className="text-[10px] font-semibold text-ink-mute">{order.id} · ₹{order.total.toLocaleString("en-IN")}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold ${STATUS_BADGE[order.status].cls}`}>{STATUS_BADGE[order.status].label}</span>
                        {expanded ? <ChevronUp size={14} className="text-ink-mute" /> : <ChevronDown size={14} className="text-ink-mute" />}
                      </div>
                    </button>
                    {expanded && (
                      <div className="border-t border-line px-3.5 pb-3.5 pt-3 space-y-3">
                        <div className="text-[11px] font-semibold text-ink-soft space-y-1">
                          <div><span className="font-bold text-deep">Phone:</span> {order.customerPhone}</div>
                          <div><span className="font-bold text-deep">Address:</span> {order.building}, {order.area} – {order.pin}</div>
                          {order.note && <div><span className="font-bold text-deep">Note:</span> {order.note}</div>}
                          <div><span className="font-bold text-deep">Profit:</span> ₹{order.netProfit}</div>
                        </div>
                        {/* Status update */}
                        <div>
                          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-ink-mute">Update status</label>
                          <div className="flex flex-wrap gap-1.5">
                            {ALL_STATUSES.map(s => (
                              <button
                                key={s}
                                onClick={() => updateStatus.mutate({ orderId: order.id, status: s })}
                                disabled={order.status === s}
                                className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-colors ${order.status === s ? "border-deep bg-deep text-white" : "border-line bg-white/60 text-ink-soft"}`}
                              >
                                {s.replace(/_/g, " ")}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Delivery info */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wide text-ink-mute">Delivery tracking</label>
                          <input value={ci.courier} onChange={e => setCourierInput(p => ({ ...p, [order.id]: { ...ci, courier: e.target.value } }))} placeholder="Courier (e.g. Delhivery)" className="w-full rounded-xl border border-line bg-white/70 px-3 py-2 text-[12px] font-semibold text-deep outline-none focus:border-rose" />
                          <input value={ci.tracking} onChange={e => setCourierInput(p => ({ ...p, [order.id]: { ...ci, tracking: e.target.value } }))} placeholder="Tracking number" className="w-full rounded-xl border border-line bg-white/70 px-3 py-2 text-[12px] font-semibold text-deep outline-none focus:border-rose" />
                          <input value={ci.url} onChange={e => setCourierInput(p => ({ ...p, [order.id]: { ...ci, url: e.target.value } }))} placeholder="Tracking URL (optional)" className="w-full rounded-xl border border-line bg-white/70 px-3 py-2 text-[12px] font-semibold text-deep outline-none focus:border-rose" />
                          <button
                            onClick={() => updateDelivery.mutate({ orderId: order.id, courier: ci.courier, trackingNumber: ci.tracking, trackingUrl: ci.url })}
                            disabled={!ci.courier || !ci.tracking}
                            className="w-full rounded-xl bg-deep py-2.5 text-[12px] font-bold text-cream disabled:opacity-50"
                          >
                            <Truck size={13} className="mr-1.5 inline" /> Save & mark shipped
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Inventory ── */}
        {tab === "inventory" && (
          <div>
            <p className="mb-3 text-[11px] font-bold text-ink-mute">{allItems.length} items · tap to edit stock</p>
            <div className="space-y-2">
              {allItems.map((item: IndividualItem) => {
                const low = item.stock > 0 && item.stock <= item.minStock;
                const out = item.stock === 0;
                const isEditing = editingItem === item.id;
                return (
                  <div key={item.id} className={`rounded-2xl border ${out ? "border-rose/30 bg-rose/5" : low ? "border-[#E8C070]/60 bg-[#FFF8E8]" : "border-line bg-white/70"}`}>
                    <button onClick={() => { setEditingItem(isEditing ? null : item.id); setAddQty("1"); setAdjustQty(String(item.stock)); }} className="flex w-full items-center gap-3 p-3 text-left">
                      <span className="text-[22px]">{item.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-bold text-deep">{item.name}</div>
                        <div className="text-[10px] font-semibold text-ink-mute">{item.sku} · {item.category}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-serif text-[16px] font-extrabold ${out ? "text-rose" : low ? "text-[#C06820]" : "text-deep"}`}>{item.stock}</div>
                        <div className="text-[9px] font-bold text-ink-mute">₹{item.sellingPrice}</div>
                      </div>
                      {(low || out) && <AlertTriangle size={14} className={out ? "text-rose" : "text-[#C06820]"} />}
                    </button>
                    {isEditing && (
                      <div className="border-t border-line px-3 pb-3 pt-2.5 space-y-3">
                        {/* Add stock */}
                        <div>
                          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-mute">Add stock</div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setAddQty(q => String(Math.max(1, Number(q) - 1)))} className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-white/70"><Minus size={12} /></button>
                            <input value={addQty} onChange={e => setAddQty(e.target.value)} className="w-16 rounded-xl border border-line bg-white/70 px-2 py-1.5 text-center text-[13px] font-bold text-deep outline-none" />
                            <button onClick={() => setAddQty(q => String(Number(q) + 1))} className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-white/70"><Plus size={12} /></button>
                            <button
                              onClick={() => addStock.mutate({ itemId: item.id, qty: Number(addQty), costPrice: item.costPrice, note: "Admin stock entry" }, { onSuccess: () => setEditingItem(null) })}
                              disabled={addStock.isPending || Number(addQty) < 1}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-sage-DEFAULT py-2 text-[12px] font-bold text-white disabled:opacity-50"
                            >
                              <Plus size={13} /> Add
                            </button>
                          </div>
                        </div>
                        {/* Set exact stock */}
                        <div>
                          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-mute">Set exact stock</div>
                          <div className="flex items-center gap-2">
                            <input value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="New qty" className="flex-1 rounded-xl border border-line bg-white/70 px-3 py-2 text-[13px] font-bold text-deep outline-none focus:border-rose" />
                            <button
                              onClick={() => adjustStock.mutate({ itemId: item.id, newQty: Number(adjustQty), reason: "Physical stock count" }, { onSuccess: () => setEditingItem(null) })}
                              disabled={adjustStock.isPending || adjustQty === ""}
                              className="flex items-center gap-1.5 rounded-xl bg-deep px-4 py-2 text-[12px] font-bold text-cream disabled:opacity-50"
                            >
                              <Check size={13} /> Set
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Customers ── */}
        {tab === "customers" && (
          <div>
            <p className="mb-3 text-[11px] font-bold text-ink-mute">{customers.length} registered customers</p>
            <div className="space-y-2.5">
              {customers.map((c: Customer) => (
                <div key={c.id} className="rounded-2xl border border-line bg-white/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blush font-serif text-[16px] font-bold text-mauve">{c.name[0]}</div>
                    <div className="flex-1">
                      <div className="font-serif text-[14px] font-bold text-deep">{c.name}</div>
                      <div className="text-[11px] font-semibold text-ink-mute">{c.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
                    <div className="text-center">
                      <div className="font-serif text-[16px] font-bold text-deep">{c.totalOrders}</div>
                      <div className="text-[9px] font-bold text-ink-mute uppercase tracking-wide">Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="font-serif text-[16px] font-bold text-gold">₹{c.totalSpend.toLocaleString("en-IN")}</div>
                      <div className="text-[9px] font-bold text-ink-mute uppercase tracking-wide">Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[11px] font-bold text-deep">{c.phone}</div>
                      <div className="text-[9px] font-bold text-ink-mute uppercase tracking-wide">Phone</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Video bookings ── */}
        {tab === "bookings" && (
          <div>
            <p className="mb-3 text-[11px] font-bold text-ink-mute">{bookings.length} video bookings</p>
            <div className="space-y-2">
              {bookings.map(b => (
                <div key={b.id} className="rounded-2xl border border-line bg-white/70 p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-bold text-deep">{b.id} · {b.scoopTier} scoop</div>
                      <div className="text-[10px] font-semibold text-ink-mute">{b.videoDate ?? "No date"} · {b.videoTime ?? "No time"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${b.status === "confirmed" ? "bg-[#D8F0D8] text-[#2A6030]" : "bg-[#FFE8E8] text-rose"}`}>
                        {b.status}
                      </span>
                      {b.videoSlotId && (
                        <button
                          onClick={() => blockSlot.mutate({ slotId: b.videoSlotId!, blocked: true })}
                          className="rounded-lg border border-rose/30 bg-rose/10 px-2.5 py-1 text-[10px] font-bold text-rose"
                        >
                          Block slot
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="pt-10 text-center">
                  <Video size={36} className="mx-auto mb-3 text-ink-mute" />
                  <p className="font-serif text-[14px] text-ink-soft">No video bookings yet</p>
                  <p className="mt-1 text-[12px] text-ink-mute">Bookings will appear here once customers add the video add-on.</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>
    </Screen>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
type View = "login" | "orders" | "account" | "admin";

export function OrdersRoute() {
  const [view, setView] = useState<View>(() => getToken() ? "orders" : "login");
  const [tick, setTick] = useState(0);
  const { data: orders, isLoading } = useOrders();

  useEffect(() => {
    const token = getToken();
    setView(token ? "orders" : "login");
  }, [tick]);

  if (view === "login") {
    return <AuthPanel onSuccess={() => { setTick(t => t + 1); setView("orders"); }} />;
  }

  if (view === "account") {
    return <AccountPanel onLogout={() => { clearToken(); setView("login"); }} />;
  }

  if (view === "admin") {
    return <AdminPanel onBack={() => setView("orders")} />;
  }

  const token = getToken();
  const user = parseJwt(token);
  const isAdmin = user?.role === "admin";

  return (
    <Screen top={
      <div className="flex items-center gap-2 border-b border-line bg-cream/95 px-4 py-3">
        <span className="font-serif text-[17px] font-bold text-deep">My orders</span>
        <div className="ml-auto flex items-center gap-2">
          {isAdmin && (
            <button onClick={() => setView("admin")} className="flex items-center gap-1.5 rounded-xl border border-rose/30 bg-rose/10 px-3 py-1.5 text-[11px] font-bold text-rose">
              <LayoutDashboard size={12} /> Admin
            </button>
          )}
          <button onClick={() => setView("account")} className="flex items-center gap-1.5 rounded-xl border border-line bg-white/60 px-3 py-1.5 text-[11px] font-bold text-deep">
            <User size={13} /> {user?.name?.split(" ")[0] ?? "Account"}
          </button>
        </div>
      </div>
    }>
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-[180px] animate-pulse rounded-2xl bg-white/50" />)}</div>
        ) : orders && orders.length > 0 ? (
          <>
            <p className="mb-3 text-[11px] font-bold text-ink-mute">{orders.length} order{orders.length !== 1 ? "s" : ""} · tap to expand</p>
            {orders.map((o) => <OrderCard key={o.id} order={o} />)}
          </>
        ) : (
          <div className="pt-16 text-center">
            <Receipt size={44} className="mx-auto mb-3 text-ink-mute" />
            <h3 className="font-serif text-[18px] font-semibold text-deep">No orders yet</h3>
            <p className="mt-1.5 text-[13px] font-semibold text-ink-soft">Your scoops and individual item orders will show up here.</p>
          </div>
        )}
        <div className="h-6" />
      </div>
    </Screen>
  );
}
