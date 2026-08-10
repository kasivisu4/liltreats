import { Schema, model, Document, Types } from "mongoose";

export interface IMappedItem {
  productId: Types.ObjectId;
  sku: string;
  name: string;
  quantity: number;
  costPrice: number; // snapshot
}

export interface IScoopBooking extends Document {
  bookingRef: string; // BKG-2026-00001
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  scoopId: Types.ObjectId;
  tier: "mini" | "magic" | "premium";
  scoopName: string;
  price: number;
  experience: "with_video" | "without_video";
  videoBookingId: Types.ObjectId | null;
  preferences: {
    vibe: string[];
    favouriteCategories: string[];
    avoidNote: string;
  };
  mappedItems: IMappedItem[]; // snapshot of scoop item mapping at order time
  itemCostTotal: number;
  status: "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const MappedItemSchema = new Schema<IMappedItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: String,
    name: String,
    quantity: { type: Number, min: 1, default: 1 },
    costPrice: { type: Number, min: 0, default: 0 },
  },
  { _id: false },
);

const ScoopBookingSchema = new Schema<IScoopBooking>(
  {
    bookingRef: { type: String, unique: true, sparse: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    scoopId: { type: Schema.Types.ObjectId, ref: "ScoopConfig", required: true },
    tier: { type: String, enum: ["mini", "magic", "premium"], required: true },
    scoopName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    experience: { type: String, enum: ["with_video", "without_video"], required: true },
    videoBookingId: { type: Schema.Types.ObjectId, ref: "VideoBooking", default: null },
    preferences: {
      vibe: [{ type: String }],
      favouriteCategories: [{ type: String }],
      avoidNote: { type: String, default: "" },
    },
    mappedItems: [MappedItemSchema],
    itemCostTotal: { type: Number, default: 0 },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
  },
  { timestamps: true },
);

export const ScoopBooking = model<IScoopBooking>("ScoopBooking", ScoopBookingSchema);
