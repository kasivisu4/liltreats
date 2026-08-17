import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { Screen } from "../components/Screen";
import { useCartStore } from "../store/cartStore";

const SHOP_ITEMS = [
  { id: "si-01", name: "Butterfly Charm", category: "Jewellery", emoji: "🦋", sellingPrice: 149, stock: 24, minStock: 5, isNew: true, isLimited: false, description: "A delicate butterfly charm perfect for bracelets and necklaces. Made with enamel and gold-tone metal." },
  { id: "si-02", name: "Pearl Drop Earrings", category: "Jewellery", emoji: "💎", sellingPrice: 249, stock: 12, minStock: 5, isNew: false, isLimited: false, description: "Elegant faux pearl drop earrings with a gold-tone finish. Hypoallergenic hooks." },
  { id: "si-03", name: "Satin Hair Ribbon", category: "Hair", emoji: "🎀", sellingPrice: 99, stock: 30, minStock: 10, isNew: true, isLimited: false, description: "Soft satin ribbon in blush pink. Ties beautifully into bows for ponytails and braids." },
  { id: "si-04", name: "Gold Star Sticker Sheet", category: "Stationery", emoji: "⭐", sellingPrice: 79, stock: 50, minStock: 15, isNew: false, isLimited: true, description: "A sheet of 40+ gold foil star stickers. Great for journaling, planners, and gifting." },
  { id: "si-05", name: "Mini Tote Bag", category: "Accessories", emoji: "👜", sellingPrice: 349, stock: 8, minStock: 5, isNew: false, isLimited: true, description: "A sturdy mini canvas tote with a cute print. Perfect for carrying your liltreats haul." },
  { id: "si-06", name: "Claw Clip Set", category: "Hair", emoji: "🪬", sellingPrice: 129, stock: 0, minStock: 10, isNew: false, isLimited: false, description: "Set of 3 resin claw clips in pastel shades. Strong hold for all hair types." },
  { id: "si-07", name: "Pressed Flower Bookmark", category: "Stationery", emoji: "🌸", sellingPrice: 59, stock: 40, minStock: 10, isNew: true, isLimited: false, description: "Laminated bookmark with real pressed flowers. Each one is unique and handcrafted." },
  { id: "si-08", name: "Beaded Bracelet", category: "Jewellery", emoji: "📿", sellingPrice: 199, stock: 16, minStock: 5, isNew: false, isLimited: false, description: "Stretchy beaded bracelet with mixed pastel and gold beads. One size fits most." },
  { id: "si-09", name: "Pastel Lip Balm", category: "Beauty", emoji: "💋", sellingPrice: 119, stock: 22, minStock: 8, isNew: true, isLimited: false, description: "Moisturising lip balm in strawberry and vanilla scents. Comes in a cute pastel tube." },
  { id: "si-10", name: "Washi Tape Roll", category: "Stationery", emoji: "🎨", sellingPrice: 89, stock: 35, minStock: 10, isNew: false, isLimited: false, description: "Decorative washi tape with floral patterns. Great for planners, gifts, and crafts." },
];

export function ShopItemRoute() {
  const { itemId } = useParams({ strict: false }) as { itemId: string };
  const navigate = useNavigate();
  const addToShopCart = useCartStore((s) => s.addToShopCart);
  const shopCart = useCartStore((s) => s.shopCart);

  const item = SHOP_ITEMS.find((i) => i.id === itemId);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <div className="mb-3 text-[48px]">🔍</div>
        <h2 className="font-serif text-[20px] font-bold text-deep">Item not found</h2>
        <button onClick={() => navigate({ to: "/shop" })} className="btn-main mt-4">Back to shop</button>
      </div>
    );
  }

  const inCart = shopCart.find((i) => i.itemId === item.id);
  const isOutOfStock = item.stock === 0;
  const isLowStock = item.stock > 0 && item.stock <= item.minStock;

  function handleAddToCart() {
    if (isOutOfStock) return;
    addToShopCart({ itemId: item.id, name: item.name, emoji: item.emoji, price: item.sellingPrice, quantity: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Screen top={
      <div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-cream/95">
        <button onClick={() => navigate({ to: "/shop" })} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white/70">
          <ChevronLeft size={18} className="text-deep" />
        </button>
        <span className="font-serif text-[16px] font-bold text-deep flex-1">{item.name}</span>
        {inCart && (
          <button onClick={() => navigate({ to: "/cart" })} className="flex items-center gap-1.5 rounded-full border border-line bg-white/70 px-3 py-1.5">
            <ShoppingBag size={14} className="text-deep" />
            <span className="text-[11px] font-bold text-deep">{shopCart.reduce((s, i) => s + i.quantity, 0)}</span>
          </button>
        )}
      </div>
    }>
      <div className="pb-10">
        {/* Image area */}
        <div className="flex h-[220px] items-center justify-center bg-gradient-to-br from-[#F7EDD4] to-[#F2DCE4]">
          <span className="text-[90px]">{item.emoji}</span>
        </div>

        <div className="p-5">
          {/* Badges */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {item.isNew && <span className="rounded-full bg-gold-pale px-2.5 py-0.5 text-[10px] font-bold text-gold">✦ New</span>}
            {item.isLimited && <span className="rounded-full bg-lav px-2.5 py-0.5 text-[10px] font-bold text-lav-deep">Limited edition</span>}
            <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-bold text-ink-soft border border-line">{item.category}</span>
          </div>

          <h1 className="font-serif text-[24px] font-bold text-deep">{item.name}</h1>
          <div className="mt-2 font-serif text-[28px] font-bold text-deep">₹{item.sellingPrice.toLocaleString("en-IN")}</div>

          {/* Stock status */}
          <div className="mt-2">
            {isOutOfStock
              ? <span className="inline-block rounded-lg bg-[#FFE8E8] px-3 py-1 text-[11px] font-bold text-[#C03040]">Out of stock</span>
              : isLowStock
              ? <span className="inline-block rounded-lg bg-[#FFF3E0] px-3 py-1 text-[11px] font-bold text-[#C06020]">Only {item.stock} left</span>
              : <span className="inline-block rounded-lg bg-[#E8F4E8] px-3 py-1 text-[11px] font-bold text-[#2A6030]">In stock ({item.stock} available)</span>}
          </div>

          {/* Description */}
          <div className="mt-4 rounded-2xl border border-line bg-white/60 p-4">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-ink-mute">About this item</div>
            <p className="text-[13px] font-semibold leading-relaxed text-deep">{item.description}</p>
          </div>

          {/* Quantity selector */}
          {!isOutOfStock && (
            <div className="mt-5">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-mute">Quantity</div>
              <div className="flex items-center gap-3">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white/70 disabled:opacity-30"
                  disabled={qty <= 1}>
                  <Minus size={16} className="text-deep" />
                </button>
                <span className="w-8 text-center font-serif text-[20px] font-bold text-deep">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(item.stock, q + 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white/70 disabled:opacity-30"
                  disabled={qty >= item.stock}>
                  <Plus size={16} className="text-deep" />
                </button>
                <span className="text-[12px] font-semibold text-ink-mute">
                  Total: <span className="font-bold text-deep">₹{(item.sellingPrice * qty).toLocaleString("en-IN")}</span>
                </span>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-6 space-y-2">
            {isOutOfStock
              ? <button disabled className="btn-main w-full cursor-not-allowed opacity-50">Out of stock</button>
              : <>
                  <button onClick={handleAddToCart} className={`btn-main w-full transition-all ${added ? "bg-[#2A6030]" : ""}`}>
                    {added ? "Added to cart ✓" : `Add to cart · ₹${(item.sellingPrice * qty).toLocaleString("en-IN")}`}
                  </button>
                  <button onClick={() => { handleAddToCart(); navigate({ to: "/cart" }); }} className="btn-outline w-full">Buy now</button>
                </>}
          </div>
        </div>
      </div>
    </Screen>
  );
}
