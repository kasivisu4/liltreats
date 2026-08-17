import { Schema, model, Document, Types } from "mongoose";

export type DeliveryStatus =
  | "preparing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface IDelivery extends Document {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  courierName: string;
  trackingNumber: string;
  trackingUrl: string;
  status: DeliveryStatus;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courierName: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["preparing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"],
      default: "preparing",
    },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Delivery = model<IDelivery>("Delivery", DeliverySchema);
