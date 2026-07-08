import { useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { VideoAddon } from "../components/VideoAddon";
import { StepIndicator } from "../components/StepIndicator";
import { TIERS, TIER_BY_ID, type TierId } from "../data/tiers";
import {
  FAV_CATEGORIES,
  VIBES,
  useCartStore,
} from "../store/cartStore";

const VALID = new Set(TIERS.map((t) => t.id));

export function PreferencesRoute() {
  const navigate = useNavigate();
  const { tier } = useParams({ strict: false }) as { tier?: string };

  const setTier = useCartStore((s) => s.setTier);
  const vibes = useCartStore((s) => s.vibes);
  const favCategories = useCartStore((s) => s.favCategories);
  const avoidNote = useCartStore((s) => s.avoidNote);
  const toggleVibe = useCartStore((s) => s.toggleVibe);
  const toggleCategory = useCartStore((s) => s.toggleCategory);
  const setAvoidNote = useCartStore((s) => s.setAvoidNote);

  const valid = tier && VALID.has(tier as TierId);

  useEffect(() => {
    if (valid) setTier(tier as TierId);
  }, [valid, tier, setTier]);

  useEffect(() => {
    if (!valid) navigate({ to: "/" });
  }, [valid, navigate]);

  if (!valid) return null;
  const t = TIER_BY_ID(tier as TierId);

  return (
    <Screen top={<TopBar title="Your scoop" showBack />}>
      {/* Step indicator */}
      <div className="flex items-center gap-2 border-b border-line bg-gold-pale px-4 py-2">
        {[
          { n: 1, label: "Preferences" },
          { n: 2, label: "Checkout" },
          { n: 3, label: "Confirm" },
        ].map(({ n, label }, i) => {
          const isActive = n === 1;
          const isDone = false;
          return (
            <div key={n} className="flex items-center gap-2">
              {i > 0 && <div className="h-px w-5 bg-line" />}
              <div className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold transition-colors ${
                    isActive
                      ? "bg-deep text-cream"
                      : isDone
                      ? "bg-gold text-white"
                      : "bg-line text-ink-mute"
                  }`}
                >
                  {n}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    isActive ? "text-deep" : "text-ink-mute"
                  }`}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4">
        {/* Tier summary */}
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#F2DCE4] to-[#EDE0F4] p-4">
          <span className="text-[30px]">{t.icon}</span>
          <div>
            <div className="font-serif text-[17px] font-bold text-deep">{t.name}</div>
            <div className="text-[12px] font-semibold text-ink-soft">
              {t.itemsLabel} · ₹{t.price.toLocaleString("en-IN")} + shipping
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-2xl border border-line bg-white/60 p-3.5">
          <p className="text-[12px] font-semibold leading-relaxed text-ink-soft">
            <span className="font-bold text-deep">It's a surprise! ✨</span> We curate
            every box by hand. Share your vibe below (all optional) and we'll match the
            goodies to your taste.
          </p>
        </div>

        {/* Vibe */}
        <div className="section-label">Your vibe</div>
        <div className="mb-5 flex flex-wrap gap-2">
          {VIBES.map((v) => {
            const on = vibes.includes(v);
            return (
              <button
                key={v}
                onClick={() => toggleVibe(v)}
                className={`rounded-full border px-3.5 py-2 text-[12px] font-bold transition-colors ${
                  on
                    ? "border-rose bg-blush text-deep"
                    : "border-line bg-white/60 text-ink-soft"
                }`}
              >
                {v}
              </button>
            );
          })}
        </div>

        {/* Favourite categories */}
        <div className="section-label">Love these most</div>
        <div className="mb-5 grid grid-cols-2 gap-2">
          {FAV_CATEGORIES.map((c) => {
            const on = favCategories.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleCategory(c)}
                className={`rounded-xl border px-3 py-2.5 text-[12px] font-bold transition-colors ${
                  on
                    ? "border-gold bg-gold-pale text-deep"
                    : "border-line bg-white/60 text-ink-soft"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Avoid */}
        <div className="section-label">Anything to avoid?</div>
        <input
          value={avoidNote}
          onChange={(e) => setAvoidNote(e.target.value)}
          placeholder="e.g. no danglers, skip strong scents, allergic to…"
          className="field-input mb-5"
        />

        {/* Video add-on */}
        <div className="section-label">Make it extra</div>
        <VideoAddon />

        <button
          onClick={() => navigate({ to: "/cart" })}
          className="btn-main mt-5"
        >
          Continue to checkout →
        </button>
        <div className="h-4" />
      </div>
    </Screen>
  );
}
