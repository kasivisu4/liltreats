import { Video, Package } from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";

// Mock bookings data — wired to real API in Module 30
const MOCK_BOOKINGS = [
  { id: "BK-001", orderId: "LT-2026-00042", scoopTier: "magic", experience: "with_video", videoDate: "2026-08-20", videoTime: "11:00 AM", status: "confirmed", createdAt: new Date().toISOString() },
  { id: "BK-002", orderId: "LT-2026-00031", scoopTier: "mini", experience: "without_video", videoDate: null, videoTime: null, status: "confirmed", createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
];

type Booking = typeof MOCK_BOOKINGS[0];

function BookingCard({ booking }: { booking: Booking }) {
  const isVideo = booking.experience === "with_video";
  const tierLabel = booking.scoopTier === "mini" ? "🌿 Mini Scoop" : booking.scoopTier === "magic" ? "✨ Magic Scoop" : "👑 Premium Scoop";

  return (
    <div className="card-glass mb-3 p-4">
      <div className="mb-2.5 flex items-start gap-3">
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${isVideo ? "bg-[#FFF0F4] text-rose" : "bg-gold-pale text-gold"}`}>
          {isVideo ? <Video size={18} /> : <Package size={18} />}
        </div>
        <div className="flex-1">
          <div className="font-serif text-[15px] font-bold text-deep">{tierLabel}</div>
          <div className="mt-0.5 text-[11px] font-semibold text-ink-mute">Booking {booking.id} · Order {booking.orderId}</div>
        </div>
        <span className={`rounded-[10px] px-2.5 py-1.5 text-[10px] font-bold ${booking.status === "confirmed" ? "bg-[#D8F0D8] text-[#2A6030]" : "bg-[#FFE8E8] text-[#B02840]"}`}>
          {booking.status === "confirmed" ? "Confirmed" : "Cancelled"}
        </span>
      </div>

      <div className="space-y-1.5 rounded-xl bg-white/50 px-3 py-2.5 text-[12px]">
        <div className="flex justify-between">
          <span className="font-semibold text-ink-soft">Experience</span>
          <span className="font-bold text-deep">{isVideo ? "🎬 With Video" : "📦 Without Video"}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold text-ink-soft">Scoop tier</span>
          <span className="font-bold capitalize text-deep">{booking.scoopTier}</span>
        </div>
        {isVideo && booking.videoDate && (
          <>
            <div className="flex justify-between border-t border-line pt-1.5">
              <span className="font-semibold text-ink-soft">Video date</span>
              <span className="font-bold text-rose">
                {new Date(booking.videoDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" })}
              </span>
            </div>
            {booking.videoTime && (
              <div className="flex justify-between">
                <span className="font-semibold text-ink-soft">Video time</span>
                <span className="font-bold text-rose">{booking.videoTime}</span>
              </div>
            )}
          </>
        )}
        <div className="flex justify-between border-t border-line pt-1.5">
          <span className="font-semibold text-ink-soft">Booked on</span>
          <span className="font-bold text-deep">{new Date(booking.createdAt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
      </div>

      {isVideo && booking.videoDate && (
        <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-rose/20 bg-[#FFF0F4] px-3 py-2">
          <span className="text-[16px]">📅</span>
          <p className="text-[11px] font-semibold text-rose">We'll tag you on @_liltreats_ on your video day!</p>
        </div>
      )}
    </div>
  );
}

export function BookingsRoute() {
  const videoBookings = MOCK_BOOKINGS.filter((b) => b.experience === "with_video");
  const normalBookings = MOCK_BOOKINGS.filter((b) => b.experience === "without_video");

  return (
    <Screen top={<TopBar title="My bookings" />}>
      <div className="p-4">
        {videoBookings.length > 0 && (
          <>
            <div className="mb-3 flex items-center gap-2">
              <Video size={14} className="text-rose" />
              <span className="text-[12px] font-bold uppercase tracking-wide text-rose">Video bookings ({videoBookings.length})</span>
            </div>
            {videoBookings.map((b) => <BookingCard key={b.id} booking={b} />)}
          </>
        )}
        {normalBookings.length > 0 && (
          <>
            <div className="mb-3 mt-2 flex items-center gap-2">
              <Package size={14} className="text-gold" />
              <span className="text-[12px] font-bold uppercase tracking-wide text-gold">Normal scoops ({normalBookings.length})</span>
            </div>
            {normalBookings.map((b) => <BookingCard key={b.id} booking={b} />)}
          </>
        )}
        <div className="h-6" />
      </div>
    </Screen>
  );
}
