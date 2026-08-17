import { Schema, model, Document, Types } from "mongoose";

export interface IAddress extends Document {
  userId: Types.ObjectId;
  name: string;
  phone: string;
  house: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  label: "Home" | "Work" | "Other";
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    house: { type: String, required: true, trim: true },
    street: { type: String, default: "", trim: true },
    area: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    label: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Address = model<IAddress>("Address", AddressSchema);
