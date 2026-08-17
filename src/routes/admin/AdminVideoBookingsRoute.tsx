import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Lock, Unlock, Clock } from "lucide-react";
import { useAllScoopBookings, useVideoSlots, useBlockVideoSlot } from "../../api/queries";

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(d.getDate() + n);
  return r;
}

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

export function AdminVideoBookingsRoute() {
  const today = useMemo(() => new Date(), []);
  const from = toDateStr(today);
  const to = toDateStr(addDays(today, 45));

  const { data: slots = [], isLoading: slotsLoading } = useVideoSlots(from, to);
  const { data: bookings = [] } = useAllScoopBookings();
  const blockSlot = useBlockVideoSlot();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  // Unique dates
  const allDates = useMemo(() => {
    const set = new Set(slots.map((s) => s.date));
    return Array.from(set).sort();
  }, [slots]);

  const weekDates = useMemo(() => allDates.slice(weekOffset * 7, weekOffset * 7 + 7), [allDates, weekOffset]);
  const maxWeeks = Math.max(0, Math.ceil(allDates.length / 7) - 1);

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const map: Record<string, typeof slots> = {};
    slots.forEach((s) => {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    });
    return map;
  }, [slots]);

  // Group bookings by video date
  const bookingsByDate = useMemo(() => {
    const map: Record<string, typeof bookings> = {};
    bookings
      .filter((b) => b.experience === "with_video" && b.videoDate)
      .forEach((b) => {
        const d = b.videoDate!;
        if (!map[d]) map[d] = [];
        map[d].push(b);
      });
    return map;
  }, [bookings]);

  function fmtDate(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    return {
      weekday: d.toLocaleDateString("en-IN", { weekday: "short" }),
      day: d.toLocaleDateString("en-IN", { day: "numeric" }),
      month: d.toLocaleDateString("en-IN", { month: "short" }),
    };
  }

  const selectedDateSlots = selectedDate ? (slotsByDate[selectedDate] ?? []) : [];
  const selectedDateBookings = selectedDate ? (bookingsByDate[selectedDate] ?? []) : [];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="font-serif text-[22px] font-bold text-deep">Video Bookings</h1>
        <p className="text-[12px] font-semibold text-ink-soft">
          {bookings.filter((b) => b.experience === "with_video").length} total video bookings
        </p>
      </div>

      {/* Calendar week navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => { setWeekOffset((w) => Math.max(0, w - 1)); setSelectedDate(null); }}
          disabled={weekOffset === 0}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/70 disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-[12px] font-bold text-deep">
          {weekDates[0] && new Date(weekDates[0] + "T00:00:00").toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
        </span>
        <button
          onClick={() => { setWeekOffset((w) => Math.min(maxWeeks, w + 1)); setSelectedDate(null); }}
          disabled={weekOffset >= maxWeeks}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white/70 disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Date grid */}
      <div className="mb-4 grid grid-cols-7 gap-1.5">
        {slotsLoading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-white/50" />
            ))
          : weekDates.map((dateStr) => {
              const { weekday, day, month } = fmtDate(dateStr);
              const dateSlots = slotsByDate[dateStr] ?? [];
              const booked = (bookingsByDate[dateStr] ?? []).length;
              const capacity = dateSlots.reduce((s, sl) => s + sl.maxCapacity, 0);
              const available = capacity - booked;
              const isSelected = selectedDate === dateStr;
              const isFullyBooked = available === 0 && capacity > 0;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`flex flex-col items-center rounded-xl border px-1 py-2 text-center transition-all ${
                    isSelected
                      ? "border-deep bg-deep text-white"
                      : isFullyBooked
                      ? "border-[#F0B0B0] bg-[#FFE8E8]"
                      : booked > 0
                      ? "border-[#F0D080] bg-[#FFF8E0]"
                      : "border-line bg-white/70"
                  }`}
                >
                  <span className="text-[8px] font-bold uppercase">{weekday}</span>
                  <span className="font-serif text-[14px] font-bold">{day}</span>
                  <span className="text-[8px] opacity-70">{month}</span>
                  <div className="mt-1 flex items-center gap-0.5">
                    <span
                      className={`text-[9px] font-extrabold ${
                        isSelected ? "text-white" : isFullyBooked ? "text-[#C03040]" : "text-[#2A6030]"
                      }`}
                    >
                      {booked}/{capacity}
                    </span>
                  </div>
                  {isFullyBooked && (
                    <span className={`rounded-sm px-1 text-[7px] font-bold ${isSelected ? "text-white/80" : "text-[#C03040]"}`}>
                      Full
                    </span>
                  )}
                </button>
              );
            })}
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <div className="rounded-2xl border border-line bg-white/70 p-4">
          <div className="mb-3 font-serif text-[16px] font-bold text-deep">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>

          {/* Bookings for this date */}
          {selectedDateBookings.length > 0 && (
            <div className="mb-3">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-ink-mute">
                Bookings ({selectedDateBookings.length})
              </div>
              <div className="space-y-1.5">
                {selectedDateBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 rounded-xl bg-[#FFF0F4] px-3 py-2"
                  >
                    <Clock size={14} className="flex-shrink-0 text-rose" />
                    <div className="flex-1">
                      <div className="text-[12px] font-bold text-deep">
                        {b.id} · {b.scoopTier} scoop
                      </div>
                      <div className="text-[10px] font-semibold text-rose">{b.videoTime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time slots + block/unblock */}
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-ink-mute">
            Slots
          </div>
          <div className="grid grid-cols-2 gap-2">
            {selectedDateSlots.map((slot) => {
              const available = slot.bookedCount < slot.maxCapacity && !slot.isBlocked;
              return (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                    slot.isBlocked
                      ? "border-[#F0C0C0] bg-[#FFE8E8]"
                      : slot.bookedCount >= slot.maxCapacity
                      ? "border-[#F0D080] bg-[#FFF8E0]"
                      : "border-line bg-white/50"
                  }`}
                >
                  <div>
                    <div className="text-[12px] font-bold text-deep">{slot.time}</div>
                    <div className="text-[10px] font-semibold text-ink-mute">
                      {slot.isBlocked
                        ? "Blocked"
                        : `${slot.bookedCount}/${slot.maxCapacity} booked`}
                    </div>
                  </div>
                  <button
                    onClick={() => blockSlot.mutate({ slotId: slot.id, blocked: !slot.isBlocked })}
                    disabled={blockSlot.isPending}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold ${
                      slot.isBlocked
                        ? "bg-[#2A6030] text-white"
                        : "bg-[#C03040] text-white"
                    }`}
                  >
                    {slot.isBlocked ? <Unlock size={10} /> : <Lock size={10} />}
                    {slot.isBlocked ? "Unblock" : "Block"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!selectedDate && (
        <p className="mt-4 text-center text-[12px] font-semibold text-ink-mute">
          Tap a date to see bookings and manage slots
        </p>
      )}
    </div>
  );
}
