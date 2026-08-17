import { Schema, model, Document, Types } from "mongoose";

export type VideoBookingStatus = "reserved" | "confirmed" | "completed" | "cancelled" | "expired";

export interface IVideoBooking extends Document {
  bookingRef: string; // human-readable e.g. VB-2026-00001
  orderId: Types.ObjectId | null;
  userId: Types.ObjectId;
  scoopBookingId: Types.ObjectId | null;
  scoopTier: "mini" | "magic" | "premium";
  videoDate: string; // YYYY-MM-DD
  videoSlotId: Types.ObjectId;
  startTime: string;
  endTime: string;
  status: VideoBookingStatus;
  reservedAt: Date;
  expiresAt: Date | null; // null once confirmed
  confirmedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const VideoBookingSchema = new Schema<IVideoBooking>(
  {
    bookingRef: { type: String, unique: true, sparse: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    scoopBookingId: { type: Schema.Types.ObjectId, ref: "ScoopBooking", default: null },
    scoopTier: { type: String, enum: ["mini", "magic", "premium"], required: true },
    videoDate: { type: String, required: true },
    videoSlotId: { type: Schema.Types.ObjectId, ref: "VideoSlot", required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, default: "" },
    status: {
      type: String,
      enum: ["reserved", "confirmed", "completed", "cancelled", "expired"],
      default: "reserved",
    },
    reservedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    confirmedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const VideoBooking = model<IVideoBooking>("VideoBooking", VideoBookingSchema);
