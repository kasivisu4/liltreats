import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { EventBanner } from "../components/EventBanner";
import { SparkleField } from "../components/SparkleField";
import { TierCards } from "../components/TierCards";
import { Testimonials } from "../components/Testimonials";
import { ReferralCard } from "../components/ReferralCard";
import { TIERS } from "../data/tiers";
import { useCartStore } from "../store/cartStore";
import { useSlots } from "../api/queries";

const IG_URL = "https://www.instagram.com/_liltreats_/";

// ─── Week label (dynamic) ─────────────────────────────────────────────────────

function getWeekLabel(): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
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

// ─── How It Works – 4 steps per spec ─────────────────────────────────────────

const HOW_STEPS = [
  {
    icon: "🎀",
    step: "01",
    title: "Choose your Scoop",
    sub: "Mini, Magic or Premium",
  },
  {
    icon: "🎬",
    step: "02",
    title: "With or Without Video",
    sub: "Film your unboxing experience",
  },
  {
    icon: "📅",
    step: "03",
    title: "Pick a date & slot",
    sub: "If With Video, select your time",
  },
  {
    icon: "✨",
    step: "04",
    title: "Pay & enjoy",
    sub: "Your LilTreat is on its way!",
  },
];

// ─── Past drop chips ───────────────────────────────────────────────────────────

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
  const totalSlotsLeft = TIERS.reduce(
    (sum, t) => sum + (slots?.[t.id] ?? t.slots),
    0,
  );

  return (
    <Screen top={<TopBar onIgClick={() => window.open(IG_URL, "_blank")} />}>
      <EventBanner />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
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

          {/* Main headline – per spec */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-serif text-[28px] font-bold leading-tight tracking-tight text-deep"
          >
            Your Mystery Scoop.
            <br />
            Your Surprise.
            <br />
            <span className="text-mauve">Your LilTreat!</span>
          </motion.h1>

          {/* Sub tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mx-auto mt-4 max-w-[300px] text-[13px] font-semibold leading-relaxed text-ink-soft"
          >
            Handcrafted surprise boxes packed with jewellery, trinkets &amp;
            lifestyle goodies — curated personally, every single week.
          </motion.p>

          {/* Category pills */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="mt-5 flex flex-wrap justify-center gap-2"
          >
            {["💎 Jewellery", "🎀 Accessories", "✨ Trinkets", "🌸 Lifestyle"].map(
              (t) => (
                <span
                  key={t}
                  className="rounded-full border border-gold-light/60 bg-white/70 px-3.5 py-1.5 text-[11px] font-bold text-deep shadow-sm"
                >
                  {t}
                </span>
              ),
            )}
          </motion.div>

          {/* Two CTA buttons per spec */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-7 flex flex-col items-center gap-3"
          >
            <button
              onClick={() =>
                document
                  .getElementById("our-scoops")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="w-full max-w-[260px] rounded-2xl bg-deep px-8 py-3.5 font-serif text-[15px] font-bold text-cream shadow-soft transition-transform active:scale-95"
            >
              Explore Scoops →
            </button>
            <button
              onClick={() => navigate({ to: "/shop" })}
              className="w-full max-w-[260px] rounded-2xl border-2 border-deep bg-white/80 px-8 py-3 font-serif text-[15px] font-bold text-deep shadow-sm transition-transform active:scale-95"
            >
              Shop Individual Items
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS – 4 steps ────────────────────────────────────────── */}
      <section className="border-b border-gold-light bg-pearl px-5 py-7">
        <p className="mb-5 text-center text-[11px] font-bold uppercase tracking-[2px] text-gold">
          How LilTreats Works
        </p>
        <div className="grid grid-cols-2 gap-4">
          {HOW_STEPS.map((s) => (
            <div
              key={s.step}
              className="flex flex-col items-center gap-2 rounded-2xl border border-gold-light/60 bg-white/70 p-3 text-center shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gold-light bg-white text-[22px] shadow-glow">
                {s.icon}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[1px] text-gold">
                Step {s.step}
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

      {/* ── WEEK STRIP ────────────────────────────────────────────────────── */}
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
                <div
                  className={`font-serif text-[18px] font-extrabold ${
                    left === 0 ? "text-ink-mute" : "text-deep"
                  }`}
                >
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

      {/* ── OUR SCOOPS ────────────────────────────────────────────────────── */}
      <section id="our-scoops" className="px-4 pb-2 pt-6">
        <div className="mb-1 text-center">
          <h2 className="font-serif text-[24px] font-bold text-deep">
            Our Scoops
          </h2>
          <p className="mt-1 text-[12px] font-semibold text-ink-soft">
            Three sizes, one magical surprise inside each.
          </p>
        </div>
        <div className="mt-4">
          <TierCards />
        </div>
      </section>

      {/* ── INDIVIDUAL ITEMS PROMO STRIP ──────────────────────────────────── */}
      <section className="mx-4 mt-6 overflow-hidden rounded-[20px] border border-gold-light bg-gradient-to-r from-[#F7EDD4] to-[#F2DCE4]">
        <div className="flex items-center gap-4 p-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/80 text-[28px] shadow-sm">
            🛍️
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-serif text-[15px] font-bold text-deep">
              Shop Individual Items
            </div>
            <div className="mt-0.5 text-[11px] font-semibold leading-relaxed text-ink-soft">
              Charms, jewellery, accessories &amp; more — buy exactly what you love.
            </div>
          </div>
          <button
            onClick={() => navigate({ to: "/shop" })}
            className="flex-shrink-0 rounded-2xl bg-deep px-4 py-2.5 font-serif text-[12px] font-bold text-cream shadow-sm transition-transform active:scale-95"
          >
            Shop now
          </button>
        </div>
      </section>

      {/* ── PAST DROPS (links to IG) ──────────────────────────────────────── */}
      <section className="mt-6 px-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="section-label !mb-0">Past drops</div>
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

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="mt-6 px-4">
        <Testimonials />
      </section>

      {/* ── IG FOLLOW STRIP ───────────────────────────────────────────────── */}
      <section className="mt-6 px-4">
        <button
          onClick={() => window.open(IG_URL, "_blank")}
          className="flex w-full items-center gap-3 rounded-2xl border border-lav-deep/30 bg-gradient-to-r from-[#F5EDF9] to-[#EDE0F4] px-4 py-4 text-left transition-transform active:scale-[0.99]"
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] font-serif text-[14px] font-extrabold text-white shadow-sm">
            lt
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-serif text-[14px] font-bold text-lav-deep">
              @_liltreats_
            </div>
            <div className="mt-0.5 text-[11px] font-semibold text-lav-deep/70">
              Live scoops · Behind-the-scenes · Unboxings
            </div>
          </div>
          <span className="flex-shrink-0 rounded-full bg-lav-deep px-4 py-2 text-[12px] font-bold text-white shadow-sm">
            Follow
          </span>
        </button>
      </section>

      {/* ── REFERRAL ──────────────────────────────────────────────────────── */}
      <section className="mt-4 px-4">
        <ReferralCard />
      </section>

      {/* ── CONTACT ───────────────────────────────────────────────────────── */}
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

      {/* ── STICKY BOOKING CTA ────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedTier && (
          <motion.div
            key="sticky-cta"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 border-t border-gold-light bg-cream/96 px-4 py-3 backdrop-blur-sm"
            style={{
              paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
            }}
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="font-serif text-[15px] font-bold leading-tight text-deep">
                {selectedTier.icon} {selectedTier.name}
              </span>
              <span className="text-[11px] font-semibold text-ink-soft">
                ₹{selectedTier.price.toLocaleString("en-IN")} + shipping ·{" "}
                {selectedTier.itemsLabel}
              </span>
            </div>
            <button
              onClick={() =>
                navigate({
                  to: "/book/$tier",
                  params: { tier: selectedTier.id },
                })
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
