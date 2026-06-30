import { ChevronRight, Instagram, MessageCircle, Phone } from "lucide-react";
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
