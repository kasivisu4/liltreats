import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { TIERS, TIER_BY_ID, VIDEO_ADDON_PRICE, type TierId } from "../data/tiers";
import { FAV_CATEGORIES, VIBES, useCartStore } from "../store/cartStore";
import { useVideoSlots } from "../api/queries";

const VALID = new Set(TIERS.map((t) => t.id));

// ── Inline StepIndicator ───────────────────────────────────────────────────────
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
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  done
                    ? "bg-sage-DEFAULT text-white"
                    : active
                      ? "bg-deep text-white"
                      : "bg-line text-ink-mute"
                }`}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={`mt-0.5 text-[9px] font-bold ${active ? "text-deep" : "text-ink-mute"}`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-1.5 mb-3 h-[2px] w-8 rounded-full ${done ? "bg-sage-DEFAULT" : "bg-line"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Inline VideoSlotPicker ─────────────────────────────────────────────────────
function VideoSlotPicker() {
  const setVideoSlot = useCartStore((s) => s.setVideoSlot);
  const selectedDate = useCartStore((s) => s.selectedVideoDate);

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 5);
  const maxDate = new Date(minDate);
  maxDate.setDate(minDate.getDate() + 30);

  const fromStr = minDate.toISOString().split("T")[0];
  const toStr = maxDate.toISOString().split("T")[0];

  const { data: slots = [] } = useVideoSlots(fromStr, toStr);

  // Build available dates — deduplicate and check capacity
  const byDate: Record<string, typeof slots> = {};
  slots.forEach((s) => {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  });

  // If no slots from API, generate the next 30 available dates as fallback
  const apiDates = Object.keys(byDate).sort();
  const dates = apiDates.length > 0 ? apiDates : (() => {
    const result: string[] = [];
    const d = new Date(minDate);
    while (result.length < 30) {
      result.push(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
    return result;
  })();

  const [weekStart, setWeekStart] = useState(0);
  const DAYS_PER_PAGE = 7;
  const visibleDates = dates.slice(weekStart, weekStart + DAYS_PER_PAGE);

  function fmtDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return {
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      num: d.toLocaleDateString("en-IN", { day: "numeric" }),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
      full: d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    };
  }

  function isDayFull(dateStr: string) {
    const daySlots = byDate[dateStr];
    if (!daySlots) return false;
    const totalBooked = daySlots.reduce((s, sl) => s + sl.bookedCount, 0);
    const totalCap = daySlots.reduce((s, sl) => s + sl.maxCapacity, 0);
    return totalBooked >= totalCap;
  }

  function selectDate(dateStr: string) {
    // Use first available slot id for that date, or a synthetic id
    const daySlots = byDate[dateStr];
    const slot = daySlots?.find((s) => !s.isBlocked && s.bookedCount < s.maxCapacity);
    setVideoSlot(slot?.id ?? dateStr, dateStr, slot?.time ?? "");
  }

  return (
    <div className="rounded-2xl border border-gold-light bg-white/70 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Calendar size={15} className="text-gold-DEFAULT" />
        <span className="font-serif text-[14px] font-bold text-deep">Pick your video date</span>
      </div>

      <p className="mb-4 text-[11px] font-semibold leading-relaxed text-ink-soft">
        Earliest available:{" "}
        <span className="font-bold text-deep">
          {minDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
        . We'll confirm your exact time 24 hrs before.
      </p>

      {/* Week nav */}
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => setWeekStart(Math.max(0, weekStart - DAYS_PER_PAGE))}
          disabled={weekStart === 0}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white/70 disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-[11px] font-bold text-ink-mute">
          {visibleDates[0] ? `${fmtDate(visibleDates[0]).num} ${fmtDate(visibleDates[0]).month}` : ""}{" "}
          —{" "}
          {visibleDates[visibleDates.length - 1]
            ? `${fmtDate(visibleDates[visibleDates.length - 1]).num} ${fmtDate(visibleDates[visibleDates.length - 1]).month}`
            : ""}
        </span>
        <button
          onClick={() =>
            setWeekStart(Math.min(dates.length - DAYS_PER_PAGE, weekStart + DAYS_PER_PAGE))
          }
          disabled={weekStart + DAYS_PER_PAGE >= dates.length}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white/70 disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7 gap-1">
        {visibleDates.map((dateStr) => {
          const full = isDayFull(dateStr);
          const selected = selectedDate === dateStr;
          const { day, num, month } = fmtDate(dateStr);
          return (
            <button
              key={dateStr}
              disabled={full}
              onClick={() => selectDate(dateStr)}
              className={`flex flex-col items-center rounded-xl border py-2 text-center transition-all ${
                selected
                  ? "border-rose bg-blush shadow-sm"
                  : full
                    ? "border-line bg-white/30 opacity-40"
                    : "border-line bg-white/60 hover:border-gold-DEFAULT"
              }`}
            >
              <span className="text-[9px] font-bold uppercase tracking-wide text-ink-mute">{day}</span>
              <span className={`text-[12px] font-bold ${selected ? "text-rose" : "text-deep"}`}>{num}</span>
              <span className="text-[8px] font-semibold text-ink-mute">{month}</span>
              {full && <span className="mt-0.5 text-[7px] font-bold text-rose">Full</span>}
              {selected && <span className="mt-0.5 text-[7px] font-bold text-rose">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Confirmed banner */}
      {selectedDate && (
        <div className="mt-4 rounded-xl border border-sage-DEFAULT/30 bg-[#EAF4EA] px-3 py-2.5 text-center">
          <span className="text-[12px] font-bold text-sage-DEFAULT">
            ✓ Date confirmed — {fmtDate(selectedDate).full}
          </span>
          <p className="mt-0.5 text-[10px] font-semibold text-sage-DEFAULT/70">
            We'll WhatsApp you the exact time 24 hrs before your unboxing.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main route ─────────────────────────────────────────────────────────────────
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

  const selectedVideoDate = useCartStore((s) => s.selectedVideoDate);
  const canProceed = !videoAddon || !!selectedVideoDate;

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

        {/* Video slot picker */}
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
