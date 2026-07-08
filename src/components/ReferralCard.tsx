import { useState } from "react";
import { Copy, Check, Gift } from "lucide-react";

export function ReferralCard({ code = "LILT·HYD42" }: { code?: string }) {
  const [copied, setCopied] = useState(false);

  function share() {
    const text = `Use my code ${code} for ₹50 off your first liltreats mystery scoop! ✨ @_liltreats_`;
    if (navigator.share) {
      navigator.share({ title: "liltreats", text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="overflow-hidden rounded-[20px] border-[1.5px] border-gold-light bg-gradient-to-br from-gold-pale to-[#F5EDD0]">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gold-light/60 px-4 py-3.5">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gold/15 text-[20px]">
          <Gift size={18} className="text-gold" />
        </div>
        <div>
          <div className="font-serif text-[14px] font-bold text-deep">
            Refer a friend
          </div>
          <div className="text-[11px] font-semibold text-ink-soft">
            You both get something good.
          </div>
        </div>
      </div>

      {/* Benefit breakdown */}
      <div className="flex items-stretch divide-x divide-gold-light/50 px-0">
        <div className="flex flex-1 flex-col items-center py-3.5 text-center">
          <div className="font-serif text-[22px] font-extrabold text-deep">₹50</div>
          <div className="text-[10px] font-bold text-ink-soft">off for your friend</div>
          <div className="mt-0.5 text-[9px] font-semibold text-ink-mute">on their first scoop</div>
        </div>
        <div className="flex flex-1 flex-col items-center py-3.5 text-center">
          <div className="font-serif text-[22px] font-extrabold text-deep">+1</div>
          <div className="text-[10px] font-bold text-ink-soft">guaranteed slot</div>
          <div className="mt-0.5 text-[9px] font-semibold text-ink-mute">next Monday's drop</div>
        </div>
      </div>

      {/* Code + share */}
      <div className="px-4 pb-4">
        <div className="mb-2.5 rounded-[12px] border-2 border-dashed border-gold bg-white px-3 py-2.5 text-center font-sans text-[18px] font-extrabold tracking-[3px] text-deep">
          {code}
        </div>
        <button
          onClick={share}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-2.5 text-[12px] font-bold text-white transition-transform active:scale-[0.98]"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Copied to clipboard!" : "Share my referral code"}
        </button>
      </div>
    </div>
  );
}
