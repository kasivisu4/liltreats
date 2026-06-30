import { Star } from "lucide-react";
import { TESTIMONIALS } from "../data/testimonials";

export function Testimonials() {
  return (
    <div>
      <div className="section-label !mb-3">What they're saying</div>
      <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.handle}
            className="card-glass w-[210px] flex-shrink-0 p-3.5"
          >
            <div className="mb-1.5 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  className={i < t.stars ? "text-gold" : "text-ink-mute/40"}
                  fill={i < t.stars ? "#C4945A" : "none"}
                />
              ))}
            </div>
            <p className="mb-2 text-[12px] font-semibold italic leading-relaxed text-ink">
              "{t.quote}"
            </p>
            <div className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-extrabold text-white"
                style={{ background: t.color }}
              >
                {t.name[0]}
              </span>
              <div>
                <div className="text-[11px] font-bold text-deep">{t.name}</div>
                <div className="text-[10px] text-ink-mute">{t.handle}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
