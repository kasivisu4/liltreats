import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { EventBanner } from "../components/EventBanner";
import { SparkleField } from "../components/SparkleField";
import { TierCards } from "../components/TierCards";
import { VideoAddon } from "../components/VideoAddon";
import { Testimonials } from "../components/Testimonials";
import { ReferralCard } from "../components/ReferralCard";
import { TIERS } from "../data/tiers";
import { useCartStore } from "../store/cartStore";
import { useSlots } from "../api/queries";

const IG_URL = "https://www.instagram.com/_liltreats_/";

// ─── Week label (dynamic) ─────────────────────────────────────────────────────

function getWeekLabel(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon…
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMon);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return `${fmt(mon)} – ${fmt(sun)}`;
}

function getDaysUntilMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const daysLeft = day === 0 ? 1 : 8 - day;
  const hoursLeft = 23 - now.getHours();
  if (daysLeft === 1) return `${hoursLeft}h left`;
  return `${daysLeft - 1}d ${hoursLeft}h left`;
}

// ─── How it works strip ───────────────────────────────────────────────────────

const HOW_STEPS = [
  { icon: "🎀", title: "Pick a scoop", sub: "Mini, Magic or Premium" },
  { icon: "✍️", title: "Tell us your vibe", sub: "Colours, styles you love" },
  { icon: "📦", title: "We curate & ship", sub: "Handpacked with love" },
];

// ─── Past drop chips (links to IG instead of dead play buttons) ───────────────

const PAST_DROPS = [
  { label: "Pearl drop", emoji: "🤍", grad: "from-[#F7EDD4] to-[#EDD9C0]" },
  { label: "Boho week",  emoji: "🌿", grad: "from-[#DDE8D0] to-[#C4D8B0]" },
  { label: "Celestial",  emoji: "🌙", grad: "from-[#E0D8F4] to-[#C8B8E8]" },
  { label: "Rose set",   emoji: "🌸", grad: "from-[#F4D8E4] to-[#E0B8CC]" },
];

// ─── Route ────────────────────────────────────────────────────────────────────

export function HomeRoute() {
  const navigate = useNavigate();
  const selected = useCartStore((s) => s.selectedTier);
  const { data: slots } = useSlots();

  const selectedTier = TIERS.find((t) => t.id === selected);
  const weekLabel = getWeekLabel();
  const countdown = getDaysUntilMonday();
  const totalSlotsLeft = TIERS.reduce((sum, t) => sum + (slots?.[t.id] ?? t.slots), 0);

  return (
    <Screen top={<TopBar onIgClick={() => window.open(IG_URL, "_blank")} />}>
      <EventBanner />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F7EDD4] via-[#F2DCE4] to-[#EDE0F4] px-5 pb-10 pt-8 text-center">
        <SparkleField />
        <div className="relative z-[2]">

          {/* Live drop badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-gold-light bg-white/80 px-4 py-1.5 shadow-glow"
          >
            <span className="h-2 w-2 animate-recpulse rounded-full bg-[#D04060]" />
            <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-gold">
              Drop open · {totalSlotsLeft} slots left
            </span>
          </motion.div>

          {/* Brand name */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-serif text-[42px] font-bold leading-none tracking-tight text-deep"
          >
            liltreats
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-1 font-serif text-[15px] italic text-mauve"
          >
            mystery scoops
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            className="mx-auto mt-4 max-w-[300px] text-[13px] font-semibold leading-relaxed text-ink-soft"
          >
            Handcrafted surprise boxes packed with jewellery, trinkets &amp; lifestyle
            goodies — curated personally, every single week.
          </motion.p>

          {/* Category pills */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="mt-5 flex flex-wrap justify-center gap-2"
          >
            {["💎 Jewellery", "🎀 Accessories", "✨ Trinkets", "🌸 Lifestyle"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-gold-light/60 bg-white/70 px-3.5 py-1.5 text-[11px] font-bold text-deep shadow-sm"
              >
                {t}
              </span>
            ))}
          </motion.div>

          {/* CTA – scroll to tiers */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() =>
              document.getElementById("pick-scoop")?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-7 rounded-2xl bg-deep px-8 py-3.5 font-serif text-[15px] font-bold text-cream shadow-soft transition-transform active:scale-95"
          >
            Shop the drop →
          </motion.button>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section className="border-b border-gold-light bg-pearl px-5 py-6">
        <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[2px] text-gold">
          How it works
        </p>
        <div className="flex justify-between gap-2">
          {HOW_STEPS.map((s, i) => (
            <div key={s.title} className="flex flex-1 flex-col items-center gap-1.5 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-light bg-white text-[20px] shadow-glow">
                {s.icon}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[1px] text-gold">
                0{i + 1}
              </div>
              <div className="font-serif text-[12px] font-bold leading-tight text-deep">
                {s.title}
              </div>
              <div className="text-[10px] font-semibold leading-tight text-ink-mute">
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WEEK STRIP ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-gold-light bg-gold-pale px-4 py-3">
        <div>
          <div className="text-[11px] font-bold text-gold">
            Week of {weekLabel}
          </div>
          <div className="text-[10px] font-semibold text-ink-mute">
            Resets Monday · {countdown}
          </div>
        </div>
        <div className="flex gap-4">
          {TIERS.map((t) => {
            const left = slots?.[t.id] ?? t.slots;
            return (
              <div key={t.id} className="text-center">
                <div className={`font-serif text-[18px] font-extrabold ${left === 0 ? "text-ink-mute" : "text-deep"}`}>
                  {left}
                </div>
                <div className="text-[9px] font-bold uppercase tracking-wide text-ink-mute">
                  {t.id}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── PICK YOUR SCOOP ───────────────────────────────────────────────────── */}
      <section id="pick-scoop" className="px-4 pb-2 pt-6">
        <div className="mb-1 text-center">
          <h2 className="font-serif text-[22px] font-bold text-deep">
            Pick your scoop
          </h2>
          <p className="mt-1 text-[12px] font-semibold text-ink-soft">
            Three sizes, one magical surprise inside each.
          </p>
        </div>
        <div className="mt-4">
          <TierCards />
        </div>
      </section>

      {/* ── VIDEO ADD-ON ──────────────────────────────────────────────────────── */}
      <section className="mt-2 px-4">
        <VideoAddon />
      </section>

      {/* ── PAST DROPS (links to IG) ──────────────────────────────────────────── */}
      <section className="mt-6 px-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="section-label !mb-0">
            Past drops
          </div>
          <button
            onClick={() => window.open(IG_URL, "_blank")}
            className="text-[11px] font-bold text-mauve underline underline-offset-2"
          >
            See all on IG →
          </button>
        </div>
        <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
          {PAST_DROPS.map((g) => (
            <button
              key={g.label}
              onClick={() => window.open(IG_URL, "_blank")}
              className={`relative flex h-[110px] w-[88px] flex-shrink-0 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border border-line bg-gradient-to-br ${g.grad} transition-transform active:scale-95`}
            >
              <span className="text-[26px]">{g.emoji}</span>
              <span className="text-center text-[10px] font-bold leading-tight text-deep">
                {g.label}
              </span>
              <span className="absolute right-2 top-2 rounded-full bg-white/70 px-1.5 py-0.5 text-[8px] font-bold text-mauve">
                IG
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────────── */}
      <section className="mt-6 px-4">
        <Testimonials />
      </section>

      {/* ── IG FOLLOW STRIP ───────────────────────────────────────────────────── */}
      <section className="mt-6 px-4">
        <button
          onClick={() => window.open(IG_URL, "_blank")}
          className="flex w-full items-center gap-3 rounded-2xl border border-lav-deep/30 bg-gradient-to-r from-[#F5EDF9] to-[#EDE0F4] px-4 py-4 text-left transition-transform active:scale-[0.99]"
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] font-serif text-[14px] font-extrabold text-white shadow-sm">
            lt
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-serif text-[14px] font-bold text-lav-deep">@_liltreats_</div>
            <div className="mt-0.5 text-[11px] font-semibold text-lav-deep/70">
              Live scoops · Behind-the-scenes · Unboxings
            </div>
          </div>
          <span className="flex-shrink-0 rounded-full bg-lav-deep px-4 py-2 text-[12px] font-bold text-white shadow-sm">
            Follow
          </span>
        </button>
      </section>

      {/* ── REFERRAL ──────────────────────────────────────────────────────────── */}
      <section className="mt-4 px-4">
        <ReferralCard />
      </section>

      {/* ── CONTACT ───────────────────────────────────────────────────────────── */}
      <section className="px-4 pb-4 pt-3">
        <button
          onClick={() => navigate({ to: "/contact" })}
          className="btn-outline"
        >
          <MessageCircle size={15} /> Questions? Contact us
        </button>
      </section>

      {/* Spacer so sticky CTA never covers content */}
      <div className="h-24" />

      {/* ── STICKY BOOKING CTA ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedTier && (
          <motion.div
            key="sticky-cta"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t border-gold-light bg-cream/96 px-4 py-3 backdrop-blur-sm"
            style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-serif text-[15px] font-bold leading-tight text-deep">
                {selectedTier.icon} {selectedTier.name}
              </span>
              <span className="text-[11px] font-semibold text-ink-soft">
                ₹{selectedTier.price.toLocaleString("en-IN")} + shipping · {selectedTier.itemsLabel}
              </span>
            </div>
            <button
              onClick={() =>
                navigate({ to: "/book/$tier", params: { tier: selectedTier.id } })
              }
              className="flex-shrink-0 rounded-2xl bg-deep px-5 py-3 font-serif text-[14px] font-bold text-cream shadow-md transition-transform active:scale-95"
            >
              Book now →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Screen>
  );
}
