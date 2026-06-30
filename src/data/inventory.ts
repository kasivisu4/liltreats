import type { TierId } from "./tiers";

export type Category =
  | "Jewellery"
  | "Hair"
  | "Accessories"
  | "Lifestyle"
  | "Beauty"
  | "Trinkets"
  | "Stationery";

export interface ScoopItem {
  id: string;
  name: string;
  category: Category;
  emoji: string;
  tiers: TierId[];
  stock: number; // 0 = sold out
  isNew: boolean;
  isLimited: boolean;
}

// The pool of goodies that may appear in a curated box this week.
// Contents are a surprise — this is a teaser, not a pick-list.
export const INVENTORY: ScoopItem[] = [
  { id: "i01", name: "Pearl drop earrings", category: "Jewellery", emoji: "💎", tiers: ["magic", "premium"], stock: 14, isNew: true, isLimited: false },
  { id: "i02", name: "Layered chain necklace", category: "Jewellery", emoji: "📿", tiers: ["magic", "premium"], stock: 8, isNew: false, isLimited: false },
  { id: "i03", name: "Dainty ring set", category: "Jewellery", emoji: "💍", tiers: ["mini", "magic", "premium"], stock: 16, isNew: true, isLimited: false },
  { id: "i04", name: "Charm bracelet", category: "Jewellery", emoji: "🌟", tiers: ["premium"], stock: 4, isNew: false, isLimited: true },
  { id: "i05", name: "Anklet duo", category: "Jewellery", emoji: "⚡", tiers: ["magic", "premium"], stock: 0, isNew: false, isLimited: false },
  { id: "i06", name: "Stud earring trio", category: "Jewellery", emoji: "✦", tiers: ["mini", "magic"], stock: 19, isNew: false, isLimited: false },
  { id: "i07", name: "Hair bow clips (set of 4)", category: "Hair", emoji: "🎀", tiers: ["mini", "magic", "premium"], stock: 20, isNew: false, isLimited: false },
  { id: "i08", name: "Satin scrunchie duo", category: "Hair", emoji: "🌸", tiers: ["mini", "magic"], stock: 18, isNew: false, isLimited: false },
  { id: "i09", name: "Butterfly bobby pins", category: "Hair", emoji: "🦋", tiers: ["mini", "magic"], stock: 5, isNew: false, isLimited: true },
  { id: "i10", name: "Pearl hair pins (x6)", category: "Hair", emoji: "🤍", tiers: ["premium"], stock: 8, isNew: false, isLimited: false },
  { id: "i11", name: "Velvet headband", category: "Hair", emoji: "🎗️", tiers: ["magic", "premium"], stock: 11, isNew: true, isLimited: false },
  { id: "i12", name: "Claw clip (marble)", category: "Hair", emoji: "🐚", tiers: ["mini", "magic", "premium"], stock: 13, isNew: false, isLimited: false },
  { id: "i13", name: "Celestial phone charm", category: "Accessories", emoji: "🌙", tiers: ["magic", "premium"], stock: 6, isNew: true, isLimited: true },
  { id: "i14", name: "Mini tote bag", category: "Accessories", emoji: "👛", tiers: ["premium"], stock: 7, isNew: false, isLimited: false },
  { id: "i15", name: "Beaded keychain", category: "Accessories", emoji: "🔑", tiers: ["mini", "magic"], stock: 15, isNew: false, isLimited: false },
  { id: "i16", name: "Foldable hand fan", category: "Accessories", emoji: "🪭", tiers: ["magic", "premium"], stock: 9, isNew: true, isLimited: false },
  { id: "i17", name: "Sunglasses (retro)", category: "Accessories", emoji: "🕶️", tiers: ["premium"], stock: 3, isNew: false, isLimited: true },
  { id: "i18", name: "Mini perfume vial", category: "Beauty", emoji: "🌺", tiers: ["magic", "premium"], stock: 10, isNew: true, isLimited: false },
  { id: "i19", name: "Crystal nail charms", category: "Beauty", emoji: "✨", tiers: ["mini", "magic"], stock: 12, isNew: false, isLimited: false },
  { id: "i20", name: "Tinted lip balm", category: "Beauty", emoji: "💄", tiers: ["mini", "magic", "premium"], stock: 17, isNew: false, isLimited: false },
  { id: "i21", name: "Glitter roll-on", category: "Beauty", emoji: "🪩", tiers: ["magic", "premium"], stock: 6, isNew: false, isLimited: false },
  { id: "i22", name: "Mini blush compact", category: "Beauty", emoji: "🌷", tiers: ["premium"], stock: 5, isNew: true, isLimited: false },
  { id: "i23", name: "Kawaii keychain plush", category: "Trinkets", emoji: "🧸", tiers: ["mini", "magic", "premium"], stock: 3, isNew: false, isLimited: true },
  { id: "i24", name: "Mini tarot card set", category: "Trinkets", emoji: "🃏", tiers: ["premium"], stock: 4, isNew: true, isLimited: true },
  { id: "i25", name: "Crystal pocket stone", category: "Trinkets", emoji: "🔮", tiers: ["magic", "premium"], stock: 8, isNew: false, isLimited: false },
  { id: "i26", name: "Sticker sheet (holographic)", category: "Trinkets", emoji: "🌈", tiers: ["mini", "magic"], stock: 22, isNew: false, isLimited: false },
  { id: "i27", name: "Enamel pin", category: "Trinkets", emoji: "📌", tiers: ["mini", "magic", "premium"], stock: 14, isNew: false, isLimited: false },
  { id: "i28", name: "Pressed flower bookmark", category: "Stationery", emoji: "🌷", tiers: ["mini", "magic"], stock: 9, isNew: false, isLimited: false },
  { id: "i29", name: "Mini notebook", category: "Stationery", emoji: "📓", tiers: ["magic", "premium"], stock: 12, isNew: false, isLimited: false },
  { id: "i30", name: "Washi tape roll", category: "Stationery", emoji: "🎐", tiers: ["mini", "magic"], stock: 16, isNew: false, isLimited: false },
  { id: "i31", name: "Gel pen set", category: "Stationery", emoji: "🖊️", tiers: ["premium"], stock: 10, isNew: false, isLimited: false },
  { id: "i32", name: "Scented candle (tin)", category: "Lifestyle", emoji: "🕯️", tiers: ["premium"], stock: 6, isNew: true, isLimited: false },
  { id: "i33", name: "Mini diffuser sachet", category: "Lifestyle", emoji: "🌼", tiers: ["magic", "premium"], stock: 11, isNew: false, isLimited: false },
  { id: "i34", name: "Trinket dish", category: "Lifestyle", emoji: "🍃", tiers: ["premium"], stock: 5, isNew: false, isLimited: false },
  { id: "i35", name: "Herbal tea sampler", category: "Lifestyle", emoji: "🍵", tiers: ["mini", "magic", "premium"], stock: 15, isNew: false, isLimited: false },
  { id: "i36", name: "Mini succulent (faux)", category: "Lifestyle", emoji: "🪴", tiers: ["magic", "premium"], stock: 0, isNew: false, isLimited: false },
];
