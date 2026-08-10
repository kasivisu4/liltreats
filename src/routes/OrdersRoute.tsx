import { useState } from "react";
import { Receipt, Package, Truck, ExternalLink } from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { useOrders } from "../api/queries";
import type { Order, OrderStatus } from "../api/mockApi";

const STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "confirmed", label: "Order confirmed" },
  { key: "preparing", label: "Preparing your scoop" },
  { key: "packed", label: "Packed & ready" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  confirmed: 0,
  preparing: 1,
  packed: 2,
  shipped: 3,
  out_for_delivery: 4,
  delivered: 5,
  cancelled: -1,
};

const STATUS_BADGE: Record<OrderStatus, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "bg-lav text-lav-deep" },
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
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const current = STATUS_INDEX[order.status];
  const delivered = order.status === "delivered";
  const cancelled = order.status === "cancelled";
  const badge = STATUS_BADGE[order.status];
  const payBadge = PAYMENT_BADGE[order.paymentStatus] ?? PAYMENT_BADGE.pending;

  const steps = STATUS_STEPS.filter((s) => s.key !== "cancelled");

  return (
    <div className="card-glass mb-3 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2.5 p-4 text-left"
      >
        <span className="text-[26px]">{order.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="font-serif text-[14px] font-semibold text-deep">{order.tierName}</div>
          <div className="mt-0.5 text-[11px] font-semibold text-ink-mute">
            {fmtDate(order.placedAt)} · {order.id}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-[10px] px-2.5 py-1 text-[10px] font-bold ${badge.cls}`}>
            {badge.label}
          </span>
          <span className={`text-[10px] font-bold ${payBadge.cls}`}>{payBadge.label}</span>
        </div>
      </button>

      {/* Preview chips */}
      <div className="flex flex-wrap gap-1.5 px-4 pb-3">
        {order.itemsPreview.map((p) => (
          <span
            key={p}
            className="rounded-lg border border-[#E0A8B8] bg-blush px-2 py-[3px] text-[10px] font-bold text-deep"
          >
            {p}
          </span>
        ))}
        {order.videoAddon && (
          <span className="rounded-lg border border-gold-light bg-gold-pale px-2 py-[3px] text-[10px] font-bold text-gold">
            🎬 Video
          </span>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-line px-4 pb-4 pt-3">
          {/* Total */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-ink-soft">Total paid</span>
            <span className="font-serif text-[16px] font-bold text-deep">
              ₹{order.total.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Video booking info */}
          {order.videoAddon && order.videoDate && (
            <div className="mb-3 rounded-xl border border-rose/20 bg-[#FFF8FA] px-3 py-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wide text-rose">Video booking</div>
              <div className="mt-0.5 text-[13px] font-bold text-deep">
                {new Date(order.videoDate + "T00:00:00").toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
                {order.videoTime && ` at ${order.videoTime}`}
              </div>
            </div>
          )}

          {/* Delivery address */}
          <div className="mb-3 rounded-xl bg-white/50 px-3 py-2.5">
            <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-mute">
              Delivery address
            </div>
            <div className="text-[12px] font-semibold text-deep">
              {order.building}, {order.area}, Hyderabad – {order.pin}
            </div>
          </div>

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="mb-3 flex items-center gap-3 rounded-xl border border-[#B0D8E8] bg-[#E8F4F8] px-3 py-2.5">
              <Truck size={16} className="flex-shrink-0 text-[#1A5080]" />
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

          {/* Status timeline */}
          {!cancelled ? (
            <div className={`rounded-xl p-3 ${delivered ? "bg-[#EAF4EA]" : "bg-white/50"}`}>
              {steps.map((step, i) => {
                const done = i <= current || delivered;
                const active = i === current && !delivered;
                return (
                  <div key={step.key} className="mb-1.5 flex items-center gap-2 last:mb-0">
                    <span
                      className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                        done ? "bg-sage-deep" : active ? "animate-pulse bg-gold" : "bg-[#D8C8C8]"
                      }`}
                    />
                    <span
                      className={`text-[12px] font-semibold ${
                        done ? "text-sage-deep" : active ? "text-gold" : "text-ink-mute"
                      }`}
                    >
                      {step.label}
                      {step.key === "delivered" && delivered && (
                        <span className="ml-1 text-[10px]">({fmtDate(order.placedAt)})</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl bg-[#FFE8E8] px-3 py-3 text-center text-[12px] font-bold text-[#B02840]">
              Order cancelled
            </div>
          )}

          {/* Note */}
          {order.note && (
            <div className="mt-3 rounded-xl bg-white/50 px-3 py-2">
              <div className="text-[10px] font-bold uppercase tracking-wide text-ink-mute">Your note</div>
              <div className="mt-0.5 text-[12px] font-semibold italic text-ink-soft">"{order.note}"</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function OrdersRoute() {
  const { data: orders, isLoading } = useOrders();

  return (
    <Screen top={<TopBar title="My orders" />}>
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-[180px] animate-pulse rounded-2xl bg-white/50" />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <>
            <p className="mb-3 text-[11px] font-bold text-ink-mute">
              {orders.length} order{orders.length !== 1 ? "s" : ""} · tap to expand
            </p>
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </>
        ) : (
          <div className="pt-16 text-center">
            <Receipt size={44} className="mx-auto mb-3 text-ink-mute" />
            <h3 className="font-serif text-[18px] font-semibold text-deep">No orders yet</h3>
            <p className="mt-1.5 text-[13px] font-semibold text-ink-soft">
              Your scoops and individual item orders will show up here with live tracking.
            </p>
          </div>
        )}
        <div className="h-6" />
      </div>
    </Screen>
  );
}
