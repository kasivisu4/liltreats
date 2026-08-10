import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { ACCENT_STYLES, TIERS, type Tier, type TierId } from "../data/tiers";
import { useCartStore } from "../store/cartStore";
import { useSlots } from "../api/queries";
import { TOTAL_SLOTS } from "../api/mockApi";

// ─── Vessel fill colours ──────────────────────────────────────────────────────

const VESSEL_COLORS: Record<TierId, { fill: string; rim: string; glow: string }> = {
  mini:    { fill: "#B8D4A8", rim: "#7AAA60",  glow: "rgba(122,170,96,0.30)"  },
  magic:   { fill: "#F0C0D0", rim: "#C87890",  glow: "rgba(200,120,144,0.30)" },
  premium: { fill: "#D0C0F0", rim: "#9880C0",  glow: "rgba(152,128,192,0.30)" },
};

// ─── SVG vessel shapes (viewBox 0 0 80 100) ───────────────────────────────────
//  Each shape has two paths:
//    outline  – the full silhouette including stem/base for premium
//    fillClip – only the interior that should receive colour

const VESSELS: Record<TierId, { outline: string; fillClip: string; svgW: number; svgH: number }> = {
  // Small tapered cup
  mini: {
    outline:  "M 18 22 L 62 22 L 56 80 L 24 80 Z",
    fillClip: "M 18 22 L 62 22 L 56 80 L 24 80 Z",
    svgW: 64, svgH: 78,
  },
  // Wide rounded bowl
  magic: {
    outline:  "M 6 36 Q 6 22 40 20 Q 74 22 74 36 L 67 72 Q 65 84 40 86 Q 15 84 13 72 Z",
    fillClip: "M 6 36 Q 6 22 40 20 Q 74 22 74 36 L 67 72 Q 65 84 40 86 Q 15 84 13 72 Z",
    svgW: 80, svgH: 92,
  },
  // Footed sundae glass — outline includes stem+base, clip is just the bowl
  premium: {
    outline:  "M 22 10 L 58 10 L 50 58 L 46 64 L 46 74 L 56 80 L 56 88 L 24 88 L 24 80 L 34 74 L 34 64 L 30 58 Z",
    fillClip: "M 22 10 L 58 10 L 50 58 L 46 64 L 34 64 L 30 58 Z",
    svgW: 72, svgH: 96,
  },
};

// ─── Vessel SVG ───────────────────────────────────────────────────────────────

function VesselSVG({ tierId, selected }: { tierId: TierId; selected: boolean }) {
  const { outline, fillClip, svgW, svgH } = VESSELS[tierId];
  const { fill, rim } = VESSEL_COLORS[tierId];
  const clipId = `vc-${tierId}`;

  return (
    <svg
      viewBox="0 0 80 100"
      width={svgW}
      height={svgH}
      style={{ overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <clipPath id={clipId}>
          <path d={fillClip} />
        </clipPath>
      </defs>

      {/* Animated fill — rises from bottom up inside the clip region */}
      <motion.rect
        x={0}
        width={80}
        height={100}
        fill={fill}
        clipPath={`url(#${clipId})`}
        initial={{ y: 100 }}
        animate={{ y: selected ? 0 : 100 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
      />

      {/* Vessel outline drawn on top so it stays crisp */}
      <motion.path
        d={outline}
        fill="none"
        stroke={selected ? rim : "rgba(107,45,62,0.18)"}
        strokeWidth={selected ? 2.5 : 1.5}
        strokeLinejoin="round"
        animate={{ stroke: selected ? rim : "rgba(107,45,62,0.18)" }}
        transition={{ duration: 0.25 }}
      />
    </svg>
  );
}

// ─── Vessel button ────────────────────────────────────────────────────────────

function VesselButton({
  tier,
  selected,
  sold,
  onSelect,
}: {
  tier: Tier;
  selected: boolean;
  sold: boolean;
  onSelect: () => void;
}) {
  const { glow, rim } = VESSEL_COLORS[tier.id];
  const a = ACCENT_STYLES[tier.accent];

  return (
    <button
      onClick={onSelect}
      disabled={sold}
      className="flex flex-col items-center gap-2 focus:outline-none active:scale-95 disabled:opacity-40 transition-transform"
      aria-pressed={selected}
      aria-label={`Select ${tier.name}`}
    >
      {/* Glow halo behind vessel when selected */}
      <motion.div
        animate={
          selected
            ? { filter: `drop-shadow(0 0 12px ${glow})`, scale: 1.06 }
            : { filter: "none", scale: 1 }
        }
        transition={{ duration: 0.3 }}
      >
        <VesselSVG tierId={tier.id} selected={selected} />
      </motion.div>

      {/* Name + price label */}
      <div className="text-center leading-tight">
        <div
          className={`font-serif text-[13px] font-bold transition-colors ${
            selected ? "text-deep" : "text-ink-soft"
          }`}
        >
          {tier.name}
        </div>
        <div
          className={`text-[11px] font-bold transition-colors ${
            selected ? a.tagText : "text-ink-mute"
          }`}
        >
          ₹{tier.price.toLocaleString("en-IN")}
        </div>
      </div>

      {/* Selection dot */}
      <motion.div
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: rim }}
        animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
      />
    </button>
  );
}

// ─── Detail panel (Option B accordion) ───────────────────────────────────────

function DetailPanel({ tier, left }: { tier: Tier; left: number }) {
  const navigate = useNavigate();
  const a = ACCENT_STYLES[tier.accent];
  const sold = left <= 0;
  const pct = Math.round((left / TOTAL_SLOTS[tier.id]) * 100);

  return (
    <motion.div
      key={tier.id}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`mt-4 overflow-hidden rounded-[20px] border-[1.5px] p-4 ${a.cardBg} ${a.border}`}
    >
      {/* Tier name + price */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="font-serif text-[18px] font-bold leading-tight text-deep">
            {tier.icon} {tier.name}
          </div>
          <div className={`text-[11px] font-bold ${a.tagText}`}>{tier.tagline}</div>
        </div>
        <div className="text-right">
          <div className="font-serif text-[22px] font-bold leading-none text-deep">
            ₹{tier.price.toLocaleString("en-IN")}
          </div>
          <div className="text-[10px] font-bold text-ink-soft">+ shipping</div>
        </div>
      </div>

      {/* Items + slots pills */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold ${a.perkBg} ${a.perkText} ${a.perkBorder}`}
        >
          📦 {tier.itemsLabel}
        </span>
        <span
          className={`pill ${
            sold
              ? "bg-[#F0E0E0] text-[#A02020]"
              : `${a.pillBg} ${a.pillText}`
          }`}
        >
          {sold ? "Sold out" : `${left} slot${left === 1 ? "" : "s"} left`}
        </span>
      </div>

      {/* Stock bar */}
      <div className="mb-3 h-[4px] overflow-hidden rounded-full bg-white/40">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${a.barFrom} ${a.barTo}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>

      {/* Perks grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {tier.perks.map((p) => (
          <span
            key={p}
            className={`flex items-center gap-1.5 rounded-[9px] border px-2.5 py-1.5 text-[11px] font-bold ${a.perkBg} ${a.perkText} ${a.perkBorder}`}
          >
            <Check size={9} strokeWidth={3} className="flex-shrink-0 opacity-70" />
            {p}
          </span>
        ))}
      </div>

      {/* Freebies badge */}
      <div
        className={`mt-3 inline-flex items-center gap-1 rounded-lg border border-gold-light bg-white/70 px-2.5 py-1 text-[11px] font-bold ${a.tagText}`}
      >
        🎁 Freebies included with every scoop
      </div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function TierCards() {
  const selected = useCartStore((s) => s.selectedTier);
  const setTier = useCartStore((s) => s.setTier);
  const { data: slots } = useSlots();

  const slotsLeft = (id: TierId) =>
    slots?.[id] ?? TIERS.find((t) => t.id === id)!.slots;

  const selectedTier = TIERS.find((t) => t.id === selected) ?? null;

  function handleSelect(tierId: TierId) {
    // Toggle: tap selected vessel again to deselect
    setTier(selected === tierId ? null : tierId);
  }

  return (
    <div>
      {/* Three vessel buttons, vertically bottom-aligned so sizes feel natural */}
      <div className="flex items-end justify-around px-4 py-2">
        {TIERS.map((tier) => (
          <VesselButton
            key={tier.id}
            tier={tier}
            selected={selected === tier.id}
            sold={slotsLeft(tier.id) <= 0}
            onSelect={() => handleSelect(tier.id)}
          />
        ))}
      </div>

      {/* Hint shown when nothing is selected */}
      <AnimatePresence>
        {!selected && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 text-center text-[11px] font-bold text-ink-mute"
          >
            Tap a scoop to see what's inside ✦
          </motion.p>
        )}
      </AnimatePresence>

      {/* Expandable detail panel */}
      <AnimatePresence mode="wait">
        {selectedTier && (
          <DetailPanel
            key={selectedTier.id}
            tier={selectedTier}
            left={slotsLeft(selectedTier.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
