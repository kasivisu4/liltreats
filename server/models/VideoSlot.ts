import { Schema, model, Document } from "mongoose";

export type VideoSlotStatus = "available" | "blocked" | "fully_booked";

export interface IVideoSlot extends Document {
  date: string; // YYYY-MM-DD
  startTime: string; // "10:00 AM"
  endTime: string; // "11:00 AM"
  maxCapacity: number;
  bookedCount: number;
  reservedCount: number; // slots temporarily reserved during checkout
  status: VideoSlotStatus;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSlotSchema = new Schema<IVideoSlot>(
  {
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, default: "" },
    maxCapacity: { type: Number, required: true, min: 1, default: 1 },
    bookedCount: { type: Number, default: 0, min: 0 },
    reservedCount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["available", "blocked", "fully_booked"],
      default: "available",
    },
  },
  { timestamps: true },
);

VideoSlotSchema.index({ date: 1, startTime: 1 }, { unique: true });

export const VideoSlot = model<IVideoSlot>("VideoSlot", VideoSlotSchema);
