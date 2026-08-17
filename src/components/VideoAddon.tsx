import { useCartStore } from "../store/cartStore";
import { VIDEO_ADDON_PRICE } from "../data/tiers";

export function VideoAddon() {
  const on = useCartStore((s) => s.videoAddon);
  const setOn = useCartStore((s) => s.setVideoAddon);

  return (
    <div
      className={`overflow-hidden rounded-[20px] border-[1.5px] transition-colors ${
        on
          ? "border-rose bg-gradient-to-br from-[#FAF0F3] to-[#F4E4EC]"
          : "border-line bg-white/70"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Rec dot + icon */}
        <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#D04060]/10">
          <span className="text-[20px]">🎬</span>
        </div>

        {/* Copy */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 flex-shrink-0 animate-recpulse rounded-full bg-[#D04060]" />
            <span className="font-serif text-[14px] font-bold text-deep">
              Add a packing video
            </span>
          </div>
          <p className="mt-1 text-[11px] font-semibold leading-relaxed text-ink-soft">
            We film your scoop being packed — aesthetic, posted on{" "}
            <span className="font-bold text-mauve">@_liltreats_</span>, you get
            tagged and keep the video forever.
          </p>
        </div>

        {/* Price + toggle */}
        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          <span className={`font-serif text-[18px] font-bold ${on ? "text-rose" : "text-gold"}`}>
            +₹{VIDEO_ADDON_PRICE}
          </span>
          <button
            role="switch"
            aria-checked={on}
            aria-label="Add video recording"
            onClick={() => setOn(!on)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              on ? "bg-rose" : "bg-[#E0D0D8]"
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

      {/* Active state banner */}
      {on && (
        <div className="border-t border-rose/20 bg-rose/10 px-4 py-2.5 text-center text-[11px] font-bold text-rose">
          🎥 Video add-on included · We'll tag you on @_liltreats_
        </div>
      )}
    </div>
  );
}
