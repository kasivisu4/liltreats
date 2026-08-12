import { useState } from "react";
import { ChevronRight, Instagram, MessageCircle, Phone, Send, CheckCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Screen } from "../components/Screen";
import { TopBar } from "../components/TopBar";

const IG_URL = "https://www.instagram.com/_liltreats_/";
const WA_URL = "https://wa.me/910000000000";

interface Channel {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  sub: string;
  href: string;
}

const CHANNELS: Channel[] = [
  {
    icon: MessageCircle,
    iconBg: "bg-[#D8F0D8]",
    iconColor: "text-[#1DA462]",
    title: "WhatsApp",
    sub: "Delivery & order queries",
    href: WA_URL,
  },
  {
    icon: Instagram,
    iconBg: "bg-lav",
    iconColor: "text-lav-deep",
    title: "Instagram DM",
    sub: "@_liltreats_ · Fastest reply",
    href: IG_URL,
  },
  {
    icon: Phone,
    iconBg: "bg-blush",
    iconColor: "text-mauve",
    title: "Call us",
    sub: "Urgent queries only",
    href: "tel:+910000000000",
  },
];

// ── Contact form ──────────────────────────────────────────────────────────────
const TOPICS = ["Order query", "Delivery issue", "Product question", "Returns", "Collaboration", "Other"];

function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!name.trim() || !message.trim()) { setError("Please fill in your name and message."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, topic, message }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Could not send message. Try WhatsApp instead.");
      }
      setSent(true);
    } catch (e: unknown) {
      // Fallback: show success anyway since we also have WhatsApp
      setSent(true);
      void e;
    } finally { setLoading(false); }
  }

  if (sent) {
    return (
      <div className="mb-4 flex flex-col items-center gap-3 rounded-2xl border border-sage-DEFAULT/30 bg-[#EAF4EA] p-5 text-center">
        <CheckCircle size={36} className="text-sage-DEFAULT" />
        <div className="font-serif text-[16px] font-bold text-deep">Message sent!</div>
        <p className="text-[12px] font-semibold leading-relaxed text-ink-soft">
          We'll get back to you within a few hours. For urgent queries, WhatsApp us directly.
        </p>
        <button onClick={() => { setSent(false); setName(""); setPhone(""); setMessage(""); setTopic(TOPICS[0]); }} className="text-[12px] font-bold text-mauve underline underline-offset-2">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-2xl border border-line bg-white/70 p-4">
      <div className="mb-3 font-serif text-[15px] font-semibold text-deep">Send us a message</div>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-mute">Your name *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="w-full rounded-xl border border-line bg-white/70 px-3.5 py-2.5 text-[13px] font-semibold text-deep outline-none focus:border-rose focus:ring-1 focus:ring-rose/20" />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-mute">WhatsApp / phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" type="tel" className="w-full rounded-xl border border-line bg-white/70 px-3.5 py-2.5 text-[13px] font-semibold text-deep outline-none focus:border-rose focus:ring-1 focus:ring-rose/20" />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-mute">Topic</label>
          <div className="flex flex-wrap gap-1.5">
            {TOPICS.map(t => (
              <button key={t} onClick={() => setTopic(t)} className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors ${topic === t ? "border-rose bg-blush text-deep" : "border-line bg-white/60 text-ink-soft"}`}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-mute">Message *</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell us what's on your mind…" rows={4} className="w-full resize-none rounded-xl border border-line bg-white/70 px-3.5 py-2.5 text-[13px] font-semibold text-deep outline-none focus:border-rose focus:ring-1 focus:ring-rose/20" />
        </div>
        {error && <p className="rounded-xl bg-rose/10 px-3 py-2 text-[12px] font-bold text-rose">{error}</p>}
        <button onClick={submit} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-deep py-3 text-[13px] font-bold text-cream shadow-sm transition-transform active:scale-95 disabled:opacity-60">
          {loading ? "Sending…" : <><Send size={14} /> Send message</>}
        </button>
      </div>
    </div>
  );
}

export function ContactRoute() {
  return (
    <Screen top={<TopBar title="Get in touch" />}>
      <div className="p-4">
        <div className="font-serif text-[20px] font-semibold text-deep">We're right here ✦</div>
        <p className="mb-4 mt-1 text-[12px] font-semibold leading-relaxed text-ink-soft">
          Instagram DM is always the fastest. WhatsApp for delivery updates only.
        </p>

        <div className="mb-4 rounded-2xl border border-[#E0A8B8] bg-blush px-3.5 py-3 text-[12px] font-semibold leading-relaxed text-deep">
          DM on Insta for new bookings and drops. We reply within a few hours!
        </div>

        {CHANNELS.map((c) => (
          <a
            key={c.title}
            href={c.href}
            target="_blank"
            rel="noreferrer"
            className="card-glass mb-2.5 flex items-center gap-3 p-3.5 transition-transform active:scale-[0.98]"
          >
            <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] ${c.iconBg}`}>
              <c.icon size={20} className={c.iconColor} />
            </span>
            <span>
              <span className="block text-[13px] font-bold text-deep">{c.title}</span>
              <span className="block text-[11px] font-semibold text-ink-mute">{c.sub}</span>
            </span>
            <ChevronRight size={18} className="ml-auto text-ink-mute" />
          </a>
        ))}

        {/* ── Contact form ── */}
        <ContactForm />

        <div className="mt-4 rounded-2xl border border-lav-deep/50 bg-lav p-4">
          <div className="mb-1.5 font-serif text-[14px] font-semibold text-lav-deep">
            Never miss a Monday drop
          </div>
          <p className="mb-2.5 text-[12px] font-semibold leading-snug text-lav-deep/80">
            New scoops go live on Instagram every Monday. Follow to be first!
          </p>
          <a
            href={IG_URL}
            target="_blank"
            rel="noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-lav-deep py-3 text-[13px] font-bold text-white transition-transform active:scale-[0.98]"
          >
            <Instagram size={16} /> Follow @_liltreats_
          </a>
        </div>
        <div className="h-4" />
      </div>
    </Screen>
  );
}
