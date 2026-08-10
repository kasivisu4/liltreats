import { useState } from "react";
import { Truck, ChevronDown } from "lucide-react";
import { useAllOrders, useUpdateOrderStatus, useUpdateDelivery } from "../../api/queries";
import type { Order, OrderStatus } from "../../api/mockApi";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_COLOR: Record<OrderStatus, string> = {
  confirmed: "bg-lav text-lav-deep",
  preparing: "bg-[#FFF0D0] text-[#8A5000]",
  packed: "bg-[#E0F0FF] text-[#1A4080]",
  shipped: "bg-[#E0EEFF] text-[#1A4080]",
  out_for_delivery: "bg-[#FFF3E0] text-[#8A4000]",
  delivered: "bg-[#D8F0D8] text-[#2A6030]",
  cancelled: "bg-[#FFE8E8] text-[#B02840]",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const [showDelivery, setShowDelivery] = useState(false);
  const [courier, setCourier] = useState(order.courier);
  const [trackingNo, setTrackingNo] = useState(order.trackingNumber);
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl);

  const updateStatus = useUpdateOrderStatus();
  const updateDelivery = useUpdateDelivery();

  return (
    <div className="mb-2 overflow-hidden rounded-2xl border border-line bg-white/70">
      {/* Row header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <span className="text-[20px]">{order.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[12px] font-bold text-deep">{order.id}</span>
            <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${STATUS_COLOR[order.status]}`}>
              {STATUS_OPTIONS.find((s) => s.value === order.status)?.label}
            </span>
            {order.paymentStatus === "successful" && (
              <span className="rounded-lg bg-[#D8F0D8] px-2 py-0.5 text-[10px] font-bold text-[#2A6030]">Paid</span>
            )}
          </div>
          <div className="text-[11px] text-ink-mute">
            {order.customerName} · {fmtDate(order.placedAt)} · ₹{order.total.toLocaleString("en-IN")}
          </div>
        </div>
        <ChevronDown size={14} className={`flex-shrink-0 text-ink-mute transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t border-line px-4 pb-4 pt-3 space-y-3">
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div>
              <div className="font-bold text-ink-mute text-[10px] uppercase tracking-wide mb-0.5">Customer</div>
              <div className="font-bold text-deep">{order.customerName}</div>
              <div className="text-ink-soft">{order.customerPhone}</div>
              {order.customerEmail && <div className="text-ink-soft">{order.customerEmail}</div>}
            </div>
            <div>
              <div className="font-bold text-ink-mute text-[10px] uppercase tracking-wide mb-0.5">Address</div>
              <div className="font-semibold text-deep">{order.building}</div>
              <div className="text-ink-soft">{order.area}, Hyd – {order.pin}</div>
            </div>
            <div>
              <div className="font-bold text-ink-mute text-[10px] uppercase tracking-wide mb-0.5">Scoop</div>
              <div className="font-bold text-deep">{order.tierName}</div>
              {order.videoAddon && (
                <div className="text-rose text-[11px] font-bold">🎬 Video: {order.videoDate} {order.videoTime}</div>
              )}
            </div>
            <div>
              <div className="font-bold text-ink-mute text-[10px] uppercase tracking-wide mb-0.5">Financials</div>
              <div className="font-semibold text-deep">Revenue: ₹{order.total}</div>
              <div className="font-semibold text-[#2A6030]">Profit: ₹{order.netProfit}</div>
              <div className="font-semibold text-ink-soft text-[11px]">Cost: ₹{order.itemCost + order.packagingCost}</div>
            </div>
          </div>

          {/* Status update */}
          <div>
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-mute">Update status</div>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  disabled={order.status === opt.value || updateStatus.isPending}
                  onClick={() => updateStatus.mutate({ orderId: order.id, status: opt.value })}
                  className={`rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-colors ${
                    order.status === opt.value
                      ? "border-deep bg-deep text-white"
                      : "border-line bg-white/70 text-ink-soft hover:border-deep"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery tracking */}
          <div>
            <button
              onClick={() => setShowDelivery(!showDelivery)}
              className="flex items-center gap-1.5 text-[11px] font-bold text-deep"
            >
              <Truck size={13} /> Add / update tracking
            </button>
            {showDelivery && (
              <div className="mt-2 space-y-2">
                <input
                  className="w-full rounded-xl border border-line bg-white/70 px-3 py-2 text-[12px] outline-none"
                  placeholder="Courier name (e.g. Delhivery)"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                />
                <input
                  className="w-full rounded-xl border border-line bg-white/70 px-3 py-2 text-[12px] outline-none"
                  placeholder="Tracking number"
                  value={trackingNo}
                  onChange={(e) => setTrackingNo(e.target.value)}
                />
                <input
                  className="w-full rounded-xl border border-line bg-white/70 px-3 py-2 text-[12px] outline-none"
                  placeholder="Tracking URL"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                />
                <button
                  onClick={() =>
                    updateDelivery.mutate({
                      orderId: order.id,
                      courier,
                      trackingNumber: trackingNo,
                      trackingUrl,
                    })
                  }
                  disabled={updateDelivery.isPending}
                  className="w-full rounded-xl bg-deep py-2 text-[12px] font-bold text-white"
                >
                  {updateDelivery.isPending ? "Saving…" : "Save tracking info"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminOrdersRoute() {
  const { data: orders = [], isLoading } = useAllOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const filtered = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="font-serif text-[22px] font-bold text-deep">Orders</h1>
        <p className="text-[12px] font-semibold text-ink-soft">{orders.length} total orders</p>
      </div>

      {/* Status filter */}
      <div className="mb-4 no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setStatusFilter("all")}
          className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
            statusFilter === "all" ? "border-deep bg-deep text-white" : "border-line bg-white/70 text-ink-soft"
          }`}
        >
          All ({orders.length})
        </button>
        {STATUS_OPTIONS.map((opt) => {
          const count = orders.filter((o) => o.status === opt.value).length;
          return (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
                statusFilter === opt.value ? "border-deep bg-deep text-white" : "border-line bg-white/70 text-ink-soft"
              }`}
            >
              {opt.label} ({count})
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-[40px]">📭</div>
          <p className="mt-2 font-serif text-[16px] font-bold text-deep">No orders found</p>
        </div>
      ) : (
        filtered.map((o) => <OrderRow key={o.id} order={o} />)
      )}
    </div>
  );
}
