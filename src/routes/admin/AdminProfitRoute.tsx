import { useMemo, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";
import { useAllOrders } from "../../api/queries";
import type { Order } from "../../api/mockApi";

type Period = "today" | "week" | "month" | "all";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ProfitBar({ revenue, cost, profit }: { revenue: number; cost: number; profit: number }) {
  const pct = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
  return (
    <div className="mt-2">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-[#F0E8E8]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#6A8860] to-[#90C070]"
          style={{ width: `${Math.max(0, pct)}%` }}
        />
      </div>
      <div className="mt-1 text-[10px] font-semibold text-ink-mute">
        {pct}% margin · Cost: ₹{cost.toLocaleString("en-IN")} · Revenue: ₹{revenue.toLocaleString("en-IN")}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent?: "default" | "green" | "red" | "blue";
}) {
  const colors = {
    default: "bg-white/70 border-line",
    green: "bg-[#E8F4EA] border-[#B0DEB8]",
    red: "bg-[#FFE8E8] border-[#F0B0B0]",
    blue: "bg-[#E8F0FF] border-[#B0C8F0]",
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[accent]}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">{label}</span>
        <Icon size={15} className="text-ink-mute" />
      </div>
      <div className="font-serif text-[22px] font-bold text-deep">{value}</div>
      {sub && <div className="mt-0.5 text-[10px] font-semibold text-ink-mute">{sub}</div>}
    </div>
  );
}

function OrderProfitRow({ order }: { order: Order }) {
  const totalCost =
    order.itemCost + order.packagingCost + order.shippingCost + order.paymentGatewayCost + order.discount;
  const margin = order.total > 0 ? Math.round((order.netProfit / order.total) * 100) : 0;

  return (
    <div className="mb-2 rounded-2xl border border-line bg-white/70 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-deep">{order.id}</span>
            <span className="text-[12px] font-semibold text-ink-mute">
              {order.icon} {order.tierName}
            </span>
          </div>
          <div className="text-[11px] text-ink-mute">
            {order.customerName} · {fmtDate(order.placedAt)}
          </div>
        </div>
        <div className="text-right">
          <div
            className={`font-serif text-[16px] font-bold ${order.netProfit >= 0 ? "text-[#2A6030]" : "text-[#C03040]"}`}
          >
            {order.netProfit >= 0 ? "+" : ""}₹{order.netProfit.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] font-semibold text-ink-mute">{margin}% margin</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 text-[11px]">
        <div className="rounded-xl bg-[#E8F4EA] p-2 text-center">
          <div className="font-bold text-[#2A6030]">₹{order.total.toLocaleString("en-IN")}</div>
          <div className="text-[9px] font-semibold text-ink-mute">Revenue</div>
        </div>
        <div className="rounded-xl bg-[#FFF0D0] p-2 text-center">
          <div className="font-bold text-[#8A5000]">₹{order.itemCost}</div>
          <div className="text-[9px] font-semibold text-ink-mute">Items</div>
        </div>
        <div className="rounded-xl bg-white/50 p-2 text-center">
          <div className="font-bold text-deep">₹{order.packagingCost + order.shippingCost}</div>
          <div className="text-[9px] font-semibold text-ink-mute">Pack+Ship</div>
        </div>
        <div className="rounded-xl bg-white/50 p-2 text-center">
          <div className="font-bold text-deep">₹{order.paymentGatewayCost}</div>
          <div className="text-[9px] font-semibold text-ink-mute">Gateway</div>
        </div>
      </div>

      <ProfitBar revenue={order.total} cost={totalCost} profit={order.netProfit} />
    </div>
  );
}

export function AdminProfitRoute() {
  const { data: orders = [], isLoading } = useAllOrders();
  const [period, setPeriod] = useState<Period>("month");

  const paidOrders = orders.filter((o) => o.paymentStatus === "successful");

  const filtered = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    switch (period) {
      case "today":
        return paidOrders.filter((o) => o.placedAt.startsWith(today));
      case "week": {
        const day = now.getDay();
        const diffToMon = day === 0 ? -6 : 1 - day;
        const mon = new Date(now);
        mon.setDate(now.getDate() + diffToMon);
        return paidOrders.filter((o) => o.placedAt >= mon.toISOString());
      }
      case "month": {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        return paidOrders.filter((o) => o.placedAt >= monthStart);
      }
      default:
        return paidOrders;
    }
  }, [paidOrders, period]);

  const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);
  const totalCost = filtered.reduce(
    (s, o) => s + o.itemCost + o.packagingCost + o.shippingCost + o.paymentGatewayCost + o.discount,
    0,
  );
  const totalProfit = filtered.reduce((s, o) => s + o.netProfit, 0);
  const margin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

  // Scoop-wise breakdown
  const scoopBreakdown = useMemo(() => {
    const map: Record<string, { revenue: number; profit: number; count: number; label: string; icon: string }> = {};
    filtered.forEach((o) => {
      const key = o.tierId ?? "individual";
      if (!map[key]) map[key] = { revenue: 0, profit: 0, count: 0, label: o.tierName, icon: o.icon };
      map[key].revenue += o.total;
      map[key].profit += o.netProfit;
      map[key].count += 1;
    });
    return Object.values(map);
  }, [filtered]);

  const PERIODS: { value: Period; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "week", label: "This week" },
    { value: "month", label: "This month" },
    { value: "all", label: "All time" },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="font-serif text-[22px] font-bold text-deep">Profit & Loss</h1>
        <p className="text-[12px] font-semibold text-ink-soft">
          Revenue, costs and net profit — connected automatically to orders
        </p>
      </div>

      {/* Period toggle */}
      <div className="mb-5 flex gap-1.5">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            onClick={() => setPeriod(p.value)}
            className={`flex-1 rounded-xl border py-2 text-[11px] font-bold transition-colors ${
              period === p.value
                ? "border-deep bg-deep text-white"
                : "border-line bg-white/70 text-ink-soft"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Top-level stats */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard
          label="Total revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={TrendingUp}
          accent="blue"
          sub={`${filtered.length} paid orders`}
        />
        <StatCard
          label="Net profit"
          value={`₹${totalProfit.toLocaleString("en-IN")}`}
          icon={DollarSign}
          accent={totalProfit >= 0 ? "green" : "red"}
          sub={`${margin}% margin`}
        />
        <StatCard
          label="Total cost"
          value={`₹${totalCost.toLocaleString("en-IN")}`}
          icon={TrendingDown}
          accent="default"
          sub="Items + pack + ship + gateway"
        />
        <StatCard
          label="Avg order profit"
          value={
            filtered.length > 0
              ? `₹${Math.round(totalProfit / filtered.length).toLocaleString("en-IN")}`
              : "₹0"
          }
          icon={Package}
          accent={totalProfit >= 0 ? "green" : "default"}
        />
      </div>

      {/* Profit margin bar */}
      <div className="mb-5 rounded-2xl border border-line bg-white/70 p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[12px] font-bold text-deep">Overall margin</span>
          <span className="font-serif text-[18px] font-bold text-[#2A6030]">{margin}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[#F0E8E8]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#6A8860] to-[#90C070] transition-all"
            style={{ width: `${Math.max(0, Math.min(100, margin))}%` }}
          />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
          <div>
            <div className="font-bold text-[#2A6030]">₹{totalRevenue.toLocaleString("en-IN")}</div>
            <div className="text-ink-mute">Revenue</div>
          </div>
          <div>
            <div className="font-bold text-[#8A5000]">₹{totalCost.toLocaleString("en-IN")}</div>
            <div className="text-ink-mute">Total cost</div>
          </div>
          <div>
            <div className={`font-bold ${totalProfit >= 0 ? "text-[#2A6030]" : "text-[#C03040]"}`}>
              ₹{totalProfit.toLocaleString("en-IN")}
            </div>
            <div className="text-ink-mute">Net profit</div>
          </div>
        </div>
      </div>

      {/* Scoop-wise breakdown */}
      {scoopBreakdown.length > 0 && (
        <div className="mb-5">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-mute">
            Breakdown by product
          </div>
          <div className="space-y-2">
            {scoopBreakdown.map((s) => {
              const m = s.revenue > 0 ? Math.round((s.profit / s.revenue) * 100) : 0;
              return (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-white/70 p-3"
                >
                  <span className="text-[22px]">{s.icon}</span>
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-deep">{s.label}</div>
                    <div className="text-[11px] font-semibold text-ink-mute">
                      {s.count} orders · {m}% margin
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-[14px] font-bold text-[#2A6030]">
                      ₹{s.profit.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] font-semibold text-ink-mute">
                      of ₹{s.revenue.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Order-level P&L */}
      <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-mute">
        Order-wise P&L ({filtered.length})
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-10 text-center">
          <div className="text-[40px]">📊</div>
          <p className="mt-2 font-serif text-[16px] font-bold text-deep">No data for this period</p>
        </div>
      ) : (
        filtered.map((o) => <OrderProfitRow key={o.id} order={o} />)
      )}
    </div>
  );
}
