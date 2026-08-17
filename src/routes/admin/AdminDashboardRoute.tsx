import { TrendingUp, ShoppingBag, Video, Package, AlertTriangle } from "lucide-react";
import { useDashboardStats } from "../../api/queries";

function StatCard({ label, value, sub, icon: Icon, accent = "default" }: {
  label: string; value: string | number; sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accent?: "default" | "green" | "orange" | "red" | "blue";
}) {
  const colors = { default: "bg-white/70 border-line", green: "bg-[#E8F4EA] border-[#B0DEB8]", orange: "bg-[#FFF3E0] border-[#F0C870]", red: "bg-[#FFE8E8] border-[#F0B0B0]", blue: "bg-[#E8F0FF] border-[#B0C8F0]" };
  return (
    <div className={`rounded-2xl border p-4 ${colors[accent]}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-ink-mute">{label}</span>
        <Icon size={16} className="text-ink-mute" />
      </div>
      <div className="font-serif text-[24px] font-bold text-deep">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] font-semibold text-ink-mute">{sub}</div>}
    </div>
  );
}

export function AdminDashboardRoute() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading || !stats) {
    return <div className="p-6"><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-[100px] animate-pulse rounded-2xl bg-white/50" />)}</div></div>;
  }

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="font-serif text-[24px] font-bold text-deep">Dashboard</h1>
        <p className="text-[13px] font-semibold text-ink-soft">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-mute">Sales</div>
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Today" value={`₹${stats.todaySales.toLocaleString("en-IN")}`} icon={TrendingUp} accent="green" />
        <StatCard label="Weekly" value={`₹${stats.weeklySales.toLocaleString("en-IN")}`} icon={TrendingUp} />
        <StatCard label="Monthly" value={`₹${stats.monthlySales.toLocaleString("en-IN")}`} icon={TrendingUp} />
        <StatCard label="Total" value={`₹${stats.totalSales.toLocaleString("en-IN")}`} icon={TrendingUp} accent="blue" />
      </div>

      <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-mute">Orders</div>
      <div className="mb-5 grid grid-cols-3 gap-3 md:grid-cols-6">
        <StatCard label="Today" value={stats.todayOrders} icon={ShoppingBag} />
        <StatCard label="Pending" value={stats.pendingOrders} icon={ShoppingBag} accent={stats.pendingOrders > 0 ? "orange" : "default"} />
        <StatCard label="Processing" value={stats.processingOrders} icon={ShoppingBag} />
        <StatCard label="Shipped" value={stats.shippedOrders} icon={ShoppingBag} accent="blue" />
        <StatCard label="Delivered" value={stats.deliveredOrders} icon={ShoppingBag} accent="green" />
        <StatCard label="Cancelled" value={stats.cancelledOrders} icon={ShoppingBag} accent={stats.cancelledOrders > 0 ? "red" : "default"} />
      </div>

      <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-mute">Video bookings</div>
      <div className="mb-5 grid grid-cols-2 gap-3">
        <StatCard label="Today's videos" value={stats.todayVideoBookings} icon={Video} />
        <StatCard label="Upcoming" value={stats.upcomingVideoBookings} icon={Video} accent="blue" />
      </div>

      <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-mute">Inventory</div>
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total items" value={stats.totalItems} icon={Package} />
        <StatCard label="Low stock" value={stats.lowStockItems} icon={AlertTriangle} accent={stats.lowStockItems > 0 ? "orange" : "default"} />
        <StatCard label="Out of stock" value={stats.outOfStockItems} icon={AlertTriangle} accent={stats.outOfStockItems > 0 ? "red" : "default"} />
        <StatCard label="Stock value" value={`₹${stats.stockValue.toLocaleString("en-IN")}`} icon={Package} accent="green" />
      </div>

      <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-mute">Profit</div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard label="Today's profit" value={`₹${stats.todayProfit.toLocaleString("en-IN")}`} icon={TrendingUp} accent={stats.todayProfit > 0 ? "green" : "default"} />
        <StatCard label="Monthly profit" value={`₹${stats.monthlyProfit.toLocaleString("en-IN")}`} icon={TrendingUp} accent="green" />
        <StatCard label="Total profit" value={`₹${stats.totalProfit.toLocaleString("en-IN")}`} icon={TrendingUp} accent="blue" />
      </div>
    </div>
  );
}
