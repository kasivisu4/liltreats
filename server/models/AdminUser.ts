import { Schema, model, Document, Types } from "mongoose";

export interface IAdminUser extends Document {
  userId: Types.ObjectId;
  name: string;
  email: string;
  role: "super_admin" | "order_manager" | "inventory_manager" | "finance_manager";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    role: {
      type: String,
      enum: ["super_admin", "order_manager", "inventory_manager", "finance_manager"],
      default: "super_admin",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const AdminUser = model<IAdminUser>("AdminUser", AdminUserSchema);
