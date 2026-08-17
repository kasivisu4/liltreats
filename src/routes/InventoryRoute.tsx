import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Sparkles, ShoppingBag, Plus, Minus, ShoppingCart } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { StockBar } from "../components/StockBar";
import { INVENTORY as SCOOP_ITEMS } from "../data/inventory";
import type { ScoopItem } from "../data/inventory";
import type { TierId } from "../data/tiers";
import { useIndividualItems } from "../api/queries";
import { useCartStore } from "../store/cartStore";
import { useNavigate } from "@tanstack/react-router";

type Tab = "all" | TierId;
type Badge = "all" | "new" | "lim" | "avail";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "mini", label: "Mini" },
  { id: "magic", label: "Magic" },
  { id: "premium", label: "Premium" },
];

const BADGES: { id: Badge; label: string }[] = [
  { id: "all", label: "All items" },
  { id: "new", label: "✦ New this week" },
  { id: "lim", label: "Limited" },
  { id: "avail", label: "In stock" },
];

const TIER_TAG_STYLE: Record<TierId, string> = {
  mini: "bg-[#D8EED0] text-[#3A5830]",
  magic: "bg-[#F2D8E0] text-[#7A3048]",
  premium: "bg-[#E0D0F0] text-[#503880]",
};

function stockTone(stock: number) {
  if (stock <= 0) return "out" as const;
  if (stock <= 5) return "low" as const;
  return "ok" as const;
}

function ItemRow({ item }: { item: ScoopItem }) {
  const tone = stockTone(item.stock);
  const pct = item.stock <= 0 ? 100 : Math.min(100, Math.round((item.stock / 20) * 100));
  const stockText =
    item.stock <= 0 ? "Sold out" : item.stock <= 4 ? `${item.stock} left!` : `${item.stock} units`;
  const subText =
    item.stock <= 0 ? "Back next week" : item.stock <= 4 ? "Almost gone!" : "In stock";
  const stockColor =
    tone === "out" ? "text-[#B02840]" : tone === "low" ? "text-[#C06820]" : "text-[#4A7838]";

  return (
    <div
      className={`flex h-full items-center gap-3 rounded-2xl border border-line bg-white/60 p-3 ${
        item.stock <= 0 ? "opacity-50" : ""
      }`}
    >
      <span className="flex-shrink-0 text-[26px]">{item.emoji}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5 text-[13px] font-bold text-deep">
          {item.name}
          {item.isNew && (
            <span className="rounded-lg border border-gold-light bg-gold-pale px-1.5 py-[1px] text-[9px] font-bold text-gold">
              ✦ New
            </span>
          )}
          {item.isLimited && (
            <span className="rounded-lg border border-[#C8B0E4] bg-lav px-1.5 py-[1px] text-[9px] font-bold text-lav-deep">
              Limited
            </span>
          )}
        </div>
        <div className="mt-0.5 text-[10px] font-semibold text-ink-mute">{item.category}</div>
        <div className="mt-1 flex flex-wrap gap-1">
          {item.tiers.map((t) => (
            <span key={t} className={`rounded-md px-1.5 py-[2px] text-[9px] font-bold ${TIER_TAG_STYLE[t]}`}>
              {t === "premium" ? "Premium" : t[0].toUpperCase() + t.slice(1)}
            </span>
          ))}
        </div>
        <StockBar pct={pct} tone={tone} />
      </div>
      <div className="min-w-[58px] flex-shrink-0 text-right">
        <div className={`text-[12px] font-extrabold ${stockColor}`}>{stockText}</div>
        <div className="mt-0.5 text-[9px] font-semibold text-ink-mute">{subText}</div>
      </div>
    </div>
  );
}

// ── Shop (Individual Items) ───────────────────────────────────────────────────

const SHOP_CATS = ["All", "Jewellery", "Hair", "Accessories", "Beauty", "Trinkets", "Stationery", "Lifestyle"];

export function ShopRoute() {
  const navigate = useNavigate();
  const { data: items = [], isLoading } = useIndividualItems();
  const shopCart = useCartStore((s) => s.shopCart);
  const addToShopCart = useCartStore((s) => s.addToShopCart);
  const updateShopCartQty = useCartStore((s) => s.updateShopCartQty);
  const removeFromShopCart = useCartStore((s) => s.removeFromShopCart);
  const selectedTier = useCartStore((s) => s.selectedTier);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  const cartCount = shopCart.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = shopCart.reduce((s, i) => s + i.price * i.quantity, 0);

  const filtered = items.filter((i) => {
    const catOk = cat === "All" || i.category === cat;
    const searchOk = !search || i.name.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk && i.isActive;
  }).sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return a.stock === 0 ? 1 : b.stock === 0 ? -1 : 0;
  });

  function getQty(itemId: string) {
    return shopCart.find((c) => c.itemId === itemId)?.quantity ?? 0;
  }

  function stockToneShop(stock: number) {
    if (stock <= 0) return "out";
    if (stock <= 5) return "low";
    return "ok";
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-line bg-cream/95 px-4 py-3">
        <div>
          <div className="font-serif text-[20px] font-bold text-deep">Shop</div>
          <div className="text-[11px] font-semibold text-ink-mute">Individual items · Mix & match</div>
        </div>
        {cartCount > 0 && (
          <button
            onClick={() => { if (!selectedTier) useCartStore.setState({ selectedTier: "mini" }); navigate({ to: "/cart" }); }}
            className="flex items-center gap-2 rounded-2xl bg-deep px-4 py-2.5 text-[12px] font-bold text-cream"
          >
            <ShoppingCart size={14} />
            {cartCount} · ₹{cartTotal.toLocaleString("en-IN")}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="border-b border-line px-4 py-2.5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items…"
          className="w-full rounded-xl border border-line bg-white/70 px-3.5 py-2 text-[13px] font-semibold text-deep outline-none focus:border-rose focus:ring-1 focus:ring-rose/20"
        />
      </div>

      {/* Category chips */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-b border-line px-4 py-2.5">
        {SHOP_CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`flex-shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-bold transition-colors ${cat === c ? "border-deep bg-deep text-white" : "border-line bg-white/70 text-ink-soft"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[200px] animate-pulse rounded-2xl bg-white/50" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="pt-16 text-center">
            <ShoppingBag size={40} className="mx-auto mb-3 text-ink-mute" />
            <p className="font-serif text-[16px] font-semibold text-deep">Nothing found</p>
            <p className="mt-1 text-[12px] text-ink-mute">Try a different category or search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((item) => {
              const qty = getQty(item.id);
              const tone = stockToneShop(item.stock);
              const stockColor = tone === "out" ? "text-rose" : tone === "low" ? "text-[#C06820]" : "text-sage-DEFAULT";
              const stockLabel = tone === "out" ? "Sold out" : tone === "low" ? `Only ${item.stock} left` : `${item.stock} in stock`;
              return (
                <div key={item.id} className={`flex flex-col rounded-2xl border border-line bg-white/70 p-3 ${item.stock === 0 ? "opacity-60" : ""}`}>
                  <div className="mb-2 flex items-start justify-between gap-1">
                    <span className="text-[32px]">{item.emoji}</span>
                    <div className="flex flex-wrap justify-end gap-1">
                      {item.isNew && <span className="rounded-lg bg-gold-pale px-1.5 py-[1px] text-[8px] font-bold text-gold">✦ New</span>}
                      {item.isLimited && <span className="rounded-lg bg-lav px-1.5 py-[1px] text-[8px] font-bold text-lav-deep">Limited</span>}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-serif text-[13px] font-bold leading-tight text-deep">{item.name}</div>
                    <div className="mt-0.5 text-[10px] font-semibold text-ink-mute">{item.category}</div>
                    <div className={`mt-1 text-[10px] font-bold ${stockColor}`}>{stockLabel}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-serif text-[15px] font-bold text-deep">₹{item.sellingPrice}</span>
                    {item.stock === 0 ? (
                      <span className="rounded-xl border border-line px-3 py-1.5 text-[11px] font-bold text-ink-mute">Sold out</span>
                    ) : qty === 0 ? (
                      <button
                        onClick={() => addToShopCart({ itemId: item.id, name: item.name, emoji: item.emoji, price: item.sellingPrice, quantity: 1 })}
                        className="rounded-xl bg-deep px-3 py-1.5 text-[11px] font-bold text-cream transition-transform active:scale-95"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => qty === 1 ? removeFromShopCart(item.id) : updateShopCartQty(item.id, qty - 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white/70 text-[13px] font-bold text-deep">
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-[13px] font-bold text-deep">{qty}</span>
                        <button onClick={() => updateShopCartQty(item.id, qty + 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white/70 text-[13px] font-bold text-deep">
                          <Plus size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="h-6" />
      </div>
    </div>
  );
}

// ── Scoops inventory ──────────────────────────────────────────────────────────

export function InventoryRoute() {
  const data: ScoopItem[] = SCOOP_ITEMS;
  const isLoading = false;
  const [tab, setTab] = useState<Tab>("all");
  const [badge, setBadge] = useState<Badge>("all");
  const parentRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(1);

  const items = useMemo(() => {
    const list = (data ?? []).filter((i) => {
      const tabOk = tab === "all" || i.tiers.includes(tab);
      const badgeOk =
        badge === "all" ||
        (badge === "new" && i.isNew) ||
        (badge === "lim" && i.isLimited) ||
        (badge === "avail" && i.stock > 0);
      return tabOk && badgeOk;
    });
    return list.sort((a, b) => {
      const aOut = a.stock <= 0 ? 1 : 0;
      const bOut = b.stock <= 0 ? 1 : 0;
      if (aOut !== bOut) return aOut - bOut;
      return b.stock - a.stock;
    });
  }, [data, tab, badge]);

  // Responsive column count, measured from the list container width.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      setCols(w >= 860 ? 3 : w >= 560 ? 2 : 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 132,
    overscan: 6,
    lanes: cols,
  });

  useEffect(() => {
    rowVirtualizer.measure();
  }, [cols, rowVirtualizer]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TopBar
        right={
          <span className="flex items-center gap-1.5 rounded-full border border-lav-deep bg-lav px-3 py-1.5 text-[11px] font-bold text-lav-deep">
            <Sparkles size={12} /> Week 26
          </span>
        }
      />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-gold-pale to-lav px-[18px] py-5 md:py-7">
        <div className="mx-auto w-full max-w-4xl">
          <span className="absolute right-5 top-4 text-[40px] text-gold/15">✦</span>
          <h2 className="font-serif text-[20px] font-bold text-deep md:text-[26px]">
            This week's scoops
          </h2>
          <p className="mt-1 text-[12px] font-semibold text-ink-soft md:text-[14px]">
            Live inventory · A surprise selection lands in every box
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-line">
        <div className="mx-auto flex w-full max-w-4xl px-4 pt-3">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 border-b-2 px-1.5 pb-2.5 pt-1 text-[12px] font-bold transition-colors md:text-[13px] ${
                tab === t.id ? "border-gold text-deep" : "border-transparent text-ink-mute"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Badge filters + count */}
      <div className="mx-auto w-full max-w-4xl">
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 py-2.5">
          {BADGES.map((b) => (
            <button
              key={b.id}
              onClick={() => setBadge(b.id)}
              className={`flex-shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[10px] font-bold transition-colors ${
                badge === b.id
                  ? "border-deep bg-deep text-white"
                  : "border-line bg-white/70 text-ink-soft"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
        <div className="px-4 pb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-ink-mute">
          {isLoading ? "Loading…" : `${items.length} items`}
        </div>
      </div>

      {/* Virtualized, responsive grid */}
      <div ref={parentRef} className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
        {isLoading ? (
          <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-2 pt-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-[116px] animate-pulse rounded-2xl bg-white/50" />
            ))}
          </div>
        ) : (
          <div
            ref={listRef}
            className="relative mx-auto w-full max-w-4xl"
            style={{ height: rowVirtualizer.getTotalSize() }}
          >
            {rowVirtualizer.getVirtualItems().map((v) => (
              <div
                key={items[v.index].id}
                className="absolute top-0 p-1"
                style={{
                  left: `${(v.lane / cols) * 100}%`,
                  width: `${100 / cols}%`,
                  height: v.size,
                  transform: `translateY(${v.start}px)`,
                }}
              >
                <ItemRow item={items[v.index]} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
