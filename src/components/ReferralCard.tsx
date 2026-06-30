import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function ReferralCard({ code = "LILT·HYD42" }: { code?: string }) {
  const [copied, setCopied] = useState(false);

  function share() {
    const text = `Use my code ${code} for ₹20 off your first liltreats scoop! ✨`;
    if (navigator.share) {
      navigator.share({ title: "liltreats", text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-[18px] border-[1.5px] border-gold-light bg-gold-pale p-4">
      <div className="mb-1 font-serif text-[14px] font-semibold text-deep">
        Refer a friend, get priority slot ✦
      </div>
      <div className="mb-2.5 text-[12px] font-semibold leading-snug text-ink-soft">
        Your friend gets ₹20 off their first scoop. You jump the queue next week!
      </div>
      <div className="mb-2 rounded-[10px] border-2 border-dashed border-gold bg-white p-2.5 text-center font-sans text-[18px] font-extrabold tracking-[3px] text-deep">
        {code}
      </div>
      <button
        onClick={share}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-2.5 text-[12px] font-bold text-white transition-transform active:scale-[0.98]"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied!" : "Share my referral code"}
      </button>
    </div>
  );
}
