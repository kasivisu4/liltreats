import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, CheckCircle2 } from "lucide-react";
import { useVideoSlots } from "../api/queries";
import { useCartStore } from "../store/cartStore";
import type { VideoSlot } from "../api/mockApi";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function fmtDay(dateStr: string): { day: string; date: string; weekday: string } {
  const d = new Date(dateStr + "T00:00:00");
  return {
    day: d.toLocaleDateString("en-IN", { day: "numeric" }),
    date: d.toLocaleDateString("en-IN", { month: "short" }),
    weekday: d.toLocaleDateString("en-IN", { weekday: "short" }),
  };
}

export function VideoSlotPicker() {
  const LEAD_DAYS = 5;
  const WINDOW_DAYS = 30;

  const today = useMemo(() => new Date(), []);
  const firstEligible = useMemo(() => addDays(today, LEAD_DAYS), [today]);
  const lastEligible = useMemo(() => addDays(firstEligible, WINDOW_DAYS), [firstEligible]);

  const fromStr = toDateStr(firstEligible);
  const toStr = toDateStr(lastEligible);

  const { data: slots = [], isLoading } = useVideoSlots(fromStr, toStr);

  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selectedSlotId = useCartStore((s) => s.selectedVideoSlotId);
  const selectedVideoTime = useCartStore((s) => s.selectedVideoTime);
  const setVideoSlot = useCartStore((s) => s.setVideoSlot);

  // Build list of unique dates in the window
  const allDates = useMemo(() => {
    const dates: string[] = [];
    for (let i = 0; i <= WINDOW_DAYS; i++) {
      dates.push(toDateStr(addDays(firstEligible, i)));
    }
    return dates;
  }, [firstEligible]);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const map: Record<string, VideoSlot[]> = {};
    slots.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [slots]);

  // Current week (7-day window for date picker)
  const weekDates = useMemo(() => {
    const start = weekOffset * 7;
    return allDates.slice(start, start + 7);
  }, [allDates, weekOffset]);

  const maxWeeks = Math.ceil(allDates.length / 7) - 1;

  // Slots for selected date
  const timeSlotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return (slotsByDate[selectedDate] ?? []).sort((a, b) => {
      const toMins = (t: string) => {
        const [hm, ap] = t.split(" ");
        const [h, m] = hm.split(":").map(Number);
        return (h % 12) * 60 + m + (ap === "PM" ? 720 : 0);
      };
      return toMins(a.time) - toMins(b.time);
    });
  }, [selectedDate, slotsByDate]);

  function isDateFullyBooked(dateStr: string): boolean {
    const dateSlots = slotsByDate[dateStr] ?? [];
    return dateSlots.length > 0 && dateSlots.every((s) => s.bookedCount >= s.maxCapacity || s.isBlocked);
  }

  function isDateAvailable(dateStr: string): boolean {
    const dateSlots = slotsByDate[dateStr] ?? [];
    return dateSlots.some((s) => s.bookedCount < s.maxCapacity && !s.isBlocked);
  }

  function handleSelectSlot(slot: VideoSlot) {
    if (slot.bookedCount >= slot.maxCapacity || slot.isBlocked) return;
    setVideoSlot(slot.id, slot.date, slot.time);
  }

  function handleSelectDate(dateStr: string) {
    setSelectedDate(dateStr);
    // Clear slot selection if changing date
    if (selectedSlotId) {
      const currentSlot = slots.find((s) => s.id === selectedSlotId);
      if (currentSlot?.date !== dateStr) setVideoSlot(null, null, null);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-line bg-white/60 p-4">
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-white/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-rose/30 bg-gradient-to-br from-[#FFF8FA] to-[#F9F0F4] p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[18px]">🎬</span>
        <div>
          <div className="font-serif text-[14px] font-bold text-deep">Choose your video date</div>
          <div className="text-[11px] font-semibold text-ink-soft">
            Earliest: {new Date(fromStr + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long" })} · Max 2 bookings per day
          </div>
        </div>
      </div>

      {/* Week navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => { setWeekOffset((w) => Math.max(0, w - 1)); setSelectedDate(null); }}
          disabled={weekOffset === 0}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/70 disabled:opacity-30"
        >
          <ChevronLeft size={14} className="text-deep" />
        </button>
        <span className="text-[11px] font-bold text-deep">
          {new Date(weekDates[0] + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          {" – "}
          {new Date(weekDates[weekDates.length - 1] + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
        <button
          onClick={() => { setWeekOffset((w) => Math.min(maxWeeks, w + 1)); setSelectedDate(null); }}
          disabled={weekOffset >= maxWeeks}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/70 disabled:opacity-30"
        >
          <ChevronRight size={14} className="text-deep" />
        </button>
      </div>

      {/* Date strip */}
      <div className="mb-4 grid grid-cols-7 gap-1">
        {weekDates.map((dateStr) => {
          const { day, date, weekday } = fmtDay(dateStr);
          const fullyBooked = isDateFullyBooked(dateStr);
          const available = isDateAvailable(dateStr);
          const isSelected = selectedDate === dateStr;
          const hasSlot = selectedSlotId && slots.find((s) => s.id === selectedSlotId)?.date === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => available && handleSelectDate(dateStr)}
              disabled={fullyBooked || !available}
              className={`flex flex-col items-center rounded-xl border p-1.5 transition-all ${
                isSelected
                  ? "border-rose bg-rose text-white shadow-sm"
                  : hasSlot
                  ? "border-rose/50 bg-blush text-deep"
                  : available
                  ? "border-line bg-white/70 text-deep hover:border-rose/40"
                  : "border-line bg-white/20 text-ink-mute opacity-40 cursor-not-allowed"
              }`}
            >
              <span className="text-[8px] font-bold uppercase tracking-wide opacity-70">{weekday}</span>
              <span className="font-serif text-[14px] font-bold leading-tight">{day}</span>
              <span className="text-[8px] font-semibold opacity-70">{date}</span>
              {fullyBooked && (
                <span className="mt-0.5 rounded-full bg-[#FFEEEE] px-1 text-[7px] font-bold text-[#C03040]">
                  Full
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-bold text-deep">
            <Clock size={12} />
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {timeSlotsForDate.map((slot) => {
              const full = slot.bookedCount >= slot.maxCapacity;
              const blocked = slot.isBlocked;
              const disabled = full || blocked;
              const isPickedSlot = selectedSlotId === slot.id;
              const remaining = slot.maxCapacity - slot.bookedCount;

              return (
                <button
                  key={slot.id}
                  onClick={() => !disabled && handleSelectSlot(slot)}
                  disabled={disabled}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all ${
                    isPickedSlot
                      ? "border-rose bg-rose text-white shadow-sm"
                      : disabled
                      ? "border-line bg-white/20 text-ink-mute opacity-40 cursor-not-allowed"
                      : "border-line bg-white/70 text-deep hover:border-rose/40 active:scale-[0.98]"
                  }`}
                >
                  <div>
                    <div className="text-[13px] font-bold">{slot.time}</div>
                    <div className={`text-[10px] font-semibold ${isPickedSlot ? "text-white/80" : "text-ink-mute"}`}>
                      {blocked ? "Blocked" : full ? "Fully booked" : `${remaining} slot${remaining === 1 ? "" : "s"} left`}
                    </div>
                  </div>
                  {isPickedSlot && <CheckCircle2 size={16} className="flex-shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmed selection */}
      {selectedSlotId && selectedVideoTime && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#B0DEB8] bg-[#E8F4EA] px-3 py-2.5">
          <CheckCircle2 size={16} className="flex-shrink-0 text-[#2A6030]" />
          <div className="text-[12px] font-bold text-[#2A6030]">
            Video booked: {new Date(selectedDate! + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at {selectedVideoTime}
          </div>
        </div>
      )}

      {!selectedDate && (
        <p className="mt-2 text-center text-[11px] font-semibold text-ink-mute">
          Tap a date above to see available slots
        </p>
      )}
    </div>
  );
}
