import { Schema, model, Document, Types } from "mongoose";

export interface IInventory extends Document {
  productId: Types.ObjectId;
  sku: string;
  currentStock: number;
  minimumStock: number;
  costPrice: number;
  stockValue: number; // currentStock × costPrice — updated on each movement
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, unique: true },
    sku: { type: String, required: true, unique: true },
    currentStock: { type: Number, required: true, min: 0, default: 0 },
    minimumStock: { type: Number, required: true, min: 0, default: 5 },
    costPrice: { type: Number, required: true, min: 0, default: 0 },
    stockValue: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Inventory = model<IInventory>("Inventory", InventorySchema);
