import { Schema, model, Document } from "mongoose";

export interface IVideoConfig extends Document {
  minimumLeadDays: number;
  bookingWindowDays: number;
  maxBookingsPerDay: number;
  reservationTimeoutMinutes: number;
  updatedAt: Date;
}

const VideoConfigSchema = new Schema<IVideoConfig>(
  {
    minimumLeadDays: { type: Number, default: 5, min: 1 },
    bookingWindowDays: { type: Number, default: 30, min: 1 },
    maxBookingsPerDay: { type: Number, default: 2, min: 1 },
    reservationTimeoutMinutes: { type: Number, default: 15, min: 5 },
  },
  { timestamps: true },
);

export const VideoConfig = model<IVideoConfig>("VideoConfig", VideoConfigSchema);
