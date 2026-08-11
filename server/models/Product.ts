import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  sku: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  categoryId: Types.ObjectId;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStock: number;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isLimited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    images: [{ type: String }],
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    currentStock: { type: Number, required: true, min: 0, default: 0 },
    minimumStock: { type: Number, required: true, min: 0, default: 5 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isLimited: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Product = model<IProduct>("Product", ProductSchema);
