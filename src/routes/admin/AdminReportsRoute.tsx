import { useMemo, useState } from "react";
import { Download, BarChart2, Package, CalendarDays, Users } from "lucide-react";
import { useAllOrders, useAllScoopBookings, useCustomers, useAllInventoryItems } from "../../api/queries";

type ReportTab = "sales" | "inventory" | "bookings" | "customers";

function exportCSV(filename: string, rows: string[][], headers: string[]) {
  const lines = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-mute">{children}</div>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string | number; accent?: "green" | "red" | "blue" | "default" }) {
  const cls = {
    green: "text-[#2A6030]",
    red: "text-[#C03040]",
    blue: "text-[#1A4080]",
    default: "text-deep",
  }[accent ?? "default"];
  return (
    <div className="flex items-center justify-between border-b border-line py-2.5 last:border-none">
      <span className="text-[13px] font-semibold text-ink-soft">{label}</span>
      <span className={`text-[13px] font-bold ${cls}`}>{value}</span>
    </div>
  );
}

export function AdminReportsRoute() {
  const [tab, setTab] = useState<ReportTab>("sales");
  const { data: orders = [] } = useAllOrders();
  const { data: bookings = [] } = useAllScoopBookings();
  const { data: customers = [] } = useCustomers();
  const { data: items = [] } = useAllInventoryItems();

  const paidOrders = orders.filter((o) => o.paymentStatus === "successful");

  const salesStats = useMemo(() => {
    const total = paidOrders.reduce((s, o) => s + o.total, 0);
    const avg = paidOrders.length > 0 ? Math.round(total / paidOrders.length) : 0;
    const mini = paidOrders.filter((o) => o.tierId === "mini");
    const magic = paidOrders.filter((o) => o.tierId === "magic");
    const premium = paidOrders.filter((o) => o.tierId === "premium");
    const videoOrders = paidOrders.filter((o) => o.videoAddon);
    return { total, avg, mini, magic, premium, videoOrders };
  }, [paidOrders]);

  const inventoryStats = useMemo(() => {
    const low = items.filter((i) => i.stock > 0 && i.stock <= i.minStock);
    const out = items.filter((i) => i.stock === 0);
    const value = items.reduce((s, i) => s + i.stock * i.costPrice, 0);
    return { low, out, value };
  }, [items]);

  const bookingStats = useMemo(() => {
    const withVideo = bookings.filter((b) => b.experience === "with_video");
    const mini = bookings.filter((b) => b.scoopTier === "mini");
    const magic = bookings.filter((b) => b.scoopTier === "magic");
    const premium = bookings.filter((b) => b.scoopTier === "premium");
    return { withVideo, mini, magic, premium };
  }, [bookings]);

  const customerStats = useMemo(() => {
    const returning = customers.filter((c) => c.totalOrders > 1);
    const totalSpend = customers.reduce((s, c) => s + c.totalSpend, 0);
    const avg = customers.length > 0 ? Math.round(totalSpend / customers.length) : 0;
    return { returning, totalSpend, avg };
  }, [customers]);

  const TABS: { value: ReportTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { value: "sales", label: "Sales", icon: BarChart2 },
    { value: "inventory", label: "Inventory", icon: Package },
    { value: "bookings", label: "Bookings", icon: CalendarDays },
    { value: "customers", label: "Customers", icon: Users },
  ];

  function handleExport() {
    if (tab === "sales") {
      exportCSV(
        "liltreats-sales-report.csv",
        paidOrders.map((o) => [
          o.id,
          o.customerName,
          o.tierName,
          o.videoAddon ? "With Video" : "Without Video",
          String(o.total),
          String(o.netProfit),
          o.status,
          o.placedAt.split("T")[0],
        ]),
        ["Order ID", "Customer", "Scoop", "Experience", "Revenue", "Profit", "Status", "Date"],
      );
    } else if (tab === "inventory") {
      exportCSV(
        "liltreats-inventory-report.csv",
        items.map((i) => [
          i.sku,
          i.name,
          i.category,
          String(i.stock),
          String(i.minStock),
          String(i.costPrice),
          String(i.sellingPrice),
          String(i.stock * i.costPrice),
          i.stock === 0 ? "Out of Stock" : i.stock <= i.minStock ? "Low Stock" : "OK",
        ]),
        ["SKU", "Name", "Category", "Stock", "Min Stock", "Cost Price", "Sell Price", "Stock Value", "Status"],
      );
    } else if (tab === "bookings") {
      exportCSV(
        "liltreats-bookings-report.csv",
        bookings.map((b) => [
          b.id,
          b.orderId,
          b.scoopTier,
          b.experience,
          b.videoDate ?? "",
          b.videoTime ?? "",
          b.status,
          b.createdAt.split("T")[0],
        ]),
        ["Booking ID", "Order ID", "Scoop Tier", "Experience", "Video Date", "Video Time", "Status", "Date"],
      );
    } else {
      exportCSV(
        "liltreats-customers-report.csv",
        customers.map((c) => [
          c.name,
          c.phone,
          c.email,
          c.instagram,
          String(c.totalOrders),
          String(c.totalSpend),
          c.joinedAt.split("T")[0],
        ]),
        ["Name", "Phone", "Email", "Instagram", "Total Orders", "Total Spend", "Joined"],
      );
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[22px] font-bold text-deep">Reports</h1>
          <p className="text-[12px] font-semibold text-ink-soft">
            Export to CSV — all data, all time
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-xl bg-deep px-3 py-2.5 text-[12px] font-bold text-cream"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-5 grid grid-cols-4 gap-1.5">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-[11px] font-bold transition-colors ${
              tab === value ? "border-deep bg-deep text-white" : "border-line bg-white/70 text-ink-soft"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Sales report */}
      {tab === "sales" && (
        <div className="rounded-2xl border border-line bg-white/70 p-4">
          <SectionLabel>Sales overview</SectionLabel>
          <StatRow label="Total orders" value={paidOrders.length} />
          <StatRow label="Total revenue" value={`₹${salesStats.total.toLocaleString("en-IN")}`} accent="blue" />
          <StatRow label="Average order value" value={`₹${salesStats.avg.toLocaleString("en-IN")}`} />
          <div className="mt-4 mb-2 border-t border-line pt-3">
            <SectionLabel>By scoop tier</SectionLabel>
          </div>
          <StatRow
            label="🌿 Mini Scoop"
            value={`${salesStats.mini.length} orders · ₹${salesStats.mini.reduce((s, o) => s + o.total, 0).toLocaleString("en-IN")}`}
          />
          <StatRow
            label="✨ Magic Scoop"
            value={`${salesStats.magic.length} orders · ₹${salesStats.magic.reduce((s, o) => s + o.total, 0).toLocaleString("en-IN")}`}
          />
          <StatRow
            label="👑 Premium Scoop"
            value={`${salesStats.premium.length} orders · ₹${salesStats.premium.reduce((s, o) => s + o.total, 0).toLocaleString("en-IN")}`}
          />
          <div className="mt-4 mb-2 border-t border-line pt-3">
            <SectionLabel>Experience</SectionLabel>
          </div>
          <StatRow
            label="🎬 With Video orders"
            value={salesStats.videoOrders.length}
            accent="green"
          />
          <StatRow
            label="📦 Without Video orders"
            value={paidOrders.length - salesStats.videoOrders.length}
          />
        </div>
      )}

      {/* Inventory report */}
      {tab === "inventory" && (
        <div className="rounded-2xl border border-line bg-white/70 p-4">
          <SectionLabel>Inventory overview</SectionLabel>
          <StatRow label="Total SKUs" value={items.length} />
          <StatRow label="Total units in stock" value={items.reduce((s, i) => s + i.stock, 0)} />
          <StatRow label="Stock value (at cost)" value={`₹${inventoryStats.value.toLocaleString("en-IN")}`} accent="blue" />
          <StatRow label="Low stock items" value={inventoryStats.low.length} accent={inventoryStats.low.length > 0 ? "red" : "default"} />
          <StatRow label="Out of stock items" value={inventoryStats.out.length} accent={inventoryStats.out.length > 0 ? "red" : "default"} />
          {inventoryStats.low.length > 0 && (
            <>
              <div className="mt-4 mb-2 border-t border-line pt-3">
                <SectionLabel>Low stock items</SectionLabel>
              </div>
              {inventoryStats.low.map((i) => (
                <StatRow
                  key={i.id}
                  label={`${i.emoji} ${i.name}`}
                  value={`${i.stock} left (min: ${i.minStock})`}
                  accent="red"
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* Bookings report */}
      {tab === "bookings" && (
        <div className="rounded-2xl border border-line bg-white/70 p-4">
          <SectionLabel>Booking overview</SectionLabel>
          <StatRow label="Total scoop bookings" value={bookings.length} />
          <StatRow label="🎬 With Video" value={bookingStats.withVideo.length} accent="green" />
          <StatRow label="📦 Without Video" value={bookings.length - bookingStats.withVideo.length} />
          <div className="mt-4 mb-2 border-t border-line pt-3">
            <SectionLabel>By tier</SectionLabel>
          </div>
          <StatRow label="🌿 Mini Scoop" value={bookingStats.mini.length} />
          <StatRow label="✨ Magic Scoop" value={bookingStats.magic.length} />
          <StatRow label="👑 Premium Scoop" value={bookingStats.premium.length} />
        </div>
      )}

      {/* Customer report */}
      {tab === "customers" && (
        <div className="rounded-2xl border border-line bg-white/70 p-4">
          <SectionLabel>Customer overview</SectionLabel>
          <StatRow label="Total customers" value={customers.length} />
          <StatRow label="Returning customers" value={customerStats.returning.length} accent="green" />
          <StatRow label="Total revenue from customers" value={`₹${customerStats.totalSpend.toLocaleString("en-IN")}`} accent="blue" />
          <StatRow label="Avg. spend per customer" value={`₹${customerStats.avg.toLocaleString("en-IN")}`} />
        </div>
      )}

      <p className="mt-4 text-center text-[11px] font-semibold text-ink-mute">
        All reports export as CSV. PDF export coming in a future update.
      </p>
    </div>
  );
}
