import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";

const STEPS = [
  { step: "01", icon: "🎀", title: "Choose your scoop", body: "Pick from Mini (5–6 items · ₹499), Magic (8–10 items · ₹899), or Premium (10–12 items · ₹1,099). Every scoop is hand-curated with jewellery, accessories, trinkets, and lifestyle goodies.", accent: "from-[#EDF5E8] to-[#E0EED8] border-[#B8D0A8]", dot: "bg-[#6A8860]" },
  { step: "02", icon: "🎬", title: "Pick your experience", body: "Choose With Video to get a personal unboxing video filmed just for you, or Without Video for a classic mystery delivery. Both arrive with the same curated surprise inside.", accent: "from-[#F9EDEE] to-[#F0DFE8] border-[#E0A8B8]", dot: "bg-[#C8788E]" },
  { step: "03", icon: "📅", title: "Select your video date", body: "If you chose With Video, pick from available dates (minimum 5 days from today, up to 30 days ahead). Each date has a maximum of 2 video slots to keep every unboxing personal.", accent: "from-[#F5EDF9] to-[#EDE0F4] border-[#C8B0E4]", dot: "bg-[#9880C0]" },
  { step: "04", icon: "💳", title: "Checkout & pay", body: "Enter your delivery address and complete payment via UPI, card, or wallet. Your order is confirmed instantly. Your video slot is secured the moment payment succeeds.", accent: "from-[#FDF8F0] to-[#F7EDD4] border-[#EDD9A8]", dot: "bg-[#C4945A]" },
];

const FAQS = [
  { q: "What's inside a mystery scoop?", a: "Each scoop contains a handpicked mix of jewellery, hair accessories, lifestyle items, trinkets, and more. Exact contents vary and are a surprise — that's the fun! We use your vibe preferences to guide curation." },
  { q: "Can I request specific items?", a: "You can share your favourite categories and styles, and anything you'd like us to avoid. We can't guarantee specific products, but we do our best to match your taste." },
  { q: "How does the video work?", a: "We film your unboxing ourselves on your selected date and time. It's personal, fun, and a great way to relive your LilTreat moment. We'll also tag you on our Instagram story." },
  { q: "What if a video slot is fully booked?", a: "Dates with 2 bookings are marked as fully booked and can't be selected. New dates open up continuously — check back if your preferred date is full." },
  { q: "Can I cancel or modify my order?", a: "Cancellations are accepted up to 24 hours before your video date (for video orders) or before shipping (for normal orders). Contact us on WhatsApp or through the Contact page." },
  { q: "What payment methods do you accept?", a: "We accept UPI (GPay, PhonePe, Paytm), debit/credit cards, net banking, and wallets. All orders are prepaid — no cash on delivery." },
];

export function HowItWorksRoute() {
  const navigate = useNavigate();

  return (
    <Screen top={<TopBar title="How it works" showBack />}>
      <div className="pb-10">
        <div className="bg-gradient-to-b from-[#F7EDD4] via-[#F2DCE4] to-[#EDE0F4] px-5 pb-8 pt-6 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-3 text-[48px]">🎊</motion.div>
          <h1 className="font-serif text-[26px] font-bold text-deep">How liltreats works</h1>
          <p className="mx-auto mt-2 max-w-[300px] text-[13px] font-semibold leading-relaxed text-ink-soft">From picking your scoop to unboxing your surprise — here's everything you need to know.</p>
        </div>

        <div className="px-4 pt-6">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-gold">The journey</div>
          <div className="relative space-y-4 pl-8">
            <div className="absolute left-3 top-3 bottom-3 w-px bg-gradient-to-b from-[#B8D0A8] via-[#E0A8B8] to-[#C8B0E4]" />
            {STEPS.map((s, i) => (
              <motion.div key={s.step} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className={`relative rounded-2xl border bg-gradient-to-br p-4 ${s.accent}`}>
                <div className={`absolute -left-[21px] top-4 h-3.5 w-3.5 rounded-full border-2 border-white ${s.dot}`} />
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[22px]">{s.icon}</span>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-[1.5px] text-ink-mute">Step {s.step}</span>
                    <h3 className="font-serif text-[15px] font-bold leading-tight text-deep">{s.title}</h3>
                  </div>
                </div>
                <p className="text-[12px] font-semibold leading-relaxed text-ink-soft">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-8 px-4">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-gold">FAQs</div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <details key={i} className="group rounded-2xl border border-line bg-white/70 px-4 py-3 open:pb-4">
                <summary className="flex cursor-pointer items-center justify-between gap-2 list-none">
                  <span className="font-serif text-[13px] font-bold text-deep">{faq.q}</span>
                  <span className="ml-auto flex-shrink-0 text-[16px] text-ink-mute transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-[12px] font-semibold leading-relaxed text-ink-soft">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-8 px-4">
          <button onClick={() => navigate({ to: "/" })} className="btn-main">Start shopping →</button>
          <button onClick={() => navigate({ to: "/shop" })} className="btn-outline mt-3">Browse individual items</button>
        </div>
      </div>
    </Screen>
  );
}
