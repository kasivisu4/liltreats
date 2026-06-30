export type BannerId = "drop" | "diwali" | "sale" | "gift" | "none";

export interface Banner {
  id: BannerId;
  label: string;
  emoji: string;
  title: string;
  subtitle: string;
  bg: string;
  border: string;
  titleColor: string;
  subColor: string;
}

export const BANNERS: Record<Exclude<BannerId, "none">, Banner> = {
  drop: {
    id: "drop",
    label: "New drop ✦",
    emoji: "✦",
    title: "New drop is live!",
    subtitle: "Fresh scoops just unlocked — grab yours before they're gone.",
    bg: "#EEF5EA",
    border: "#B8D0A8",
    titleColor: "#2A4820",
    subColor: "#4A7838",
  },
  diwali: {
    id: "diwali",
    label: "Diwali",
    emoji: "🪔",
    title: "Diwali special scoops!",
    subtitle: "Festive edition mystery boxes — limited this week only.",
    bg: "#FBF5E0",
    border: "#E0C860",
    titleColor: "#4A2E00",
    subColor: "#8A5800",
  },
  sale: {
    id: "sale",
    label: "Flash sale",
    emoji: "⚡",
    title: "Flash sale — today only!",
    subtitle: "Free shipping on Magic & Premium scoops. Order now!",
    bg: "#F9EDEE",
    border: "#E0A8B8",
    titleColor: "#5A0830",
    subColor: "#9B3050",
  },
  gift: {
    id: "gift",
    label: "Gift mode",
    emoji: "🎁",
    title: "Gift mode is on!",
    subtitle: "Premium gift boxes with handwritten notes — perfect for gifting.",
    bg: "#F5EDF9",
    border: "#C8B0E4",
    titleColor: "#300870",
    subColor: "#6840A0",
  },
};

export const BANNER_ORDER: BannerId[] = ["drop", "diwali", "sale", "gift", "none"];
