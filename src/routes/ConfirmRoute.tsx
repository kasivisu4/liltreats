import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Instagram, MessageCircle } from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { Confetti } from "../components/Confetti";
import { useCartStore } from "../store/cartStore";

export function ConfirmRoute() {
  const navigate = useNavigate();
  const order = useCartStore((s) => s.lastOrder);
  const resetBooking = useCartStore((s) => s.resetBooking);

  useEffect(() => {
    if (!order) navigate({ to: "/" });
  }, [order, navigate]);

  if (!order) return null;

  return (
    <Screen top={<TopBar />}>
      <div className="relative p-4">
        <Confetti />

        <div className="relative mb-5 mt-2 text-center">
          <motion.span
            className="inline-block text-[56px]"
            initial={{ scale: 0.5 }}
            animate={{ scale: [0.5, 1.15, 1] }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            🎊
          </motion.span>
          <h2 className="mt-2.5 font-serif text-[24px] font-bold text-deep">
            Your scoop is reserved!
          </h2>
          <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-ink-soft">
            We'll WhatsApp you to confirm delivery.
            <br />
            Watch <span className="font-bold text-mauve">@_liltreats_</span> for your unboxing reveal.
          </p>
        </div>

        <div className="card-glass mb-3.5 p-4">
          <ConfRow k="Order" v={order.id} />
          <ConfRow k="Scoop tier" v={`${order.icon} ${order.tierName}`} />
          <ConfRow k="Vibe" v={order.itemsPreview.join(", ")} />
          <ConfRow k="Video add-on" v={order.videoAddon ? "Added (+₹99)" : "Not added"} />
          <ConfRow k="Shipping" v={`₹${order.shipping}`} />
          <ConfRow
            k="Total paid"
            v={`₹${order.total.toLocaleString("en-IN")}`}
            highlight
          />
          <ConfRow k="Delivery" v={`${order.area} · This week`} />
          <ConfRow k="Status" v="Confirmed ✓" success last />
        </div>

        <div className="mb-3.5 flex gap-2">
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-lav-deep/40 bg-white/70 py-2.5 text-[12px] font-bold text-lav-deep">
            <Instagram size={14} /> Share story
          </button>
          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#B0DEC0] bg-white/70 py-2.5 text-[12px] font-bold text-[#1A6040]">
            <MessageCircle size={14} /> Tell friends
          </button>
        </div>

        <button
          onClick={() => navigate({ to: "/orders" })}
          className="btn-main"
        >
          Track my order
        </button>
        <button
          onClick={() => {
            resetBooking();
            navigate({ to: "/" });
          }}
          className="mx-auto mt-3 block text-[13px] font-bold text-mauve"
        >
          Back to home
        </button>
        <div className="h-4" />
      </div>
    </Screen>
  );
}

function ConfRow({
  k,
  v,
  highlight,
  success,
  last,
}: {
  k: string;
  v: string;
  highlight?: boolean;
  success?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-1.5 text-[13px] ${
        last ? "" : "border-b border-line"
      }`}
    >
      <span className="font-semibold text-ink-soft">{k}</span>
      <span
        className={`font-bold ${
          success
            ? "text-[#2A6030]"
            : highlight
              ? "font-serif text-[16px] text-gold"
              : "text-deep"
        }`}
      >
        {v}
      </span>
    </div>
  );
}
