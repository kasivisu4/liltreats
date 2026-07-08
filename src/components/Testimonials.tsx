import { Star } from "lucide-react";
import { TESTIMONIALS } from "../data/testimonials";

export function Testimonials() {
  return (
    <div>
      <div className="mb-1 text-center">
        <h2 className="font-serif text-[20px] font-bold text-deep">
          Real scoops, real smiles
        </h2>
        <p className="mt-0.5 text-[11px] font-semibold text-ink-mute">
          From people who opened the box before you
        </p>
      </div>

      <div className="mt-4 no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.handle}
            className="w-[230px] flex-shrink-0 rounded-[20px] border border-line bg-white/80 p-4 shadow-soft backdrop-blur-sm"
          >
            {/* Stars */}
            <div className="mb-2.5 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={i < t.stars ? "text-gold" : "text-ink-mute/30"}
                  fill={i < t.stars ? "#C4945A" : "none"}
                />
              ))}
            </div>

            {/* Quote */}
            <p className="mb-3.5 text-[12.5px] font-semibold italic leading-relaxed text-ink">
              "{t.quote}"
            </p>

            {/* Attribution */}
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-serif text-[13px] font-extrabold text-white shadow-sm"
                style={{ background: t.color }}
              >
                {t.name[0]}
              </span>
              <div>
                <div className="text-[12px] font-bold text-deep">{t.name}</div>
                <div className="text-[10px] font-semibold text-ink-mute">{t.handle}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
