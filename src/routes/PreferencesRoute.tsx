import { useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { StepIndicator } from "../components/StepIndicator";
import { VideoSlotPicker } from "../components/VideoSlotPicker";
import { TIERS, TIER_BY_ID, VIDEO_ADDON_PRICE, type TierId } from "../data/tiers";
import { FAV_CATEGORIES, VIBES, useCartStore } from "../store/cartStore";

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
  const videoAddon = useCartStore((s) => s.videoAddon);
  const setVideoAddon = useCartStore((s) => s.setVideoAddon);
  const selectedVideoSlotId = useCartStore((s) => s.selectedVideoSlotId);

  const valid = tier && VALID.has(tier as TierId);

  useEffect(() => {
    if (valid) setTier(tier as TierId);
  }, [valid, tier, setTier]);

  useEffect(() => {
    if (!valid) navigate({ to: "/" });
  }, [valid, navigate]);

  if (!valid) return null;
  const t = TIER_BY_ID(tier as TierId);

  const canProceed = !videoAddon || !!selectedVideoSlotId;

  return (
    <Screen top={<TopBar title="Your scoop" showBack />}>
      <StepIndicator current={1} />
      <div className="p-4">

        {/* Tier summary */}
        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#F2DCE4] to-[#EDE0F4] p-4">
          <span className="text-[30px]">{t.icon}</span>
          <div className="flex-1">
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
                  on ? "border-rose bg-blush text-deep" : "border-line bg-white/60 text-ink-soft"
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
                  on ? "border-gold bg-gold-pale text-deep" : "border-line bg-white/60 text-ink-soft"
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
          className="field-input mb-6"
        />

        {/* Experience choice */}
        <div className="section-label">Choose your experience</div>
        <div className="mb-5 grid grid-cols-2 gap-3">
          <button
            onClick={() => setVideoAddon(true)}
            className={`flex flex-col items-center gap-2 rounded-2xl border-[1.5px] p-4 text-center transition-all ${
              videoAddon
                ? "border-rose bg-gradient-to-br from-[#FAF0F3] to-[#F4E4EC] shadow-sm"
                : "border-line bg-white/70"
            }`}
          >
            <span className="text-[28px]">🎬</span>
            <div>
              <div className="font-serif text-[13px] font-bold text-deep">With Video</div>
              <div className="text-[10px] font-semibold text-ink-mute">
                +₹{VIDEO_ADDON_PRICE} · We film, you keep
              </div>
            </div>
            {videoAddon && (
              <span className="rounded-full bg-rose px-2.5 py-0.5 text-[10px] font-bold text-white">
                Selected
              </span>
            )}
          </button>
          <button
            onClick={() => setVideoAddon(false)}
            className={`flex flex-col items-center gap-2 rounded-2xl border-[1.5px] p-4 text-center transition-all ${
              !videoAddon
                ? "border-gold bg-gradient-to-br from-[#FDF8F0] to-[#F7EDD4] shadow-sm"
                : "border-line bg-white/70"
            }`}
          >
            <span className="text-[28px]">📦</span>
            <div>
              <div className="font-serif text-[13px] font-bold text-deep">Without Video</div>
              <div className="text-[10px] font-semibold text-ink-mute">
                Normal mystery scoop
              </div>
            </div>
            {!videoAddon && (
              <span className="rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold text-white">
                Selected
              </span>
            )}
          </button>
        </div>

        {/* Video slot picker — only shows when with-video is selected */}
        {videoAddon && (
          <div className="mb-5">
            <VideoSlotPicker />
          </div>
        )}

        {videoAddon && !selectedVideoSlotId && (
          <div className="mb-4 rounded-xl border border-gold/40 bg-gold-pale px-3 py-2.5 text-[12px] font-semibold text-deep">
            Please select a video date and slot above to continue.
          </div>
        )}

        <button
          onClick={() => navigate({ to: "/cart" })}
          disabled={!canProceed}
          className="btn-main mt-1"
        >
          Continue to checkout →
        </button>
        <div className="h-4" />
      </div>
    </Screen>
  );
}
