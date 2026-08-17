import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, ShoppingBag } from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { useCartStore } from "../store/cartStore";

// Self-contained shop items — wired to real API in Module 30
const SHOP_ITEMS = [
  { id: "si-01", name: "Butterfly Charm", category: "Jewellery", emoji: "🦋", sellingPrice: 149, costPrice: 60, stock: 24, minStock: 5, isNew: true, isLimited: false, isFeatured: true },
  { id: "si-02", name: "Pearl Drop Earrings", category: "Jewellery", emoji: "💎", sellingPrice: 249, costPrice: 90, stock: 12, minStock: 5, isNew: false, isLimited: false, isFeatured: true },
  { id: "si-03", name: "Satin Hair Ribbon", category: "Hair", emoji: "🎀", sellingPrice: 99, costPrice: 30, stock: 30, minStock: 10, isNew: true, isLimited: false, isFeatured: false },
  { id: "si-04", name: "Gold Star Sticker Sheet", category: "Stationery", emoji: "⭐", sellingPrice: 79, costPrice: 20, stock: 50, minStock: 15, isNew: false, isLimited: true, isFeatured: false },
  { id: "si-05", name: "Mini Tote Bag", category: "Accessories", emoji: "👜", sellingPrice: 349, costPrice: 130, stock: 8, minStock: 5, isNew: false, isLimited: true, isFeatured: true },
  { id: "si-06", name: "Claw Clip Set", category: "Hair", emoji: "🪬", sellingPrice: 129, costPrice: 45, stock: 0, minStock: 10, isNew: false, isLimited: false, isFeatured: false },
  { id: "si-07", name: "Pressed Flower Bookmark", category: "Stationery", emoji: "🌸", sellingPrice: 59, costPrice: 18, stock: 40, minStock: 10, isNew: true, isLimited: false, isFeatured: false },
  { id: "si-08", name: "Beaded Bracelet", category: "Jewellery", emoji: "📿", sellingPrice: 199, costPrice: 70, stock: 16, minStock: 5, isNew: false, isLimited: false, isFeatured: true },
  { id: "si-09", name: "Pastel Lip Balm", category: "Beauty", emoji: "💋", sellingPrice: 119, costPrice: 40, stock: 22, minStock: 8, isNew: true, isLimited: false, isFeatured: false },
  { id: "si-10", name: "Washi Tape Roll", category: "Stationery", emoji: "🎨", sellingPrice: 89, costPrice: 28, stock: 35, minStock: 10, isNew: false, isLimited: false, isFeatured: false },
];

const CATEGORIES = ["All", "Jewellery", "Hair", "Accessories", "Beauty", "Stationery"];
type SortOption = "newest" | "price_asc" | "price_desc" | "popular";

function StockBadge({ stock, minStock }: { stock: number; minStock: number }) {
  if (stock === 0) return <span className="rounded-lg bg-[#FFE8E8] px-2 py-0.5 text-[10px] font-bold text-[#C03040]">Out of stock</span>;
  if (stock <= minStock) return <span className="rounded-lg bg-[#FFF3E0] px-2 py-0.5 text-[10px] font-bold text-[#C06020]">Only {stock} left</span>;
  return <span className="rounded-lg bg-[#E8F4E8] px-2 py-0.5 text-[10px] font-bold text-[#2A6030]">In stock</span>;
}

function ItemCard({ item }: { item: typeof SHOP_ITEMS[0] }) {
  const navigate = useNavigate();
  const addToShopCart = useCartStore((s) => s.addToShopCart);
  const shopCart = useCartStore((s) => s.shopCart);
  const inCart = shopCart.find((i) => i.itemId === item.id);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white/70 shadow-sm transition-transform active:scale-[0.98]">
      <button onClick={() => navigate({ to: "/shop/$itemId", params: { itemId: item.id } })}
        className="flex h-[120px] items-center justify-center bg-gradient-to-br from-[#F7EDD4] to-[#F2DCE4]">
        <span className="text-[48px]">{item.emoji}</span>
      </button>
      <div className="flex flex-1 flex-col p-3">
        <div className="mb-1 flex flex-wrap gap-1">
          {item.isNew && <span className="rounded-md bg-gold-pale px-1.5 py-[1px] text-[9px] font-bold text-gold">✦ New</span>}
          {item.isLimited && <span className="rounded-md bg-lav px-1.5 py-[1px] text-[9px] font-bold text-lav-deep">Limited</span>}
        </div>
        <button onClick={() => navigate({ to: "/shop/$itemId", params: { itemId: item.id } })}
          className="mb-0.5 text-left font-serif text-[13px] font-bold leading-tight text-deep">{item.name}</button>
        <div className="mb-1.5 text-[10px] font-semibold text-ink-mute">{item.category}</div>
        <StockBadge stock={item.stock} minStock={item.minStock} />
        <div className="mt-auto pt-2">
          <div className="mb-2 font-serif text-[16px] font-bold text-deep">₹{item.sellingPrice.toLocaleString("en-IN")}</div>
          <button onClick={() => { if (item.stock === 0) return; addToShopCart({ itemId: item.id, name: item.name, emoji: item.emoji, price: item.sellingPrice, quantity: 1 }); }}
            disabled={item.stock === 0}
            className={`w-full rounded-xl py-2 text-[12px] font-bold transition-all ${item.stock === 0 ? "cursor-not-allowed bg-[#F0E8E8] text-ink-mute" : inCart ? "bg-[#E8F4E8] text-[#2A6030]" : "bg-deep text-cream"}`}>
            {item.stock === 0 ? "Out of stock" : inCart ? `In cart (${inCart.quantity})` : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShopRoute() {
  const shopCart = useCartStore((s) => s.shopCart);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortOption>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...SHOP_ITEMS];
    if (search) list = list.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    if (category !== "All") list = list.filter((i) => i.category === category);
    if (sort === "price_asc") list.sort((a, b) => a.sellingPrice - b.sellingPrice);
    else if (sort === "price_desc") list.sort((a, b) => b.sellingPrice - a.sellingPrice);
    else if (sort === "popular") list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    list.sort((a, b) => (a.stock === 0 ? 1 : 0) - (b.stock === 0 ? 1 : 0));
    return list;
  }, [search, category, sort]);

  const cartCount = shopCart.reduce((s, i) => s + i.quantity, 0);

  return (
    <Screen top={<TopBar title="Shop" right={cartCount > 0 ? (
      <button onClick={() => navigate({ to: "/cart" })} className="relative flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-3 py-1.5">
        <ShoppingBag size={14} className="text-deep" />
        <span className="text-[11px] font-bold text-deep">{cartCount}</span>
      </button>
    ) : undefined} />}>
      <div className="bg-gradient-to-br from-[#F7EDD4] to-[#F2DCE4] px-4 py-5">
        <h2 className="font-serif text-[22px] font-bold text-deep">Individual Items</h2>
        <p className="mt-0.5 text-[12px] font-semibold text-ink-soft">Jewellery, accessories, trinkets & more</p>
      </div>

      <div className="border-b border-line bg-white/50 px-4 py-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search items…" className="field-input !pl-8 !py-2" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[12px] font-bold transition-colors ${showFilters ? "border-deep bg-deep text-white" : "border-line bg-white/70 text-deep"}`}>
            <SlidersHorizontal size={13} /> Filter
          </button>
        </div>
        {showFilters && (
          <div className="mt-3 space-y-2">
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-mute">Category</div>
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
                {CATEGORIES.map((c) => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`flex-shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold transition-colors ${category === c ? "border-deep bg-deep text-white" : "border-line bg-white/70 text-ink-soft"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-mute">Sort by</div>
              <div className="grid grid-cols-2 gap-1.5">
                {([["newest", "Newest"], ["popular", "Popular"], ["price_asc", "Price: Low → High"], ["price_desc", "Price: High → Low"]] as [SortOption, string][]).map(([val, label]) => (
                  <button key={val} onClick={() => setSort(val)}
                    className={`rounded-xl border py-1.5 text-[11px] font-bold transition-colors ${sort === val ? "border-gold bg-gold-pale text-deep" : "border-line bg-white/70 text-ink-soft"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-3 text-[11px] font-bold text-ink-mute">{filtered.length} items</div>
        {filtered.length === 0
          ? <div className="pt-10 text-center"><div className="text-[40px]">🔍</div><p className="mt-2 font-serif text-[16px] font-bold text-deep">No items found</p><p className="mt-1 text-[12px] text-ink-mute">Try clearing your filters</p></div>
          : <div className="grid grid-cols-2 gap-3">{filtered.map((item) => <ItemCard key={item.id} item={item} />)}</div>}
        <div className="h-6" />
      </div>
    </Screen>
  );
}
