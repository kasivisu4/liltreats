import { Schema, model, Document, Types } from "mongoose";

export type MovementType =
  | "stock_entry"
  | "automatic_debit"
  | "manual_debit"
  | "adjustment"
  | "order_reversal";

export interface IInventoryMovement extends Document {
  productId: Types.ObjectId;
  sku: string;
  type: MovementType;
  quantity: number; // positive = add, negative = deduct
  previousStock: number;
  newStock: number;
  reason: string;
  referenceType: "order" | "manual" | "adjustment" | null;
  referenceId: string | null; // orderId or null
  createdBy: Types.ObjectId | null; // admin userId for manual ops
  createdAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    sku: { type: String, required: true },
    type: {
      type: String,
      enum: ["stock_entry", "automatic_debit", "manual_debit", "adjustment", "order_reversal"],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: { type: String, default: "" },
    referenceType: { type: String, enum: ["order", "manual", "adjustment", null], default: null },
    referenceId: { type: String, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export const InventoryMovement = model<IInventoryMovement>(
  "InventoryMovement",
  InventoryMovementSchema,
);
