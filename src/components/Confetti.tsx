import { useMemo } from "react";
import { motion } from "framer-motion";
import { CONFETTI_COLORS } from "../theme";

// Soft pastel confetti burst — rendered on the confirmation screen.
export function Confetti({ count = 22 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        key: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        rotate: Math.random() * 360,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        round: Math.random() > 0.5,
        drift: (Math.random() - 0.5) * 60,
      })),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.key}
          className="absolute top-0 h-2 w-2"
          style={{
            left: `${p.left}%`,
            background: p.color,
            borderRadius: p.round ? "50%" : "2px",
          }}
          initial={{ y: -10, opacity: 1, rotate: 0 }}
          animate={{ y: 360, x: p.drift, opacity: 0, rotate: p.rotate + 420 }}
          transition={{ duration: 1.8, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
