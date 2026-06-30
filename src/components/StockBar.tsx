import { motion } from "framer-motion";

type Tone = "ok" | "low" | "out";

export function StockBar({ pct, tone }: { pct: number; tone: Tone }) {
  const fill =
    tone === "out"
      ? "bg-[#D04060]"
      : tone === "low"
        ? "bg-gradient-to-r from-[#D08020] to-[#F0B050]"
        : "bg-gradient-to-r from-[#6A9850] to-[#98C870]";
  return (
    <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-sm bg-[rgba(196,148,90,0.15)]">
      <motion.div
        className={`h-full rounded-sm ${fill}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
