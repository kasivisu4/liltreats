import { useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";
import { TIERS, TIER_BY_ID, VIDEO_ADDON_PRICE, type TierId } from "../data/tiers";
import { useCartStore } from "../store/cartStore";
import { useVideoSlots } from "../api/queries";

const VALID = new Set(TIERS.map((t) => t.id));

// ── Board data ─────────────────────────────────────────────────────────────────
// Board A & B — actual item lists from the liltreats mystery scoop boards.
// To show real photos: drop board-a.jpg and board-b.jpg into /public/ and
// the <img> tags below will pick them up automatically.

const BOARDS = [
  {
    id: 1 as const,
    label: "Board A",
    emoji: "🎀",
    // Replace with /board-a.jpg once image is in /public/
    src: "/board-a.jpg",
    fallback: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
    items: [
      "Scrunchy", "Key Chain", "Hair Claw", "Cute Locks",
      "Soaptube", "Wallets", "Makeup Brush", "Rings",
      "MiniBooks", "Hand Towel", "Organisers", "Hotpacks",
      "Plushies", "Ear rings", "Bottle", "Wet Wipes",
      "Notebook", "Desk Lamp", "Cute Pens", "Makeup Sponge",
      "Chain", "Tumbler", "Bracelet", "Coin Pouch",
    ],
  },
  {
    id: 2 as const,
    label: "Board B",
    emoji: "🌸",
    // Replace with /board-b.jpg once image is in /public/
    src: "/board-b.jpg",
    fallback: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80",
    items: [
      "Books", "Key Chain", "Sticky Notes", "Wet Wipes",
      "Pens", "Decorative Tape", "Socks", "Tumbler",
      "Waterbottle", "Hand Towel", "Coin Purse", "Glue Pen",
      "MiniBooks", "Desk Lamp", "Pencil Pouch", "Sharpener",
      "Press on Nails", "Washi Tape", "DIY Kit", "Cute Locks",
      "Highlighter", "Eraser", "Paper Soap", "Stationery Set",
    ],
  },
];

// ── StepIndicator ──────────────────────────────────────────────────────────────
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

// ── VideoSlotPicker ────────────────────────────────────────────────────────────
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

  const byDate: Record<string, typeof slots> = {};
  slots.forEach((s) => {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  });

  const apiDates = Object.keys(byDate).sort();
  const dates =
    apiDates.length > 0
      ? apiDates
      : (() => {
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
      full: d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
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
    const daySlots = byDate[dateStr];
    const slot = daySlots?.find(
      (s) => !s.isBlocked && s.bookedCount < s.maxCapacity,
    );
    setVideoSlot(slot?.id ?? dateStr, dateStr, slot?.time ?? "");
  }

  return (
    <div className="rounded-2xl border border-gold-light bg-white/70 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Calendar size={15} className="text-gold-DEFAULT" />
        <span className="font-serif text-[14px] font-bold text-deep">
          Pick your video date
        </span>
      </div>
      <p className="mb-4 text-[11px] font-semibold leading-relaxed text-ink-soft">
        Earliest:{" "}
        <span className="font-bold text-deep">
          {minDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
        . We'll confirm your exact time 24 hrs before.
      </p>

      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => setWeekStart(Math.max(0, weekStart - DAYS_PER_PAGE))}
          disabled={weekStart === 0}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white/70 disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-[11px] font-bold text-ink-mute">
          {visibleDates[0]
            ? `${fmtDate(visibleDates[0]).num} ${fmtDate(visibleDates[0]).month}`
            : ""}{" "}
          —{" "}
          {visibleDates[visibleDates.length - 1]
            ? `${fmtDate(visibleDates[visibleDates.length - 1]).num} ${fmtDate(visibleDates[visibleDates.length - 1]).month}`
            : ""}
        </span>
        <button
          onClick={() =>
            setWeekStart(
              Math.min(dates.length - DAYS_PER_PAGE, weekStart + DAYS_PER_PAGE),
            )
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
              <span className="text-[9px] font-bold uppercase tracking-wide text-ink-mute">
                {day}
              </span>
              <span
                className={`text-[12px] font-bold ${selected ? "text-rose" : "text-deep"}`}
              >
                {num}
              </span>
              <span className="text-[8px] font-semibold text-ink-mute">{month}</span>
              {full && (
                <span className="mt-0.5 text-[7px] font-bold text-rose">Full</span>
              )}
              {selected && (
                <span className="mt-0.5 text-[7px] font-bold text-rose">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-4 rounded-xl border border-sage-DEFAULT/30 bg-[#EAF4EA] px-3 py-2.5 text-center">
          <span className="text-[12px] font-bold text-sage-DEFAULT">
            ✓ Date confirmed —{" "}
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
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
  const avoidNote = useCartStore((s) => s.avoidNote);
  const setAvoidNote = useCartStore((s) => s.setAvoidNote);
  const videoAddon = useCartStore((s) => s.videoAddon);
  const setVideoAddon = useCartStore((s) => s.setVideoAddon);
  const selectedVideoDate = useCartStore((s) => s.selectedVideoDate);
  const selectedBoard = useCartStore((s) => s.selectedBoard);
  const setSelectedBoard = useCartStore((s) => s.setSelectedBoard);

  const valid = tier && VALID.has(tier as TierId);

  useEffect(() => {
    if (valid) setTier(tier as TierId);
  }, [valid, tier, setTier]);

  useEffect(() => {
    if (!valid) navigate({ to: "/" });
  }, [valid, navigate]);

  if (!valid) return null;
  const t = TIER_BY_ID(tier as TierId);

  const canProceed =
    selectedBoard !== null && (!videoAddon || !!selectedVideoDate);

  return (
    <Screen top={<TopBar title="Your scoop" showBack />}>
      <StepIndicator current={1} />
      <div className="p-4">

        {/* Tier summary */}
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#F2DCE4] to-[#EDE0F4] p-4">
          <span className="text-[30px]">{t.icon}</span>
          <div className="flex-1">
            <div className="font-serif text-[17px] font-bold text-deep">{t.name}</div>
            <div className="text-[12px] font-semibold text-ink-soft">
              {t.itemsLabel} · ₹{t.price.toLocaleString("en-IN")} + shipping
            </div>
          </div>
        </div>

        {/* Mystery scoop notice */}
        <div className="mb-5 rounded-2xl border border-gold-DEFAULT/40 bg-gradient-to-br from-[#FDF8F0] to-[#F7EDD4] p-4">
          <p className="text-[12px] font-bold leading-relaxed text-deep">
            🎁 This is a Mystery Scoop — items are completely random and cannot be predicted.
          </p>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-ink-soft">
            You'll receive whichever items come in your scoop. The only thing you can influence is your board choice and one item to avoid.
          </p>
        </div>

        {/* ── Step 1: Pick a board ────────────────────────────────────────── */}
        <div className="mb-1 flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-deep text-[10px] font-bold text-white">
            1
          </span>
          <span className="text-[13px] font-bold text-deep">Pick your board</span>
          <span className="ml-1 rounded-full bg-rose/20 px-2 py-0.5 text-[9px] font-bold text-rose">
            Required
          </span>
        </div>
        <p className="mb-3 text-[11px] font-semibold text-ink-mute">
          Each board has different items. Pick the one whose items you'd prefer your scoop to come from.
        </p>

        <div className="mb-6 grid grid-cols-2 gap-3">
          {BOARDS.map((board) => {
            const selected = selectedBoard === board.id;
            return (
              <button
                key={board.id}
                onClick={() => setSelectedBoard(board.id)}
                className={`group relative overflow-hidden rounded-2xl border-[2.5px] transition-all ${
                  selected
                    ? "border-rose shadow-md"
                    : "border-line hover:border-gold-DEFAULT"
                }`}
              >
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={board.src}
                    alt={board.label}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 transition-opacity ${selected ? "bg-rose/15" : "bg-black/5"}`} />
                  {selected && (
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose text-[11px] font-bold text-white shadow">
                      ✓
                    </div>
                  )}
                </div>
                <div className={`px-3 py-2.5 text-left transition-colors ${selected ? "bg-blush" : "bg-white/80"}`}>
                  <div className="font-serif text-[13px] font-bold text-deep">
                    {board.emoji} {board.label}
                  </div>
                  <div className="text-[10px] font-semibold text-ink-mute">
                    {board.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {!selectedBoard && (
          <div className="mb-5 rounded-xl border border-rose/30 bg-blush px-3 py-2.5 text-[12px] font-semibold text-deep">
            Please pick a board above to continue.
          </div>
        )}

        {/* ── Step 2: Anything to avoid ───────────────────────────────────── */}
        <div className="mb-1 flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-deep text-[10px] font-bold text-white">
            2
          </span>
          <span className="text-[13px] font-bold text-deep">One thing to avoid</span>
          <span className="ml-1 rounded-full bg-line px-2 py-0.5 text-[9px] font-bold text-ink-mute">
            Optional
          </span>
        </div>
        <div className="mb-2 rounded-xl border border-line bg-white/60 px-3 py-2 text-[11px] font-semibold leading-relaxed text-ink-soft">
          You may name <span className="font-bold text-deep">only 1 item</span> to avoid. We'll do our best to exclude it, but since the scoop is random we cannot guarantee it.
        </div>
        <textarea
          value={avoidNote}
          onChange={(e) => setAvoidNote(e.target.value)}
          placeholder="e.g. hair claws, I'm allergic to nickel, I already have too many rings…"
          rows={2}
          maxLength={120}
          className="field-input mb-1 resize-none"
        />
        <div className="mb-6 flex justify-between text-[10px] font-semibold text-ink-mute">
          <span>One item only — keep it specific</span>
          <span>{avoidNote.length}/120</span>
        </div>

        {/* ── Step 3: Video addon ─────────────────────────────────────────── */}
        <div className="mb-1 flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-deep text-[10px] font-bold text-white">
            3
          </span>
          <span className="text-[13px] font-bold text-deep">With or without video?</span>
        </div>
        <p className="mb-3 text-[11px] font-semibold text-ink-mute">
          Add a professional unboxing video of your scoop — filmed, edited, and yours to keep.
        </p>
        <div className="mb-2 grid grid-cols-2 gap-3">
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
                ? "border-gold-DEFAULT bg-gradient-to-br from-[#FDF8F0] to-[#F7EDD4] shadow-sm"
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
              <span className="rounded-full bg-gold-DEFAULT px-2.5 py-0.5 text-[10px] font-bold text-white">
                Selected
              </span>
            )}
          </button>
        </div>

        {videoAddon && (
          <div className="mb-5">
            <VideoSlotPicker />
          </div>
        )}

        {videoAddon && !selectedVideoDate && (
          <div className="mb-5 rounded-xl border border-gold-DEFAULT/40 bg-[#FDF8F0] px-3 py-2.5 text-[12px] font-semibold text-deep">
            Please select a video date above to continue.
          </div>
        )}

        {!videoAddon && <div className="mb-5" />}

        <button
          onClick={() => navigate({ to: "/cart" })}
          disabled={!canProceed}
          className="btn-main mt-1"
        >
          Continue to checkout →
        </button>
        <div className="h-8" />
      </div>
    </Screen>
  );
}
