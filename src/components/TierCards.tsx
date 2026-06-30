import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { ACCENT_STYLES, TIERS, type Tier } from "../data/tiers";
import { useCartStore } from "../store/cartStore";
import { useSlots } from "../api/queries";
import { TOTAL_SLOTS } from "../api/mockApi";

function Perks({ tier }: { tier: Tier }) {
  const a = ACCENT_STYLES[tier.accent];
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {tier.perks.map((p) => (
        <span
          key={p}
          className={`flex items-center gap-1 rounded-[9px] border px-2 py-1 text-[10px] font-bold ${a.perkBg} ${a.perkText} ${a.perkBorder}`}
        >
          <Check size={9} className="opacity-70" />
          {p}
        </span>
      ))}
    </div>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  const selected = useCartStore((s) => s.selectedTier);
  const setTier = useCartStore((s) => s.setTier);
  const { data: slots } = useSlots();

  const a = ACCENT_STYLES[tier.accent];
  const isSel = selected === tier.id;
  const left = slots?.[tier.id] ?? tier.slots;
  const sold = left <= 0;
  const pct = Math.round((left / TOTAL_SLOTS[tier.id]) * 100);

  return (
    <button
      onClick={() => setTier(tier.id)}
      className={`relative flex h-full flex-col overflow-hidden rounded-[20px] border-[1.5px] bg-gradient-to-br p-4 text-left transition-all active:scale-[0.98] ${a.cardBg} ${
        isSel ? `${a.selBorder} !border-2 shadow-soft` : a.border
      }`}
    >
      <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-[13px] bg-white/65 text-[22px] shadow-sm">
        {tier.icon}
      </div>
      <div className="font-serif text-[15px] font-bold leading-tight text-deep md:text-[17px]">
        {tier.name}
      </div>
      <div className={`mt-0.5 text-[10px] font-bold ${a.tagText}`}>{tier.tagline}</div>

      <div className="my-2.5 flex items-baseline justify-between">
        <div className="font-serif text-[20px] font-bold text-deep">
          ₹{tier.price.toLocaleString("en-IN")}
          <span className="ml-0.5 text-[10px] font-bold text-ink-soft">+ ship</span>
        </div>
        <span
          className={`pill ${sold ? "bg-[#F0E0E0] text-[#A02020]" : `${a.pillBg} ${a.pillText}`}`}
        >
          {sold ? "Sold out" : `${left} left`}
        </span>
      </div>

      <Perks tier={tier} />

      <div
        className={`mt-2 inline-flex w-fit items-center gap-1 rounded-lg border border-gold-light bg-white/70 px-2 py-[3px] text-[10px] font-bold ${a.tagText}`}
      >
        🎁 Freebies included
      </div>

      <div className="mt-auto pt-3">
        <div className="h-[3px] overflow-hidden rounded-sm bg-white/40">
          <motion.div
            className={`h-full rounded-sm bg-gradient-to-r ${a.barFrom} ${a.barTo}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </button>
  );
}

export function TierCards() {
  const [mini, magic, premium] = TIERS;
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
      <TierCard tier={mini} />
      <TierCard tier={magic} />
      <div className="col-span-2 md:col-span-1">
        <TierCard tier={premium} />
      </div>
    </div>
  );
}
