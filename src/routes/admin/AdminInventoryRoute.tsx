import { useState } from "react";
import { Plus, Minus, RotateCcw, History, AlertTriangle } from "lucide-react";
import {
  useAllInventoryItems,
  useInventoryMovements,
  useAddStock,
  useManualDebit,
  useAdjustStock,
} from "../../api/queries";
import type { IndividualItem } from "../../api/mockApi";

const MANUAL_REASONS = [
  "Damaged",
  "Lost",
  "Giveaway",
  "Sample",
  "Personal use",
  "Other",
];

function MovementTypeLabel({ type }: { type: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    stock_entry: { label: "Stock entry", cls: "text-[#2A6030] bg-[#D8F0D8]" },
    auto_debit: { label: "Auto debit", cls: "text-[#1A4080] bg-[#E0EEFF]" },
    manual_debit: { label: "Manual debit", cls: "text-[#8A5000] bg-[#FFF0D0]" },
    adjustment: { label: "Adjustment", cls: "text-[#5A2080] bg-[#EEE0F8]" },
    reversal: { label: "Reversal", cls: "text-[#2A6030] bg-[#D8F0D8]" },
  };
  const { label, cls } = map[type] ?? { label: type, cls: "bg-[#F0F0F0] text-ink-soft" };
  return (
    <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${cls}`}>{label}</span>
  );
}

function ItemRow({ item }: { item: IndividualItem }) {
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<"add" | "debit" | "adjust" | "history" | null>(null);
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState("Damaged");
  const [customReason, setCustomReason] = useState("");
  const [adjustQty, setAdjustQty] = useState(item.stock);
  const [adjustNote, setAdjustNote] = useState("");
  const [costPrice, setCostPrice] = useState(item.costPrice);
  const [note, setNote] = useState("");

  const addStock = useAddStock();
  const manualDebit = useManualDebit();
  const adjustStock = useAdjustStock();
  const { data: movements } = useInventoryMovements(expanded && mode === "history" ? item.id : undefined);

  const isLow = item.stock > 0 && item.stock <= item.minStock;
  const isOut = item.stock === 0;

  function handleAdd() {
    addStock.mutate({ itemId: item.id, qty, costPrice, note });
    setMode(null);
    setQty(1);
    setNote("");
  }

  function handleDebit() {
    const r = reason === "Other" ? customReason : reason;
    manualDebit.mutate({ itemId: item.id, qty, reason: r });
    setMode(null);
    setQty(1);
  }

  function handleAdjust() {
    adjustStock.mutate({ itemId: item.id, newQty: adjustQty, reason: adjustNote || "Physical stock correction" });
    setMode(null);
  }

  return (
    <div className={`mb-2 rounded-2xl border bg-white/70 ${isOut ? "border-[#F0B0B0]" : isLow ? "border-[#F0C870]" : "border-line"}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <span className="text-[22px]">{item.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] font-bold text-deep">{item.name}</span>
            {isOut && (
              <span className="flex items-center gap-0.5 rounded-lg bg-[#FFE8E8] px-1.5 py-0.5 text-[9px] font-bold text-[#C03040]">
                <AlertTriangle size={8} /> OUT OF STOCK
              </span>
            )}
            {isLow && !isOut && (
              <span className="flex items-center gap-0.5 rounded-lg bg-[#FFF3E0] px-1.5 py-0.5 text-[9px] font-bold text-[#C06020]">
                <AlertTriangle size={8} /> LOW
              </span>
            )}
          </div>
          <div className="text-[10px] text-ink-mute">
            SKU: {item.sku} · {item.category}
          </div>
        </div>
        <div className="text-right">
          <div className={`font-serif text-[18px] font-bold ${isOut ? "text-[#C03040]" : isLow ? "text-[#C06020]" : "text-[#2A6030]"}`}>
            {item.stock}
          </div>
          <div className="text-[9px] font-semibold text-ink-mute">
            units · min {item.minStock}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-line px-4 pb-4 pt-3">
          {/* Info */}
          <div className="mb-3 grid grid-cols-3 gap-2 text-[11px]">
            <div className="rounded-xl bg-white/50 px-2 py-2 text-center">
              <div className="font-bold text-ink-mute">Cost price</div>
              <div className="font-serif text-[14px] font-bold text-deep">₹{item.costPrice}</div>
            </div>
            <div className="rounded-xl bg-white/50 px-2 py-2 text-center">
              <div className="font-bold text-ink-mute">Stock value</div>
              <div className="font-serif text-[14px] font-bold text-deep">
                ₹{(item.stock * item.costPrice).toLocaleString("en-IN")}
              </div>
            </div>
            <div className="rounded-xl bg-white/50 px-2 py-2 text-center">
              <div className="font-bold text-ink-mute">Sell price</div>
              <div className="font-serif text-[14px] font-bold text-deep">₹{item.sellingPrice}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              onClick={() => setMode(mode === "add" ? null : "add")}
              className="flex items-center gap-1 rounded-xl bg-[#D8F0D8] px-3 py-1.5 text-[11px] font-bold text-[#2A6030]"
            >
              <Plus size={12} /> Add stock
            </button>
            <button
              onClick={() => setMode(mode === "debit" ? null : "debit")}
              className="flex items-center gap-1 rounded-xl bg-[#FFF0D0] px-3 py-1.5 text-[11px] font-bold text-[#8A5000]"
            >
              <Minus size={12} /> Manual debit
            </button>
            <button
              onClick={() => setMode(mode === "adjust" ? null : "adjust")}
              className="flex items-center gap-1 rounded-xl bg-[#EEE0F8] px-3 py-1.5 text-[11px] font-bold text-[#5A2080]"
            >
              <RotateCcw size={12} /> Adjust
            </button>
            <button
              onClick={() => setMode(mode === "history" ? null : "history")}
              className="flex items-center gap-1 rounded-xl bg-[#E8F0FF] px-3 py-1.5 text-[11px] font-bold text-[#1A4080]"
            >
              <History size={12} /> History
            </button>
          </div>

          {/* Add stock form */}
          {mode === "add" && (
            <div className="rounded-xl border border-[#B0DEB8] bg-[#E8F4EA] p-3 space-y-2">
              <div className="text-[11px] font-bold text-[#2A6030]">Add stock</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-ink-mute">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[12px] outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-ink-mute">Cost price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[12px] outline-none"
                  />
                </div>
              </div>
              <input
                placeholder="Note (supplier, batch, etc.)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[12px] outline-none"
              />
              <button
                onClick={handleAdd}
                disabled={addStock.isPending}
                className="w-full rounded-xl bg-[#2A6030] py-2 text-[12px] font-bold text-white"
              >
                {addStock.isPending ? "Saving…" : "Add stock"}
              </button>
            </div>
          )}

          {/* Manual debit form */}
          {mode === "debit" && (
            <div className="rounded-xl border border-[#F0C870] bg-[#FFF8E0] p-3 space-y-2">
              <div className="text-[11px] font-bold text-[#8A5000]">Manual stock debit</div>
              <input
                type="number"
                min={1}
                max={item.stock}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                placeholder="Quantity"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[12px] outline-none"
              />
              <div className="flex flex-wrap gap-1.5">
                {MANUAL_REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                      reason === r ? "border-[#8A5000] bg-[#8A5000] text-white" : "border-line bg-white text-ink-soft"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {reason === "Other" && (
                <input
                  placeholder="Custom reason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[12px] outline-none"
                />
              )}
              <button
                onClick={handleDebit}
                disabled={manualDebit.isPending}
                className="w-full rounded-xl bg-[#8A5000] py-2 text-[12px] font-bold text-white"
              >
                {manualDebit.isPending ? "Saving…" : "Debit stock"}
              </button>
            </div>
          )}

          {/* Adjust form */}
          {mode === "adjust" && (
            <div className="rounded-xl border border-[#C8B0E4] bg-[#EEE0F8] p-3 space-y-2">
              <div className="text-[11px] font-bold text-[#5A2080]">
                Physical stock adjustment (currently: {item.stock} units)
              </div>
              <input
                type="number"
                min={0}
                value={adjustQty}
                onChange={(e) => setAdjustQty(Number(e.target.value))}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[12px] outline-none"
              />
              <input
                placeholder="Reason (e.g. Physical stock count)"
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[12px] outline-none"
              />
              <div className="text-[11px] font-bold text-[#5A2080]">
                Difference: {adjustQty - item.stock >= 0 ? "+" : ""}{adjustQty - item.stock} units
              </div>
              <button
                onClick={handleAdjust}
                disabled={adjustStock.isPending}
                className="w-full rounded-xl bg-[#5A2080] py-2 text-[12px] font-bold text-white"
              >
                {adjustStock.isPending ? "Saving…" : "Apply adjustment"}
              </button>
            </div>
          )}

          {/* History */}
          {mode === "history" && (
            <div className="overflow-hidden rounded-xl border border-line">
              <div className="bg-[#E8F0FF] px-3 py-2 text-[11px] font-bold text-[#1A4080]">
                Stock history
              </div>
              <div className="divide-y divide-line">
                {(movements ?? [])
                  .filter((m) => m.itemId === item.id)
                  .slice(0, 10)
                  .map((m) => (
                    <div key={m.id} className="flex items-center gap-2 px-3 py-2">
                      <MovementTypeLabel type={m.type} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-deep truncate">{m.reason}</div>
                        <div className="text-[10px] text-ink-mute">
                          {new Date(m.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-[12px] font-bold ${m.quantity > 0 ? "text-[#2A6030]" : "text-[#C03040]"}`}>
                          {m.quantity > 0 ? "+" : ""}{m.quantity}
                        </div>
                        <div className="text-[10px] text-ink-mute">→ {m.balanceAfter}</div>
                      </div>
                    </div>
                  ))}
                {(movements ?? []).filter((m) => m.itemId === item.id).length === 0 && (
                  <div className="py-4 text-center text-[11px] text-ink-mute">No movements yet</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AdminInventoryRoute() {
  const { data: items = [], isLoading } = useAllInventoryItems();
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  const filtered = items.filter((i) => {
    if (filter === "low") return i.stock > 0 && i.stock <= i.minStock;
    if (filter === "out") return i.stock === 0;
    return true;
  });

  const lowCount = items.filter((i) => i.stock > 0 && i.stock <= i.minStock).length;
  const outCount = items.filter((i) => i.stock === 0).length;
  const totalValue = items.reduce((s, i) => s + i.stock * i.costPrice, 0);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="font-serif text-[22px] font-bold text-deep">Inventory</h1>
        <p className="text-[12px] font-semibold text-ink-soft">
          {items.length} SKUs · Stock value: ₹{totalValue.toLocaleString("en-IN")}
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-line bg-white/70 p-3 text-center">
          <div className="font-serif text-[20px] font-bold text-deep">{items.length}</div>
          <div className="text-[10px] font-bold uppercase text-ink-mute">Total SKUs</div>
        </div>
        <div className={`rounded-2xl border p-3 text-center ${lowCount > 0 ? "border-[#F0C870] bg-[#FFF8E0]" : "border-line bg-white/70"}`}>
          <div className={`font-serif text-[20px] font-bold ${lowCount > 0 ? "text-[#C06020]" : "text-deep"}`}>{lowCount}</div>
          <div className="text-[10px] font-bold uppercase text-ink-mute">Low stock</div>
        </div>
        <div className={`rounded-2xl border p-3 text-center ${outCount > 0 ? "border-[#F0B0B0] bg-[#FFE8E8]" : "border-line bg-white/70"}`}>
          <div className={`font-serif text-[20px] font-bold ${outCount > 0 ? "text-[#C03040]" : "text-deep"}`}>{outCount}</div>
          <div className="text-[10px] font-bold uppercase text-ink-mute">Out of stock</div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-3 flex gap-2">
        {([["all", "All items"], ["low", "Low stock"], ["out", "Out of stock"]] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${
              filter === val ? "border-deep bg-deep text-white" : "border-line bg-white/70 text-ink-soft"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/50" />
          ))}
        </div>
      ) : (
        filtered.map((item) => <ItemRow key={item.id} item={item} />)
      )}
    </div>
  );
}
