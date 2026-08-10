import { useState } from "react";
import { Edit3, Check, X, Package } from "lucide-react";
import { TIERS, TIER_BY_ID, VIDEO_ADDON_PRICE, type TierId } from "../../data/tiers";
import { useAllInventoryItems } from "../../api/queries";

// Item mapping — in a real backend this lives in the DB.
// Here we manage it in module-level state so edits persist for the session.
type ItemMapping = { itemId: string; qty: number };
const DEFAULT_MAPPINGS: Record<TierId, ItemMapping[]> = {
  mini: [
    { itemId: "p04", qty: 1 },
    { itemId: "p12", qty: 1 },
    { itemId: "p14", qty: 2 },
    { itemId: "p16", qty: 1 },
  ],
  magic: [
    { itemId: "p01", qty: 1 },
    { itemId: "p04", qty: 1 },
    { itemId: "p07", qty: 1 },
    { itemId: "p11", qty: 1 },
    { itemId: "p14", qty: 2 },
  ],
  premium: [
    { itemId: "p01", qty: 1 },
    { itemId: "p02", qty: 1 },
    { itemId: "p04", qty: 1 },
    { itemId: "p07", qty: 1 },
    { itemId: "p11", qty: 1 },
    { itemId: "p15", qty: 1 },
    { itemId: "p18", qty: 1 },
  ],
};

// Session-persisted mappings
let sessionMappings: Record<TierId, ItemMapping[]> = JSON.parse(
  JSON.stringify(DEFAULT_MAPPINGS),
);

const SCOOP_COST: Record<TierId, number> = {
  mini: 180,
  magic: 320,
  premium: 420,
};

function TierCard({ tierId }: { tierId: TierId }) {
  const tier = TIER_BY_ID(tierId);
  const { data: items = [] } = useAllInventoryItems();
  const [editing, setEditing] = useState(false);
  const [mappings, setMappings] = useState<ItemMapping[]>(() =>
    JSON.parse(JSON.stringify(sessionMappings[tierId])),
  );
  const [savedMappings, setSavedMappings] = useState<ItemMapping[]>(() =>
    JSON.parse(JSON.stringify(sessionMappings[tierId])),
  );

  const itemCost = savedMappings.reduce((s, m) => {
    const item = items.find((i) => i.id === m.itemId);
    return s + (item?.costPrice ?? 0) * m.qty;
  }, 0);
  const margin = tier.price > 0 ? Math.round(((tier.price - itemCost - 55) / tier.price) * 100) : 0;

  function addRow() {
    setMappings((prev) => [...prev, { itemId: items[0]?.id ?? "", qty: 1 }]);
  }
  function removeRow(i: number) {
    setMappings((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateRow(i: number, field: "itemId" | "qty", val: string | number) {
    setMappings((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, [field]: val } : m)),
    );
  }
  function save() {
    sessionMappings[tierId] = JSON.parse(JSON.stringify(mappings));
    setSavedMappings(JSON.parse(JSON.stringify(mappings)));
    setEditing(false);
  }
  function cancel() {
    setMappings(JSON.parse(JSON.stringify(savedMappings)));
    setEditing(false);
  }

  const accentMap: Record<TierId, string> = {
    mini: "from-[#EDF5E8] to-[#E0EED8] border-[#B8D0A8]",
    magic: "from-[#F9EDEE] to-[#F0DFE8] border-[#E0A8B8]",
    premium: "from-[#F5EDF9] to-[#EDE0F4] border-[#C8B0E4]",
  };

  return (
    <div className={`mb-4 rounded-2xl border bg-gradient-to-br p-4 ${accentMap[tierId]}`}>
      {/* Header */}
      <div className="mb-3 flex items-center gap-3">
        <span className="text-[28px]">{tier.icon}</span>
        <div className="flex-1">
          <div className="font-serif text-[17px] font-bold text-deep">{tier.name}</div>
          <div className="text-[12px] font-semibold text-ink-soft">
            {tier.itemsLabel} · ₹{tier.price.toLocaleString("en-IN")} · {tier.tagline}
          </div>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center gap-1 rounded-xl border border-line bg-white/70 px-2.5 py-1.5 text-[11px] font-bold text-deep"
        >
          <Edit3 size={11} /> Edit mapping
        </button>
      </div>

      {/* Summary stats */}
      <div className="mb-3 grid grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-xl bg-white/60 p-2 text-center">
          <div className="font-bold text-deep">₹{tier.price}</div>
          <div className="text-ink-mute">Sell price</div>
        </div>
        <div className="rounded-xl bg-white/60 p-2 text-center">
          <div className="font-bold text-[#8A5000]">₹{itemCost}</div>
          <div className="text-ink-mute">Item cost</div>
        </div>
        <div className="rounded-xl bg-white/60 p-2 text-center">
          <div className={`font-bold ${margin >= 0 ? "text-[#2A6030]" : "text-[#C03040]"}`}>
            {margin}%
          </div>
          <div className="text-ink-mute">Est. margin</div>
        </div>
      </div>

      {/* Video addon info */}
      <div className="mb-3 flex items-center gap-2 rounded-xl border border-rose/20 bg-white/50 px-3 py-2">
        <span className="text-[14px]">🎬</span>
        <div className="flex-1 text-[12px] font-semibold text-deep">
          Video add-on: +₹{VIDEO_ADDON_PRICE} per booking
        </div>
      </div>

      {/* Item mapping */}
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-ink-mute">
        Item mapping ({savedMappings.length} items)
      </div>

      {!editing ? (
        <div className="space-y-1.5">
          {savedMappings.map((m, i) => {
            const item = items.find((it) => it.id === m.itemId);
            return (
              <div key={i} className="flex items-center gap-2 rounded-xl bg-white/50 px-3 py-2">
                <span className="text-[16px]">{item?.emoji ?? "📦"}</span>
                <span className="flex-1 text-[12px] font-semibold text-deep">
                  {item?.name ?? m.itemId}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-deep">
                  × {m.qty}
                </span>
                <span className="text-[10px] font-semibold text-ink-mute">
                  ₹{((item?.costPrice ?? 0) * m.qty).toLocaleString("en-IN")} cost
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-line bg-white/70 p-3">
          <div className="mb-2 space-y-2">
            {mappings.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <select
                  value={m.itemId}
                  onChange={(e) => updateRow(i, "itemId", e.target.value)}
                  className="flex-1 rounded-xl border border-line bg-white px-2 py-1.5 text-[12px] outline-none"
                >
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.emoji} {it.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={m.qty}
                  onChange={(e) => updateRow(i, "qty", Number(e.target.value))}
                  className="w-14 rounded-xl border border-line bg-white px-2 py-1.5 text-center text-[12px] outline-none"
                />
                <button
                  onClick={() => removeRow(i)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white/70 text-[#C03040]"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addRow}
            className="mb-3 w-full rounded-xl border border-dashed border-line py-2 text-[12px] font-bold text-ink-soft"
          >
            + Add item
          </button>
          <div className="flex gap-2">
            <button
              onClick={save}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-deep py-2 text-[12px] font-bold text-white"
            >
              <Check size={13} /> Save mapping
            </button>
            <button
              onClick={cancel}
              className="flex items-center gap-1 rounded-xl border border-line px-4 py-2 text-[12px] font-bold text-ink-soft"
            >
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminScoopManagementRoute() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-1">
        <h1 className="font-serif text-[22px] font-bold text-deep">Scoop Management</h1>
        <p className="text-[12px] font-semibold text-ink-soft">
          Configure item mappings, prices and details for each scoop tier
        </p>
      </div>

      <div className="mb-4 mt-4 rounded-2xl border border-gold/30 bg-gold-pale px-4 py-3">
        <div className="flex items-start gap-2">
          <Package size={14} className="mt-0.5 flex-shrink-0 text-gold" />
          <p className="text-[12px] font-semibold text-deep">
            Item mappings control which products are automatically debited from inventory when an order is confirmed.
            Changing a mapping here takes effect on all future orders.
          </p>
        </div>
      </div>

      {(["mini", "magic", "premium"] as TierId[]).map((id) => (
        <TierCard key={id} tierId={id} />
      ))}
    </div>
  );
}
