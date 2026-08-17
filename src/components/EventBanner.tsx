import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { BANNERS } from "../data/banners";
import { useCartStore } from "../store/cartStore";

export function EventBanner() {
  const banner = useCartStore((s) => s.banner);
  const setBanner = useCartStore((s) => s.setBanner);
  const active = banner !== "none" ? BANNERS[banner] : null;

  return (
    <AnimatePresence mode="wait">
      {active && (
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-4 mt-3 overflow-hidden rounded-2xl"
          style={{ border: `1.5px solid ${active.border}` }}
        >
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ background: active.bg }}>
            <span className="text-[26px]">{active.emoji}</span>
            <div className="min-w-0">
              <div className="font-serif text-sm font-semibold" style={{ color: active.titleColor }}>
                {active.title}
              </div>
              <div className="mt-0.5 text-[11px] font-semibold" style={{ color: active.subColor }}>
                {active.subtitle}
              </div>
            </div>
            <button
              aria-label="Hide banner"
              onClick={() => setBanner("none")}
              className="ml-auto flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/50"
              style={{ color: active.titleColor }}
            >
              <X size={13} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
