import { Schema, model, Document, Types } from "mongoose";

export type NotificationType =
  | "payment_successful"
  | "order_confirmed"
  | "video_booking_confirmed"
  | "video_booking_reminder"
  | "order_packed"
  | "order_shipped"
  | "out_for_delivery"
  | "order_delivered"
  | "new_order" // admin
  | "new_payment" // admin
  | "new_video_booking" // admin
  | "low_stock" // admin
  | "out_of_stock" // admin
  | "failed_payment"; // admin

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  referenceType: "order" | "booking" | "product" | null;
  referenceId: string | null;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    referenceType: { type: String, enum: ["order", "booking", "product", null], default: null },
    referenceId: { type: String, default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Notification = model<INotification>("Notification", NotificationSchema);
