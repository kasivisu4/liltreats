export type TierId = "mini" | "magic" | "premium";
export type Accent = "sage" | "rose" | "lav";

export interface Tier {
  id: TierId;
  name: string;
  tagline: string;
  price: number;
  itemsLabel: string;
  slots: number;
  icon: string;
  accent: Accent;
  perks: string[];
}

export const VIDEO_ADDON_PRICE = 99;

export const TIERS: Tier[] = [
  {
    id: "mini",
    name: "Mini Scoop",
    tagline: "Sweet surprise starter",
    price: 499,
    itemsLabel: "5–6 items",
    slots: 8,
    icon: "🌿",
    accent: "sage",
    perks: ["5–6 items", "Freebies incl.", "Cute packaging", "Surprise curation"],
  },
  {
    id: "magic",
    name: "Magic Scoop",
    tagline: "Everyone's favourite",
    price: 899,
    itemsLabel: "8–10 items",
    slots: 5,
    icon: "✨",
    accent: "rose",
    perks: ["8–10 items", "Freebies incl.", "Premium wrap", "Insta reveal tag"],
  },
  {
    id: "premium",
    name: "Premium Scoop",
    tagline: "The full luxury experience",
    price: 1099,
    itemsLabel: "10–12 items",
    slots: 3,
    icon: "👑",
    accent: "lav",
    perks: [
      "10–12 items",
      "Freebies incl.",
      "Gift box",
      "Express delivery",
      "Insta reveal tag",
      "Personal note",
    ],
  },
];

export const TIER_BY_ID = (id: TierId): Tier =>
  TIERS.find((t) => t.id === id) ?? TIERS[0];

// Accent → tailwind class fragments, so components stay declarative.
export const ACCENT_STYLES: Record<
  Accent,
  {
    cardBg: string;
    border: string;
    selBorder: string;
    text: string;
    tagText: string;
    perkBg: string;
    perkText: string;
    perkBorder: string;
    barFrom: string;
    barTo: string;
    pillBg: string;
    pillText: string;
  }
> = {
  sage: {
    cardBg: "from-[#EDF5E8] to-[#E0EED8]",
    border: "border-[#B8D0A8]",
    selBorder: "border-sage-deep",
    text: "text-deep",
    tagText: "text-sage-deep",
    perkBg: "bg-white/60",
    perkText: "text-[#3A5828]",
    perkBorder: "border-[#B8D0A8]/50",
    barFrom: "from-[#7AAA60]",
    barTo: "to-[#A0CC80]",
    pillBg: "bg-[#B8D0A8]/50",
    pillText: "text-[#2A4820]",
  },
  rose: {
    cardBg: "from-[#F9EDEE] to-[#F0DFE8]",
    border: "border-[#E0A8B8]",
    selBorder: "border-rose",
    text: "text-deep",
    tagText: "text-mauve",
    perkBg: "bg-white/60",
    perkText: "text-[#6A2840]",
    perkBorder: "border-[#E0A8B8]/50",
    barFrom: "from-[#C87890]",
    barTo: "to-[#E0A0B8]",
    pillBg: "bg-[#E0A8B8]/50",
    pillText: "text-[#6A2040]",
  },
  lav: {
    cardBg: "from-[#F5EDF9] to-[#EDE0F4]",
    border: "border-[#C8B0E4]",
    selBorder: "border-lav-deep",
    text: "text-deep",
    tagText: "text-lav-deep",
    perkBg: "bg-white/60",
    perkText: "text-[#4030A0]",
    perkBorder: "border-[#C8B0E4]/50",
    barFrom: "from-[#9880C0]",
    barTo: "to-[#C0A8E0]",
    pillBg: "bg-[#C8B0E4]/50",
    pillText: "text-[#3C2070]",
  },
};
