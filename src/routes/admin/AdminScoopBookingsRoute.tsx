import { useState } from "react";
import { useAllScoopBookings } from "../../api/queries";
import type { ScoopBooking } from "../../api/mockApi";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function AdminScoopBookingsRoute() {
  const { data: bookings = [], isLoading } = useAllScoopBookings();
  const [filter, setFilter] = useState<"all" | "with_video" | "without_video">("all");
  const [tierFilter, setTierFilter] = useState<"all" | "mini" | "magic" | "premium">("all");

  const filtered = bookings.filter((b) => {
    if (filter !== "all" && b.experience !== filter) return false;
    if (tierFilter !== "all" && b.scoopTier !== tierFilter) return false;
    return true;
  });

  const withVideo = bookings.filter((b) => b.experience === "with_video").length;
  const withoutVideo = bookings.filter((b) => b.experience === "without_video").length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="font-serif text-[22px] font-bold text-deep">Scoop Bookings</h1>
        <p className="text-[12px] font-semibold text-ink-soft">
          {bookings.length} total · {withVideo} with video · {withoutVideo} without video
        </p>
      </div>

      {/* Filters */}
      <div className="mb-3 flex flex-wrap gap-2">
        {(["all", "with_video", "without_video"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${
              filter === f ? "border-deep bg-deep text-white" : "border-line bg-white/70 text-ink-soft"
            }`}
          >
            {f === "all" ? "All" : f === "with_video" ? "🎬 With Video" : "📦 Without Video"}
          </button>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "mini", "magic", "premium"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTierFilter(t)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-bold ${
              tierFilter === t ? "border-gold bg-gold-pale text-deep" : "border-line bg-white/70 text-ink-soft"
            }`}
          >
            {t === "all" ? "All tiers" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-[40px]">📦</div>
          <p className="mt-2 font-serif text-[16px] font-bold text-deep">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingRow({ booking }: { booking: ScoopBooking }) {
  const isVideo = booking.experience === "with_video";
  const tierLabel =
    booking.scoopTier === "mini" ? "🌿 Mini" : booking.scoopTier === "magic" ? "✨ Magic" : "👑 Premium";

  return (
    <div className="rounded-2xl border border-line bg-white/70 p-4">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-deep">{booking.id}</span>
            <span className="rounded-lg bg-[#F2DCE4] px-2 py-0.5 text-[10px] font-bold text-mauve">
              {tierLabel}
            </span>
            <span
              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                isVideo ? "bg-[#FFF0F4] text-rose" : "bg-gold-pale text-gold"
              }`}
            >
              {isVideo ? "🎬 With Video" : "📦 Without Video"}
            </span>
            <span
              className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                booking.status === "confirmed"
                  ? "bg-[#D8F0D8] text-[#2A6030]"
                  : "bg-[#FFE8E8] text-[#B02840]"
              }`}
            >
              {booking.status}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-ink-mute">
            Order: {booking.orderId} · Booked: {fmtDate(booking.createdAt)}
          </div>
        </div>
        {isVideo && booking.videoDate && (
          <div className="text-right">
            <div className="text-[11px] font-bold uppercase tracking-wide text-rose">Video</div>
            <div className="text-[13px] font-bold text-deep">
              {new Date(booking.videoDate + "T00:00:00").toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </div>
            {booking.videoTime && (
              <div className="text-[11px] font-semibold text-ink-soft">{booking.videoTime}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
