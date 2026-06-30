import { useCartStore } from "../store/cartStore";
import { VIDEO_ADDON_PRICE } from "../data/tiers";

export function VideoAddon() {
  const on = useCartStore((s) => s.videoAddon);
  const setOn = useCartStore((s) => s.setVideoAddon);

  return (
    <div className="card-glass flex items-center gap-3 p-4">
      <span className="h-2.5 w-2.5 flex-shrink-0 animate-recpulse rounded-full bg-[#D04060]" />
      <div className="flex-1">
        <div className="font-serif text-[13px] font-semibold text-deep">
          Add video recording
        </div>
        <div className="mt-0.5 text-[11px] font-semibold leading-snug text-ink-soft">
          A professional aesthetic reel like our Instagram posts — yours to keep & share.
        </div>
      </div>
      <div className="flex flex-shrink-0 flex-col items-end gap-1">
        <span className="font-serif text-[17px] font-bold text-gold">
          +₹{VIDEO_ADDON_PRICE}
        </span>
        <button
          role="switch"
          aria-checked={on}
          aria-label="Add video recording"
          onClick={() => setOn(!on)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            on ? "bg-gold" : "bg-[#E0D0D8]"
          }`}
        >
          <span
            className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-all ${
              on ? "left-[23px]" : "left-[3px]"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
