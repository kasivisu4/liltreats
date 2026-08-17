import { useState } from "react";
import { Plus, Edit3, Check, X } from "lucide-react";
import { useAllInventoryItems, useSaveProduct } from "../../api/queries";
import type { IndividualItem } from "../../api/mockApi";

const CATEGORIES = ["Jewellery", "Hair", "Accessories", "Beauty", "Trinkets", "Stationery", "Lifestyle"];

function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Partial<IndividualItem> & { id: string };
  onSave: (item: Partial<IndividualItem> & { id: string }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    id: initial.id,
    name: initial.name ?? "",
    category: initial.category ?? "Jewellery",
    emoji: initial.emoji ?? "✦",
    description: initial.description ?? "",
    sellingPrice: initial.sellingPrice ?? 0,
    costPrice: initial.costPrice ?? 0,
    stock: initial.stock ?? 0,
    minStock: initial.minStock ?? 5,
    sku: initial.sku ?? "",
    isNew: initial.isNew ?? false,
    isLimited: initial.isLimited ?? false,
    isFeatured: initial.isFeatured ?? false,
    isActive: initial.isActive ?? true,
  });

  const upd = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const isValid = form.name.trim() && form.sku.trim() && form.sellingPrice > 0;

  return (
    <div className="rounded-2xl border border-line bg-white/80 p-4">
      <div className="mb-3 font-serif text-[15px] font-bold text-deep">
        {initial.name ? `Edit: ${initial.name}` : "New product"}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="col-span-2">
          <label className="field-label">Product name *</label>
          <input className="field-input" value={form.name} onChange={(e) => upd("name", e.target.value)} placeholder="e.g. Pearl drop earrings" />
        </div>
        <div>
          <label className="field-label">SKU *</label>
          <input className="field-input" value={form.sku} onChange={(e) => upd("sku", e.target.value)} placeholder="JWL-001" />
        </div>
        <div>
          <label className="field-label">Emoji / icon</label>
          <input className="field-input" value={form.emoji} onChange={(e) => upd("emoji", e.target.value)} placeholder="💎" />
        </div>
        <div>
          <label className="field-label">Category</label>
          <select className="field-input" value={form.category} onChange={(e) => upd("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Selling price (₹) *</label>
          <input type="number" className="field-input" value={form.sellingPrice} onChange={(e) => upd("sellingPrice", Number(e.target.value))} />
        </div>
        <div>
          <label className="field-label">Cost price (₹)</label>
          <input type="number" className="field-input" value={form.costPrice} onChange={(e) => upd("costPrice", Number(e.target.value))} />
        </div>
        <div>
          <label className="field-label">Stock qty</label>
          <input type="number" className="field-input" value={form.stock} onChange={(e) => upd("stock", Number(e.target.value))} />
        </div>
        <div>
          <label className="field-label">Min stock (alert)</label>
          <input type="number" className="field-input" value={form.minStock} onChange={(e) => upd("minStock", Number(e.target.value))} />
        </div>
        <div className="col-span-2">
          <label className="field-label">Description</label>
          <textarea
            className="field-input min-h-[60px] resize-none"
            value={form.description}
            onChange={(e) => upd("description", e.target.value)}
            placeholder="Short product description…"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["isNew", "isLimited", "isFeatured", "isActive"] as const).map((key) => (
          <label key={key} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form[key]}
              onChange={(e) => upd(key, e.target.checked)}
              className="accent-gold"
            />
            <span className="text-[11px] font-bold text-deep capitalize">
              {key.replace("is", "").replace(/([A-Z])/g, " $1").trim()}
            </span>
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave(form)}
          disabled={!isValid}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-deep py-2.5 text-[13px] font-bold text-white disabled:opacity-50"
        >
          <Check size={14} /> Save product
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1 rounded-xl border border-line px-4 py-2.5 text-[13px] font-bold text-ink-soft"
        >
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  );
}

function genId() {
  return `p${Date.now()}`;
}

export function AdminProductsRoute() {
  const { data: items = [], isLoading } = useAllInventoryItems();
  const saveProduct = useSaveProduct();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function handleSave(item: Partial<IndividualItem> & { id: string }) {
    saveProduct.mutate(item, {
      onSuccess: () => {
        setEditingId(null);
        setAdding(false);
      },
    });
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[22px] font-bold text-deep">Products</h1>
          <p className="text-[12px] font-semibold text-ink-soft">{items.length} products</p>
        </div>
        <button
          onClick={() => { setAdding(true); setEditingId(null); }}
          className="flex items-center gap-1.5 rounded-xl bg-deep px-3 py-2.5 text-[12px] font-bold text-cream"
        >
          <Plus size={14} /> Add product
        </button>
      </div>

      {adding && (
        <div className="mb-4">
          <ProductForm
            initial={{ id: genId() }}
            onSave={handleSave}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/50" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id}>
              {editingId === item.id ? (
                <ProductForm
                  initial={item}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <div className={`flex items-center gap-3 rounded-2xl border bg-white/70 p-3 ${!item.isActive ? "opacity-50" : ""}`}>
                  <span className="text-[22px]">{item.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[13px] font-bold text-deep">{item.name}</span>
                      {!item.isActive && (
                        <span className="rounded-lg bg-[#F0E8E8] px-1.5 py-0.5 text-[9px] font-bold text-ink-mute">Inactive</span>
                      )}
                      {item.isFeatured && (
                        <span className="rounded-lg bg-gold-pale px-1.5 py-0.5 text-[9px] font-bold text-gold">Featured</span>
                      )}
                    </div>
                    <div className="text-[10px] text-ink-mute">
                      {item.sku} · ₹{item.sellingPrice} · Stock: {item.stock} · Cost: ₹{item.costPrice}
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditingId(item.id); setAdding(false); }}
                    className="flex items-center gap-1 rounded-xl border border-line bg-white/70 px-2.5 py-1.5 text-[11px] font-bold text-deep"
                  >
                    <Edit3 size={11} /> Edit
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
