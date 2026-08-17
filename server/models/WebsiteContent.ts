import { Schema, model, Document, Types } from "mongoose";

export type ContentSection = "home" | "about" | "contact" | "announcement";

export interface IWebsiteContent extends Document {
  section: ContentSection;
  content: Record<string, unknown>; // flexible JSON per section
  images: string[];
  isActive: boolean;
  updatedAt: Date;
  updatedBy: Types.ObjectId | null;
}

const WebsiteContentSchema = new Schema<IWebsiteContent>(
  {
    section: {
      type: String,
      enum: ["home", "about", "contact", "announcement"],
      required: true,
      unique: true,
    },
    content: { type: Schema.Types.Mixed, default: {} },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export const WebsiteContent = model<IWebsiteContent>("WebsiteContent", WebsiteContentSchema);
