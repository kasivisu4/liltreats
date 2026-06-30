import { useMemo } from "react";
import { SPARKLE_SYMBOLS, SPARKLE_COLORS } from "../theme";

// Decorative drifting sparkles for the hero. Positions are computed once.
export function SparkleField({ count = 14 }: { count?: number }) {
  const sparkles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        key: i,
        symbol: SPARKLE_SYMBOLS[i % SPARKLE_SYMBOLS.length],
        left: Math.random() * 90 + 5,
        top: Math.random() * 80 + 5,
        delay: Math.random() * 3,
        duration: 2.5 + Math.random() * 2,
        size: 8 + Math.random() * 10,
        color: SPARKLE_COLORS[i % SPARKLE_COLORS.length],
      })),
    [count],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {sparkles.map((s) => (
        <span
          key={s.key}
          className="absolute animate-sparkle"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            fontSize: `${s.size}px`,
            color: s.color,
          }}
        >
          {s.symbol}
        </span>
      ))}
    </div>
  );
}
