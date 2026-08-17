import { useState } from "react";
import { Truck, ExternalLink, Search } from "lucide-react";
import { useAllOrders, useUpdateOrderStatus, useUpdateDelivery } from "../../api/queries";
import type { Order, OrderStatus } from "../../api/mockApi";

const DELIVERY_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "preparing", label: "Preparing" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
];

const STATUS_COLOR: Record<string, string> = {
  preparing: "bg-[#FFF0D0] text-[#8A5000]",
  packed: "bg-[#E0F0FF] text-[#1A4080]",
  shipped: "bg-[#E0EEFF] text-[#1A4080]",
  out_for_delivery: "bg-[#FFF3E0] text-[#8A4000]",
  delivered: "bg-[#D8F0D8] text-[#2A6030]",
  confirmed: "bg-lav text-lav-deep",
  cancelled: "bg-[#FFE8E8] text-[#B02840]",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function DeliveryRow({ order }: { order: Order }) {
  const [courier, setCourier] = useState(order.courier);
  const [trackingNo, setTrackingNo] = useState(order.trackingNumber);
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl);
  const [editing, setEditing] = useState(false);

  const updateStatus = useUpdateOrderStatus();
  const updateDelivery = useUpdateDelivery();

  const statusLabel =
    DELIVERY_STATUSES.find((s) => s.value === order.status)?.label ??
    order.status.replace(/_/g, " ");

  function save() {
    updateDelivery.mutate(
      { orderId: order.id, courier, trackingNumber: trackingNo, trackingUrl },
      { onSuccess: () => setEditing(false) },
    );
  }

  return (
    <div className="mb-2 overflow-hidden rounded-2xl border border-line bg-white/70">
      {/* Order summary */}
      <div className="flex items-center gap-3 p-4">
        <span className="text-[22px]">{order.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[12px] font-bold text-deep">{order.id}</span>
            <span
              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${STATUS_COLOR[order.status] ?? "bg-white text-deep"}`}
            >
              {statusLabel}
            </span>
          </div>
          <div className="text-[11px] text-ink-mute">
            {order.customerName} · {order.building}, {order.area} – {order.pin} · {fmtDate(order.placedAt)}
          </div>
        </div>
      </div>

      <div className="border-t border-line px-4 pb-4 pt-3 space-y-3">
        {/* Tracking info (view mode) */}
        {!editing && order.trackingNumber && (
          <div className="flex items-center gap-3 rounded-xl border border-[#B0D8E8] bg-[#E8F4F8] px-3 py-2.5">
            <Truck size={14} className="flex-shrink-0 text-[#1A5080]" />
            <div className="flex-1">
              <div className="text-[11px] font-bold text-[#1A5080]">{order.courier}</div>
              <div className="text-[12px] font-bold text-deep">{order.trackingNumber}</div>
            </div>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg bg-[#1A5080] px-2.5 py-1.5 text-[11px] font-bold text-white"
              >
                Track <ExternalLink size={10} />
              </a>
            )}
          </div>
        )}

        {/* Status update */}
        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-mute">
            Update delivery status
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DELIVERY_STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => updateStatus.mutate({ orderId: order.id, status: s.value })}
                disabled={order.status === s.value || updateStatus.isPending}
                className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-colors ${
                  order.status === s.value
                    ? "border-deep bg-deep text-white"
                    : "border-line bg-white/70 text-ink-soft hover:border-deep"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tracking input */}
        {editing ? (
          <div className="space-y-2 rounded-xl border border-line bg-white/50 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">
              Tracking details
            </div>
            <input
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[12px] outline-none"
              placeholder="Courier (e.g. Delhivery, Bluedart)"
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
            />
            <input
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[12px] outline-none"
              placeholder="Tracking number"
              value={trackingNo}
              onChange={(e) => setTrackingNo(e.target.value)}
            />
            <input
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[12px] outline-none"
              placeholder="Tracking URL"
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={updateDelivery.isPending}
                className="flex-1 rounded-xl bg-deep py-2 text-[12px] font-bold text-white"
              >
                {updateDelivery.isPending ? "Saving…" : "Save tracking"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-xl border border-line px-4 py-2 text-[12px] font-bold text-ink-soft"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-[12px] font-bold text-deep"
          >
            <Truck size={13} />
            {order.trackingNumber ? "Edit tracking" : "Add tracking info"}
          </button>
        )}
      </div>
    </div>
  );
}

export function AdminDeliveryRoute() {
  const { data: orders = [], isLoading } = useAllOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const active = orders.filter((o) => o.status !== "cancelled");

  const filtered = active
    .filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.trackingNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="font-serif text-[22px] font-bold text-deep">Delivery Management</h1>
        <p className="text-[12px] font-semibold text-ink-soft">
          {active.length} active shipments · update status and tracking
        </p>
      </div>

      {/* Summary */}
      <div className="mb-4 grid grid-cols-4 gap-2">
        {DELIVERY_STATUSES.slice(0, 4).map((s) => {
          const count = orders.filter((o) => o.status === s.value).length;
          return (
            <div
              key={s.value}
              onClick={() => setStatusFilter(statusFilter === s.value ? "all" : s.value)}
              className={`cursor-pointer rounded-2xl border p-3 text-center transition-all ${
                statusFilter === s.value ? "border-deep bg-deep" : "border-line bg-white/70"
              }`}
            >
              <div
                className={`font-serif text-[18px] font-bold ${
                  statusFilter === s.value ? "text-white" : "text-deep"
                }`}
              >
                {count}
              </div>
              <div
                className={`text-[9px] font-bold uppercase ${
                  statusFilter === s.value ? "text-white/70" : "text-ink-mute"
                }`}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order ID, customer, tracking…"
          className="w-full rounded-xl border border-line bg-white/70 py-2.5 pl-9 pr-3 text-[12px] outline-none"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-[40px]">🚚</div>
          <p className="mt-2 font-serif text-[16px] font-bold text-deep">No deliveries found</p>
        </div>
      ) : (
        filtered.map((o) => <DeliveryRow key={o.id} order={o} />)
      )}
    </div>
  );
}
