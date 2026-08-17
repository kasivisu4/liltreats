interface Step {
  label: string;
}

const STEPS: Step[] = [
  { label: "Preferences" },
  { label: "Checkout" },
  { label: "Confirm" },
];

interface StepIndicatorProps {
  /** 1-indexed current step */
  current: number;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2 border-b border-line bg-gold-pale px-4 py-2">
      {STEPS.map(({ label }, i) => {
        const n = i + 1;
        const isActive = n === current;
        const isDone = n < current;
        return (
          <div key={n} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-5 bg-line" />}
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold transition-colors ${
                  isActive
                    ? "bg-deep text-cream"
                    : isDone
                    ? "bg-gold text-white"
                    : "bg-line text-ink-mute"
                }`}
              >
                {isDone ? "✓" : n}
              </span>
              <span
                className={`text-[10px] font-bold ${
                  isActive ? "text-deep" : isDone ? "text-gold" : "text-ink-mute"
                }`}
              >
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
