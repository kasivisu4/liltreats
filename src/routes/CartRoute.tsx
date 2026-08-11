import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { QrCode, CreditCard, Wallet, CircleX, Video, Trash2 } from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { TIER_BY_ID, VIDEO_ADDON_PRICE } from "../data/tiers";
import { SHIPPING_FLAT, useCartStore } from "../store/cartStore";
import { useCreateOrder } from "../api/queries";
import type { ContactDetails } from "../store/cartStore";

// Inline StepIndicator — avoids import from a file not in the build snapshot
function StepIndicator({ current }: { current: number }) {
  const steps = ["Choose scoop", "Preferences", "Checkout"];
  return (
    <div className="flex items-center justify-center gap-0 border-b border-line bg-white/60 px-4 py-2.5">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${done ? "bg-sage-DEFAULT text-white" : active ? "bg-deep text-white" : "bg-line text-ink-mute"}`}>
                {done ? "✓" : i + 1}
              </div>
              <span className={`mt-0.5 text-[9px] font-bold ${active ? "text-deep" : "text-ink-mute"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className={`mx-1.5 mb-3 h-[2px] w-8 rounded-full ${done ? "bg-sage-DEFAULT" : "bg-line"}`} />}
          </div>
        );
      })}
    </div>
  );
}

const PAYMENTS = [
  { id: "upi", name: "UPI", sub: "GPay · PhonePe · Paytm", icon: QrCode, bg: "bg-[#EEF0FF]", color: "text-[#3040A0]" },
  { id: "card", name: "Card", sub: "Debit / Credit / NetBanking", icon: CreditCard, bg: "bg-[#EEF5EE]", color: "text-[#206030]" },
  { id: "wallet", name: "Wallet", sub: "Paytm · Amazon Pay", icon: Wallet, bg: "bg-gold-pale", color: "text-gold" },
] as const;

export function CartRoute() {
  const navigate = useNavigate();
  const selectedTier = useCartStore((s) => s.selectedTier);
  const videoAddon = useCartStore((s) => s.videoAddon);
  const selectedVideoSlotId = useCartStore((s) => s.selectedVideoSlotId);
  const selectedVideoDate = useCartStore((s) => s.selectedVideoDate);
  const selectedVideoTime = useCartStore((s) => s.selectedVideoTime);
  const vibes = useCartStore((s) => s.vibes);
  const favCategories = useCartStore((s) => s.favCategories);
  const contact = useCartStore((s) => s.contact);
  const setContactField = useCartStore((s) => s.setContactField);
  const payment = useCartStore((s) => s.paymentMethod);
  const setPayment = useCartStore((s) => s.setPaymentMethod);
  const shopCart = useCartStore((s) => s.shopCart);
  const updateShopCartQty = useCartStore((s) => s.updateShopCartQty);
  const removeFromShopCart = useCartStore((s) => s.removeFromShopCart);
  const setLastOrder = useCartStore((s) => s.setLastOrder);

  const createOrder = useCreateOrder();

  useEffect(() => {
    if (!selectedTier) navigate({ to: "/" });
  }, [selectedTier, navigate]);

  if (!selectedTier) return null;
  const tier = TIER_BY_ID(selectedTier);

  const shopTotal = shopCart.reduce((s, i) => s + i.price * i.quantity, 0);
  const videoPrice = videoAddon ? VIDEO_ADDON_PRICE : 0;
  const total = tier.price + SHIPPING_FLAT + videoPrice + shopTotal;

  const itemsPreview =
    favCategories.length > 0
      ? favCategories.slice(0, 3)
      : vibes.length > 0
        ? vibes.slice(0, 2)
        : ["Curated surprise"];

  const canSubmit =
    contact.name.trim() &&
    contact.phone.trim() &&
    contact.building.trim() &&
    contact.area.trim() &&
    contact.pin.trim() &&
    (!videoAddon || !!selectedVideoSlotId) &&
    !createOrder.isPending;

  async function placeOrder() {
    if (!canSubmit) return;
    const order = await createOrder.mutateAsync({
      tierId: tier.id,
      videoAddon,
      videoSlotId: selectedVideoSlotId,
      shipping: SHIPPING_FLAT,
      itemsPreview,
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      instagram: contact.instagram,
      building: contact.building,
      area: contact.area,
      pin: contact.pin,
      note: contact.note,
      paymentMethod: payment,
      discount: 0,
    } as Parameters<typeof createOrder.mutateAsync>[0]);
    setLastOrder(order);
    navigate({ to: "/confirm" });
  }

  const field = (
    label: string,
    key: keyof ContactDetails,
    placeholder: string,
    type = "text",
    required = false,
  ) => (
    <div>
      <label className="field-label">
        {label}
        {required && <span className="ml-0.5 text-rose">*</span>}
      </label>
      <input
        className="field-input"
        type={type}
        value={contact[key]}
        onChange={(e) => setContactField(key, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <Screen top={<TopBar title="Checkout" showBack />}>
      <StepIndicator current={2} />

      <div className="p-4">
        {/* Scoop summary */}
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-ink-mute">
          Your order
        </div>
        <div className="card-glass mb-4 p-4">
          <div className="mb-2.5 flex items-center gap-3 border-b border-line pb-2.5">
            <span className="text-[28px]">{tier.icon}</span>
            <div className="flex-1">
              <div className="font-serif text-[15px] font-semibold text-deep">{tier.name}</div>
              <div className="text-[12px] font-semibold text-ink-soft">{tier.itemsLabel}</div>
            </div>
            <div className="font-serif text-[20px] font-bold text-deep">
              ₹{tier.price.toLocaleString("en-IN")}
            </div>
          </div>

          {videoAddon && (
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-rose/20 bg-[#FFF0F4] px-3 py-2">
              <Video size={14} className="flex-shrink-0 text-rose" />
              <div className="flex-1 text-[12px] font-bold text-deep">Video recording</div>
              {selectedVideoDate && (
                <div className="text-right text-[11px] font-semibold text-ink-soft">
                  <div>{new Date(selectedVideoDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                  <div>{selectedVideoTime}</div>
                </div>
              )}
              <div className="text-[13px] font-bold text-rose">+₹{VIDEO_ADDON_PRICE}</div>
            </div>
          )}

          {/* Individual items in cart */}
          {shopCart.length > 0 && (
            <div className="mb-2 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wide text-ink-mute">
                Individual items
              </div>
              {shopCart.map((item) => (
                <div key={item.itemId} className="flex items-center gap-2">
                  <span className="text-[16px]">{item.emoji}</span>
                  <div className="flex-1 text-[12px] font-semibold text-deep">{item.name}</div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateShopCartQty(item.itemId, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-white/70 text-[12px] font-bold text-deep"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-[12px] font-bold text-deep">{item.quantity}</span>
                    <button
                      onClick={() => updateShopCartQty(item.itemId, item.quantity + 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-white/70 text-[12px] font-bold text-deep"
                    >
                      +
                    </button>
                  </div>
                  <div className="w-16 text-right text-[12px] font-bold text-deep">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </div>
                  <button onClick={() => removeFromShopCart(item.itemId)}>
                    <Trash2 size={13} className="text-ink-mute" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 space-y-1.5 border-t border-line pt-2.5 text-[13px]">
            {shopTotal > 0 && <Row k="Items subtotal" v={`₹${shopTotal.toLocaleString("en-IN")}`} />}
            <Row k="Shipping" v={`₹${SHIPPING_FLAT}`} />
            <div className="flex items-center justify-between border-t border-line pt-2">
              <span className="font-bold text-deep">Total</span>
              <span className="font-serif text-[17px] font-bold text-deep">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery address */}
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-ink-mute">
          Delivery details
        </div>
        <div className="card-glass mb-4 space-y-3 p-4">
          {field("Full name", "name", "Your name", "text", true)}
          {field("WhatsApp number", "phone", "+91 98765 43210", "tel", true)}
          {field("Email", "email", "your@email.com", "email")}
          {field("Instagram handle", "instagram", "@yourhandle")}
          {field("Flat / Building", "building", "Flat no., building name", "text", true)}
          {field("Area / Locality", "area", "Banjara Hills, Kondapur…", "text", true)}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="field-label">City</label>
              <input className="field-input !bg-[rgba(240,230,220,0.6)] font-bold !text-gold" value="Hyderabad" readOnly />
            </div>
            <div>
              <label className="field-label">
                PIN code<span className="ml-0.5 text-rose">*</span>
              </label>
              <input
                className="field-input"
                value={contact.pin}
                onChange={(e) => setContactField("pin", e.target.value)}
                placeholder="500034"
              />
            </div>
          </div>
          {field("Gift message / note", "note", "Optional")}
        </div>

        {/* Payment */}
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-ink-mute">
          Payment method
        </div>
        <div className="card-glass mb-3 p-4">
          {PAYMENTS.map(({ id, name, sub, icon: Icon, bg, color }) => (
            <label
              key={id}
              className="flex cursor-pointer items-center gap-3 border-b border-line py-2.5 last:border-none"
            >
              <input
                type="radio"
                name="payment"
                checked={payment === id}
                onChange={() => setPayment(id)}
                className="h-4 w-4 flex-shrink-0 accent-gold"
              />
              <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={18} className={color} />
              </span>
              <span>
                <span className="block text-[13px] font-bold text-ink">{name}</span>
                <span className="block text-[11px] font-semibold text-ink-mute">{sub}</span>
              </span>
            </label>
          ))}
          {payment === "upi" && (
            <input
              className="field-input mt-2"
              placeholder="yourname@okaxis or phone@ybl"
            />
          )}
        </div>

        {/* No COD */}
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-[#F0C0C0] bg-[#FFF0F0] px-3.5 py-2.5">
          <CircleX size={18} className="flex-shrink-0 text-[#C03040]" />
          <p className="text-[12px] font-bold leading-snug text-[#802030]">
            No Cash on Delivery — prepaid orders only
          </p>
        </div>

        {videoAddon && !selectedVideoSlotId && (
          <div className="mb-3 rounded-xl border border-gold/40 bg-gold-pale px-3 py-2.5 text-[12px] font-bold text-deep">
            ⚠ Please go back and select a video date & slot before placing your order.
          </div>
        )}

        {createOrder.isError && (
          <p className="mb-3 text-center text-[12px] font-bold text-[#B02840]">
            {(createOrder.error as Error).message}
          </p>
        )}

        <button onClick={placeOrder} disabled={!canSubmit} className="btn-main">
          {createOrder.isPending
            ? "Placing order…"
            : `Place order · ₹${total.toLocaleString("en-IN")} ✦`}
        </button>
        <p className="mb-5 mt-2 text-center text-[11px] font-semibold leading-relaxed text-ink-mute">
          Secure prepaid checkout · Cancellations accepted before 24 hrs
        </p>
      </div>
    </Screen>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-semibold text-ink-soft">{k}</span>
      <span className="font-bold text-deep">{v}</span>
    </div>
  );
}
