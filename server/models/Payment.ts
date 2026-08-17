import { Schema, model, Document, Types } from "mongoose";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "successful"
  | "failed"
  | "refunded"
  | "cancelled";

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  orderNumber: string;
  amount: number;
  currency: string;
  gateway: string; // "razorpay" | "stripe" | "manual"
  transactionId: string;
  paymentMethod: string; // "upi" | "card" | "wallet"
  status: PaymentStatus;
  gatewayResponse: Record<string, unknown>; // raw webhook payload (never exposed to frontend)
  paidAt: Date | null;
  refundedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderNumber: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    gateway: { type: String, default: "razorpay" },
    transactionId: { type: String, default: "" },
    paymentMethod: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "processing", "successful", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    gatewayResponse: { type: Schema.Types.Mixed, default: {} },
    paidAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Payment = model<IPayment>("Payment", PaymentSchema);
