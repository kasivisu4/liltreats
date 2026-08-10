import { useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ShoppingBag, ArrowLeft, Minus, Plus } from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { useIndividualItems } from "../api/queries";
import { useCartStore } from "../store/cartStore";

export function ShopItemRoute() {
  const { itemId } = useParams({ strict: false }) as { itemId?: string };
  const navigate = useNavigate();
  const { data: items = [] } = useIndividualItems();
  const addToShopCart = useCartStore((s) => s.addToShopCart);
  const shopCart = useCartStore((s) => s.shopCart);

  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const item = items.find((i) => i.id === itemId);
  const inCart = shopCart.find((i) => i.itemId === itemId);

  if (!item) {
    return (
      <Screen top={<TopBar title="Item" showBack />}>
        <div className="flex flex-col items-center justify-center p-8 pt-20 text-center">
          <span className="text-[48px]">🔍</span>
          <h3 className="mt-3 font-serif text-[18px] font-bold text-deep">Item not found</h3>
          <button onClick={() => navigate({ to: "/shop" })} className="btn-main mt-6">
            Back to shop
          </button>
        </div>
      </Screen>
    );
  }

  function handleAdd() {
    addToShopCart({
      itemId: item!.id,
      name: item!.name,
      emoji: item!.emoji,
      price: item!.sellingPrice,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const outOfStock = item.stock === 0;

  return (
    <Screen top={<TopBar title={item.name} showBack />}>
      <div className="pb-24">
        {/* Hero image / emoji */}
        <div className="flex h-[220px] items-center justify-center bg-gradient-to-br from-[#F7EDD4] to-[#F2DCE4]">
          <span className="text-[80px]">{item.emoji}</span>
        </div>

        <div className="p-4">
          {/* Badges */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {item.isNew && (
              <span className="rounded-full bg-gold-pale px-2.5 py-1 text-[10px] font-bold text-gold">
                ✦ New arrival
              </span>
            )}
            {item.isLimited && (
              <span className="rounded-full bg-lav px-2.5 py-1 text-[10px] font-bold text-lav-deep">
                Limited edition
              </span>
            )}
            <span className="rounded-full border border-line bg-white/70 px-2.5 py-1 text-[10px] font-bold text-ink-soft">
              {item.category}
            </span>
          </div>

          <h1 className="font-serif text-[22px] font-bold text-deep">{item.name}</h1>
          <p className="mt-1 text-[13px] font-semibold leading-relaxed text-ink-soft">
            {item.description}
          </p>

          {/* Stock */}
          <div className="mt-3">
            {outOfStock ? (
              <span className="rounded-xl bg-[#FFE8E8] px-3 py-1.5 text-[12px] font-bold text-[#C03040]">
                Out of stock
              </span>
            ) : item.stock <= item.minStock ? (
              <span className="rounded-xl bg-[#FFF3E0] px-3 py-1.5 text-[12px] font-bold text-[#C06020]">
                Only {item.stock} left
              </span>
            ) : (
              <span className="rounded-xl bg-[#E8F4E8] px-3 py-1.5 text-[12px] font-bold text-[#2A6030]">
                In stock ({item.stock} units)
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-4 font-serif text-[28px] font-bold text-deep">
            ₹{item.sellingPrice.toLocaleString("en-IN")}
          </div>

          {/* SKU */}
          <div className="mt-1 text-[10px] font-semibold text-ink-mute">SKU: {item.sku}</div>

          {/* Quantity selector */}
          {!outOfStock && (
            <div className="mt-5">
              <div className="mb-2 text-[12px] font-bold text-deep">Quantity</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/70"
                >
                  <Minus size={14} className="text-deep" />
                </button>
                <span className="w-8 text-center font-serif text-[18px] font-bold text-deep">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(item!.stock, q + 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/70"
                >
                  <Plus size={14} className="text-deep" />
                </button>
                <span className="text-[12px] font-semibold text-ink-mute">
                  Max: {item.stock}
                </span>
              </div>
            </div>
          )}

          {/* Cart status */}
          {inCart && (
            <div className="mt-3 rounded-xl border border-[#B0DEB8] bg-[#E8F4EA] px-3 py-2 text-[12px] font-bold text-[#2A6030]">
              Already in cart: {inCart.quantity} unit{inCart.quantity !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-cream/95 p-4 backdrop-blur-sm">
        <div className="flex gap-3">
          <button
            onClick={() => navigate({ to: "/shop" })}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-line bg-white/70"
          >
            <ArrowLeft size={16} className="text-deep" />
          </button>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 font-serif text-[14px] font-bold transition-all ${
              added
                ? "bg-[#2A6030] text-white"
                : outOfStock
                ? "cursor-not-allowed bg-[#F0E8E8] text-ink-mute"
                : "bg-deep text-cream shadow-soft"
            }`}
          >
            <ShoppingBag size={16} />
            {added
              ? "Added to cart ✓"
              : outOfStock
              ? "Out of stock"
              : `Add ${qty > 1 ? `${qty} × ` : ""}to cart · ₹${(item.sellingPrice * qty).toLocaleString("en-IN")}`}
          </button>
        </div>
      </div>
    </Screen>
  );
}
