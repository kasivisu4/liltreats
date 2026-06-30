import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MessageCircle, Play } from "lucide-react";
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

const GALLERY = [
  { label: "Pearl drop", grad: "from-[#E8C0D8] to-[#C8788E]" },
  { label: "Boho week", grad: "from-[#D8C090] to-[#C4945A]" },
  { label: "Celestial", grad: "from-[#9890C0] to-[#5840A0]" },
  { label: "Rose set", grad: "from-[#C8A8D8] to-[#9880C0]" },
];

const IG_URL = "https://www.instagram.com/_liltreats_/";

export function HomeRoute() {
  const navigate = useNavigate();
  const selected = useCartStore((s) => s.selectedTier);
  const { data: slots } = useSlots();

  const selectedTier = TIERS.find((t) => t.id === selected);

  return (
    <Screen top={<TopBar onIgClick={() => window.open(IG_URL, "_blank")} />}>
      <EventBanner />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F7EDD4] via-[#F2DCE4] to-[#EDE0F4] px-5 pb-8 pt-7 text-center">
        <SparkleField />
        <div className="relative z-[2]">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-gold-light bg-white/70 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[1.5px] text-gold">
            ✦ Limited weekly drops ✦
          </span>
          <motion.div
            className="mx-auto mb-4 flex h-[100px] w-[100px] items-center justify-center rounded-[20px] border-2 border-gold-light bg-white/60 text-[42px] shadow-glow"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            🎁
          </motion.div>
          <h1 className="font-serif text-[28px] font-bold leading-tight text-deep">
            Scoops that feel <em className="italic text-mauve">magical</em>
          </h1>
          <p className="mx-auto mt-2 max-w-[280px] text-[12px] font-semibold leading-relaxed text-ink-soft">
            Handcrafted mystery boxes with jewellery, trinkets & lifestyle goodies —
            curated with love, every single week.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {["💎 Jewellery", "🎀 Accessories", "✨ Surprises"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-line bg-white/65 px-3 py-1.5 text-[11px] font-bold text-deep"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* WEEK SLOT STRIP */}
      <div className="flex items-center justify-between border-b border-gold-light bg-gold-pale px-4 py-2.5">
        <span className="text-[11px] font-bold text-gold">Week of 23–29 Jun · Resets Mon</span>
        <div className="flex gap-3">
          {TIERS.map((t) => (
            <div key={t.id} className="text-center">
              <div className="text-[16px] font-extrabold text-deep">
                {slots?.[t.id] ?? t.slots}
              </div>
              <div className="text-[9px] font-bold uppercase tracking-wide text-ink-mute">
                {t.id}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TIERS */}
      <section className="px-4 pt-4">
        <div className="section-label">Choose your scoop</div>
        <TierCards />
      </section>

      <section className="mt-3 px-4">
        <VideoAddon />
      </section>

      {/* VIDEO GALLERY */}
      <section className="mt-4 px-4">
        <div className="section-label !mb-3">
          <span className="h-2 w-2 animate-recpulse rounded-full bg-[#D04060]" />
          Past scoop reels
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {GALLERY.map((g) => (
            <button
              key={g.label}
              className={`relative flex h-[120px] w-[90px] flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-gradient-to-br ${g.grad}`}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/60 bg-white/25">
                <Play size={14} className="ml-0.5 text-white" fill="white" />
              </span>
              <span className="absolute inset-x-0 bottom-0 bg-deep/70 py-1 text-center text-[10px] font-bold text-white">
                {g.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 px-4">
        <Testimonials />
      </section>

      <section className="mt-4 px-4">
        <ReferralCard />
      </section>

      {/* IG STRIP */}
      <section className="mt-3 px-4">
        <button
          onClick={() => window.open(IG_URL, "_blank")}
          className="flex w-full items-center gap-3 rounded-2xl border border-lav-deep/40 bg-lav px-3.5 py-3 text-left"
        >
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-[12px] font-extrabold text-white">
            lt
          </span>
          <div>
            <div className="text-[12px] font-extrabold text-lav-deep">@_liltreats_</div>
            <div className="text-[10px] font-bold text-lav-deep/80">
              Live scoops · Weekly drops · Follow!
            </div>
          </div>
          <span className="ml-auto rounded-full bg-lav-deep px-3 py-1.5 text-[11px] font-bold text-white">
            Follow
          </span>
        </button>
      </section>

      {/* CTA */}
      <section className="px-4 py-4">
        <button
          disabled={!selectedTier}
          onClick={() =>
            selectedTier &&
            navigate({ to: "/book/$tier", params: { tier: selectedTier.id } })
          }
          className="btn-main"
        >
          {selectedTier
            ? `Book ${selectedTier.name} →`
            : "Select a scoop to begin"}
        </button>
        <button
          onClick={() => navigate({ to: "/contact" })}
          className="btn-outline mt-2"
        >
          <MessageCircle size={15} /> Contact us directly
        </button>
      </section>
    </Screen>
  );
}
