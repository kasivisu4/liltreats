import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { QrCode, CreditCard, Wallet, CircleX } from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { TIER_BY_ID, VIDEO_ADDON_PRICE } from "../data/tiers";
import { SHIPPING_FLAT, useCartStore } from "../store/cartStore";
import { useCreateOrder } from "../api/queries";
import type { ContactDetails } from "../store/cartStore";

const PAYMENTS = [
  { id: "upi", name: "UPI", sub: "GPay · PhonePe · Paytm", icon: QrCode, bg: "bg-[#EEF0FF]", color: "text-[#3040A0]" },
  { id: "card", name: "Card", sub: "Debit / Credit / NetBanking", icon: CreditCard, bg: "bg-[#EEF5EE]", color: "text-[#206030]" },
  { id: "wallet", name: "Wallet", sub: "Paytm · Amazon Pay", icon: Wallet, bg: "bg-gold-pale", color: "text-gold" },
] as const;

export function CartRoute() {
  const navigate = useNavigate();
  const selectedTier = useCartStore((s) => s.selectedTier);
  const videoAddon = useCartStore((s) => s.videoAddon);
  const vibes = useCartStore((s) => s.vibes);
  const favCategories = useCartStore((s) => s.favCategories);
  const contact = useCartStore((s) => s.contact);
  const setContactField = useCartStore((s) => s.setContactField);
  const payment = useCartStore((s) => s.paymentMethod);
  const setPayment = useCartStore((s) => s.setPaymentMethod);
  const setLastOrder = useCartStore((s) => s.setLastOrder);

  const createOrder = useCreateOrder();

  useEffect(() => {
    if (!selectedTier) navigate({ to: "/" });
  }, [selectedTier, navigate]);

  if (!selectedTier) return null;
  const tier = TIER_BY_ID(selectedTier);

  const total = tier.price + SHIPPING_FLAT + (videoAddon ? VIDEO_ADDON_PRICE : 0);
  const itemsPreview =
    favCategories.length > 0
      ? favCategories.slice(0, 3)
      : vibes.length > 0
        ? vibes.slice(0, 2)
        : ["Curated surprise"];

  const canSubmit = contact.name.trim() && contact.phone.trim() && !createOrder.isPending;

  async function placeOrder() {
    if (!canSubmit) return;
    const order = await createOrder.mutateAsync({
      tierId: tier.id,
      videoAddon,
      shipping: SHIPPING_FLAT,
      itemsPreview,
      area: contact.area,
    });
    setLastOrder(order);
    navigate({ to: "/confirm" });
  }

  const field = (
    label: string,
    key: keyof ContactDetails,
    placeholder: string,
    type = "text",
  ) => (
    <div>
      <label className="field-label">{label}</label>
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
    <Screen top={<TopBar title="Your cart" showBack />}>
      <div className="p-4">
        {/* Summary */}
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-ink-mute">
          Order summary
        </div>
        <div className="card-glass mb-4 p-4">
          <div className="mb-2.5 flex items-center gap-3 border-b border-line pb-2.5">
            <span className="text-[28px]">{tier.icon}</span>
            <div>
              <div className="font-serif text-[15px] font-semibold text-deep">{tier.name}</div>
              <div className="text-[12px] font-semibold text-ink-soft">{tier.itemsLabel}</div>
            </div>
            <div className="ml-auto font-serif text-[20px] font-bold text-deep">
              ₹{tier.price.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="space-y-1.5 text-[13px]">
            {videoAddon && (
              <Row k="Video recording" v={`+₹${VIDEO_ADDON_PRICE}`} />
            )}
            <Row k="Shipping" v={`₹${SHIPPING_FLAT}`} />
            <div className="flex items-center justify-between border-t border-line pt-2">
              <span className="font-bold text-deep">Total</span>
              <span className="font-serif text-[17px] font-bold text-deep">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-ink-mute">
          Delivery · Hyderabad
        </div>
        <div className="card-glass mb-4 space-y-3 p-4">
          {field("Full name", "name", "Your name")}
          {field("WhatsApp number", "phone", "+91 98765 43210", "tel")}
          {field("Instagram handle (for tagging)", "instagram", "@yourhandle")}
          {field("Flat / Building", "building", "Flat no., building name")}
          {field("Area", "area", "Banjara Hills, Jubilee Hills, Kondapur…")}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="field-label">City</label>
              <input className="field-input !bg-[rgba(240,230,220,0.6)] font-bold !text-gold" value="Hyderabad" readOnly />
            </div>
            <div>
              <label className="field-label">PIN code</label>
              <input
                className="field-input"
                value={contact.pin}
                onChange={(e) => setContactField("pin", e.target.value)}
                placeholder="500034"
              />
            </div>
          </div>
          {field("Note (gift message, instructions)", "note", "Optional")}
        </div>

        {/* Payment */}
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-ink-mute">
          Payment
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
        <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-[#F0C0C0] bg-[#FFF0F0] px-3.5 py-2.5">
          <CircleX size={18} className="flex-shrink-0 text-[#C03040]" />
          <p className="text-[12px] font-bold leading-snug text-[#802030]">
            No Cash on Delivery — prepaid orders only (UPI · Card · Wallet)
          </p>
        </div>

        {createOrder.isError && (
          <p className="mb-3 text-center text-[12px] font-bold text-[#B02840]">
            {(createOrder.error as Error).message}
          </p>
        )}

        <button onClick={placeOrder} disabled={!canSubmit} className="btn-main">
          {createOrder.isPending ? "Placing order…" : `Place order · ₹${total.toLocaleString("en-IN")} ✦`}
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
