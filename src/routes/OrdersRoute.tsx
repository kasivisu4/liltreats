import { Receipt } from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { useOrders } from "../api/queries";
import type { Order, OrderStatus } from "../api/mockApi";

const STEPS = ["Order confirmed", "Packing your scoop", "Out for delivery", "Delivered"];
const STATUS_INDEX: Record<OrderStatus, number> = {
  confirmed: 0,
  preparing: 1,
  dispatched: 2,
  delivered: 3,
};

const STATUS_BADGE: Record<OrderStatus, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "bg-lav text-lav-deep" },
  preparing: { label: "Preparing", cls: "bg-[#FFF0D0] text-[#8A5000]" },
  dispatched: { label: "On the way", cls: "bg-[#E0EEFF] text-[#1A4080]" },
  delivered: { label: "Delivered", cls: "bg-[#D8F0D8] text-[#2A6030]" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function OrderCard({ order }: { order: Order }) {
  const current = STATUS_INDEX[order.status];
  const delivered = order.status === "delivered";
  const badge = STATUS_BADGE[order.status];

  return (
    <div className="card-glass mb-3 p-4">
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className="text-[26px]">{order.icon}</span>
        <div>
          <div className="font-serif text-[14px] font-semibold text-deep">{order.tierName}</div>
          <div className="mt-0.5 text-[11px] font-semibold text-ink-mute">
            {fmtDate(order.placedAt)} · {order.id}
          </div>
        </div>
        <span className={`ml-auto rounded-[10px] px-2.5 py-1.5 text-[10px] font-bold ${badge.cls}`}>
          {badge.label}
        </span>
      </div>

      <div className="mb-2.5 flex flex-wrap gap-1.5">
        {order.itemsPreview.map((p) => (
          <span key={p} className="rounded-lg border border-[#E0A8B8] bg-blush px-2 py-[3px] text-[10px] font-bold text-deep">
            {p}
          </span>
        ))}
        {order.videoAddon && (
          <span className="rounded-lg border border-gold-light bg-gold-pale px-2 py-[3px] text-[10px] font-bold text-gold">
            + Video reel
          </span>
        )}
      </div>

      <div className={`rounded-xl p-3 ${delivered ? "bg-[#EAF4EA]" : "bg-white/50"}`}>
        {STEPS.map((step, i) => {
          const done = i < current || delivered;
          const active = i === current && !delivered;
          return (
            <div key={step} className="mb-1.5 flex items-center gap-2 last:mb-0">
              <span
                className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                  done
                    ? "bg-sage-deep"
                    : active
                      ? "animate-pulse bg-gold"
                      : "bg-[#D8C8C8]"
                }`}
              />
              <span
                className={`text-[12px] font-semibold ${
                  done ? "text-sage-deep" : active ? "text-gold" : "text-ink-mute"
                }`}
              >
                {i === 3 && delivered ? `Delivered on ${fmtDate(order.placedAt)}` : step}
              </span>
            </div>
          );
        })}
      </div>
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
          orders.map((o) => <OrderCard key={o.id} order={o} />)
        ) : (
          <div className="pt-16 text-center">
            <Receipt size={44} className="mx-auto mb-3 text-ink-mute" />
            <h3 className="font-serif text-[18px] font-semibold text-deep">No orders yet</h3>
            <p className="mt-1.5 text-[13px] font-semibold text-ink-soft">
              Your booked scoops will show up here with live tracking.
            </p>
          </div>
        )}
        <div className="h-2" />
      </div>
    </Screen>
  );
}
