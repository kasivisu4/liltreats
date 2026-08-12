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
  const selectedSlotId = useCartStore((s) => s.selectedVideoSlotId);
  const selectedDate = useCartStore((s) => s.selectedVideoDate);
  const timeSectionRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + 5);
  const maxDate = new Date(minDate);
  maxDate.setDate(minDate.getDate() + 30);

  const fromStr = minDate.toISOString().split("T")[0];
  const toStr = maxDate.toISOString().split("T")[0];

  const { data: slots = [] } = useVideoSlots(fromStr, toStr);

  // Group slots by date
  const byDate: Record<string, typeof slots> = {};
  slots.forEach((s) => {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  });

  const dates = Object.keys(byDate).sort();

  // Week navigation
  const [weekStart, setWeekStart] = useState(0);
  const DAYS_PER_PAGE = 7;
  const visibleDates = dates.slice(weekStart, weekStart + DAYS_PER_PAGE);

  function fmtDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return {
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    };
  }

  function isDayFull(dateStr: string) {
    const daySlots = byDate[dateStr] ?? [];
    const totalBooked = daySlots.reduce((s, sl) => s + sl.bookedCount, 0);
    const totalCap = daySlots.reduce((s, sl) => s + sl.maxCapacity, 0);
    return totalBooked >= totalCap;
  }

  function selectDate(dateStr: string) {
    useCartStore.setState({
      selectedVideoDate: dateStr,
      selectedVideoSlotId: null,
      selectedVideoTime: null,
    });
    // Auto-scroll to time picker after a short delay so it's rendered first
    setTimeout(() => {
      timeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
  }

  const slotsForDate = selectedDate ? (byDate[selectedDate] ?? []) : [];

  return (
    <div className="rounded-2xl border border-gold-light bg-white/70 p-4">
      {/* Step 1 — Date */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-deep text-[10px] font-bold text-white">1</div>
        <Calendar size={14} className="text-gold" />
        <span className="font-serif text-[14px] font-bold text-deep">Pick a date</span>
      </div>

      <p className="mb-3 text-[11px] font-semibold leading-relaxed text-ink-soft">
        Available from{" "}
        <span className="font-bold text-deep">
          {minDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>{" "}
        — max 2 bookings per day.
      </p>

      {/* Date picker row */}
      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <button
            onClick={() => setWeekStart(Math.max(0, weekStart - DAYS_PER_PAGE))}
            disabled={weekStart === 0}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white/70 disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[11px] font-bold text-ink-mute">
            {visibleDates[0] ? fmtDate(visibleDates[0]).date : ""} —{" "}
            {visibleDates[visibleDates.length - 1]
              ? fmtDate(visibleDates[visibleDates.length - 1]).date
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
        <div className="grid grid-cols-7 gap-1">
          {visibleDates.map((dateStr) => {
            const full = isDayFull(dateStr);
            const selected = selectedDate === dateStr;
            const { day, date } = fmtDate(dateStr);
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
                      : "border-line bg-white/60 hover:border-gold"
                }`}
              >
                <span className="text-[9px] font-bold uppercase tracking-wide text-ink-mute">
                  {day}
                </span>
                <span
                  className={`text-[11px] font-bold ${selected ? "text-deep" : full ? "text-ink-mute" : "text-deep"}`}
                >
                  {date.split(" ")[0]}
                </span>
                <span className="text-[8px] font-semibold text-ink-mute">
                  {date.split(" ")[1]}
                </span>
                {full && (
                  <span className="mt-0.5 text-[7px] font-bold text-rose">Full</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2 — Time */}
      <div ref={timeSectionRef}>
        {!selectedDate ? (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-line bg-white/40 px-3 py-3">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-line text-[10px] font-bold text-ink-mute">2</div>
            <Clock size={13} className="text-ink-mute" />
            <span className="text-[12px] font-semibold text-ink-mute">
              Select a date above to see available times
            </span>
          </div>
        ) : (
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-deep text-[10px] font-bold text-white">2</div>
              <Clock size={14} className="text-gold" />
              <span className="text-[13px] font-bold text-deep">Pick a time</span>
              <span className="ml-auto text-[11px] font-semibold text-ink-mute">
                {fmtDate(selectedDate).date}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {slotsForDate.map((slot) => {
                const available = !slot.isBlocked && slot.bookedCount < slot.maxCapacity;
                const isSelected = selectedSlotId === slot.id;
                return (
                  <button
                    key={slot.id}
                    disabled={!available}
                    onClick={() => setVideoSlot(slot.id, slot.date, slot.time)}
                    className={`flex flex-col items-center rounded-xl border py-2.5 text-[11px] font-bold transition-all ${
                      isSelected
                        ? "border-rose bg-blush text-deep shadow-sm"
                        : available
                          ? "border-line bg-white/60 text-deep hover:border-gold"
                          : "border-line bg-white/30 text-ink-mute opacity-40"
                    }`}
                  >
                    {slot.time}
                    {isSelected && (
                      <span className="mt-0.5 text-[8px] font-bold text-rose">✓ Selected</span>
                    )}
                    {!available && (
                      <span className="mt-0.5 text-[8px] font-semibold text-rose">Booked</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Confirmed banner */}
      {selectedSlotId && (
        <div className="mt-3 rounded-xl border border-sage-DEFAULT/30 bg-[#EAF4EA] px-3 py-2.5 text-center">
          <span className="text-[12px] font-bold text-sage-DEFAULT">
            ✓ Confirmed — {fmtDate(selectedDate!).date} at{" "}
            {slotsForDate.find((s) => s.id === selectedSlotId)?.time}
          </span>
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
