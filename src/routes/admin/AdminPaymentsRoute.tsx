import { useState } from "react";
import { Search, CreditCard } from "lucide-react";
import { useAllOrders } from "../../api/queries";
import type { PaymentStatus } from "../../api/mockApi";

const STATUS_CONFIG: Record<PaymentStatus, { label: string; cls: string }> = {
  successful: { label: "Paid", cls: "bg-[#D8F0D8] text-[#2A6030]" },
  pending: { label: "Pending", cls: "bg-[#FFF3E0] text-[#8A5000]" },
  failed: { label: "Failed", cls: "bg-[#FFE8E8] text-[#C03040]" },
  refunded: { label: "Refunded", cls: "bg-[#E8F0FF] text-[#1A4080]" },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminPaymentsRoute() {
  const { data: orders = [], isLoading } = useAllOrders();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");

  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.paymentStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(search)
      );
    }
    return true;
  });

  const totalPaid = orders
    .filter((o) => o.paymentStatus === "successful")
    .reduce((s, o) => s + o.total, 0);

  const counts: Record<PaymentStatus | "all", number> = {
    all: orders.length,
    successful: orders.filter((o) => o.paymentStatus === "successful").length,
    pending: orders.filter((o) => o.paymentStatus === "pending").length,
    failed: orders.filter((o) => o.paymentStatus === "failed").length,
    refunded: orders.filter((o) => o.paymentStatus === "refunded").length,
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="font-serif text-[22px] font-bold text-deep">Payments</h1>
        <p className="text-[12px] font-semibold text-ink-soft">
          {counts.successful} successful · ₹{totalPaid.toLocaleString("en-IN")} collected
        </p>
      </div>

      {/* Summary */}
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {(["successful", "pending", "failed", "refunded"] as PaymentStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
            className={`rounded-2xl border p-3 text-center transition-all ${
              statusFilter === s
                ? "border-deep bg-deep"
                : STATUS_CONFIG[s].cls.includes("D8F0D8")
                ? "border-[#B0DEB8] bg-[#E8F4EA]"
                : STATUS_CONFIG[s].cls.includes("FFE8E8")
                ? "border-[#F0B0B0] bg-[#FFE8E8]"
                : STATUS_CONFIG[s].cls.includes("FFF3E0")
                ? "border-[#F0C870] bg-[#FFF8E0]"
                : "border-[#B0C8F0] bg-[#E8F0FF]"
            }`}
          >
            <div
              className={`font-serif text-[20px] font-bold ${
                statusFilter === s ? "text-white" : "text-deep"
              }`}
            >
              {counts[s]}
            </div>
            <div
              className={`text-[10px] font-bold uppercase ${
                statusFilter === s ? "text-white/70" : "text-ink-mute"
              }`}
            >
              {STATUS_CONFIG[s].label}
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order, customer, phone…"
          className="w-full rounded-xl border border-line bg-white/70 py-2.5 pl-9 pr-3 text-[12px] outline-none"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-[40px]">💳</div>
          <p className="mt-2 font-serif text-[16px] font-bold text-deep">No payments found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((o) => {
            const ps = STATUS_CONFIG[o.paymentStatus] ?? STATUS_CONFIG.pending;
            return (
              <div key={o.id} className="rounded-2xl border border-line bg-white/70 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gold-pale">
                      <CreditCard size={16} className="text-gold" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[13px] font-bold text-deep">{o.id}</span>
                        <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${ps.cls}`}>
                          {ps.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-ink-mute">
                        {o.customerName} · {o.customerPhone}
                      </div>
                      <div className="text-[10px] text-ink-mute">{fmtDate(o.placedAt)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-[16px] font-bold text-deep">
                      ₹{o.total.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] font-semibold text-ink-mute">
                      {o.icon} {o.tierName}
                    </div>
                    {o.videoAddon && (
                      <div className="text-[10px] font-semibold text-rose">🎬 +Video</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
