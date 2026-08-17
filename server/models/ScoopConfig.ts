import { Schema, model, Document } from "mongoose";

export type ScoopTier = "mini" | "magic" | "premium";

export interface IScoopConfig extends Document {
  tier: ScoopTier;
  name: string;
  slug: string;
  price: number;
  itemRangeMin: number;
  itemRangeMax: number;
  description: string;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScoopConfigSchema = new Schema<IScoopConfig>(
  {
    tier: { type: String, enum: ["mini", "magic", "premium"], required: true, unique: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    price: { type: Number, required: true, min: 0 },
    itemRangeMin: { type: Number, required: true, min: 1 },
    itemRangeMax: { type: Number, required: true, min: 1 },
    description: { type: String, default: "" },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const ScoopConfig = model<IScoopConfig>("ScoopConfig", ScoopConfigSchema);
