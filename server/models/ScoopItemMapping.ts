import { Schema, model, Document, Types } from "mongoose";

export interface IScoopItemMapping extends Document {
  scoopId: Types.ObjectId;
  productId: Types.ObjectId;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const ScoopItemMappingSchema = new Schema<IScoopItemMapping>(
  {
    scoopId: { type: Schema.Types.ObjectId, ref: "ScoopConfig", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { timestamps: true },
);

// Prevent duplicate product entries per scoop
ScoopItemMappingSchema.index({ scoopId: 1, productId: 1 }, { unique: true });

export const ScoopItemMapping = model<IScoopItemMapping>("ScoopItemMapping", ScoopItemMappingSchema);
