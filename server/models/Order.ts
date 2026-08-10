import { Schema, model, Document, Types } from "mongoose";

export type OrderStatus =
  | "confirmed"
  | "preparing"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "successful"
  | "failed"
  | "refunded"
  | "cancelled";

export interface IOrderItem {
  productId: Types.ObjectId | null;
  scoopConfigId: Types.ObjectId | null;
  sku: string;
  name: string;
  quantity: number;
  sellingPrice: number;
  costPrice: number; // snapshot at time of order
  subtotal: number;
}

export interface IShippingAddress {
  name: string;
  phone: string;
  email: string;
  house: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IOrder extends Document {
  orderNumber: string; // LT-2026-00001
  userId: Types.ObjectId;
  items: IOrderItem[];
  scoopBookings: Types.ObjectId[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  packagingCost: number;
  paymentGatewayFee: number;
  otherCost: number;
  totalAmount: number;
  itemCostTotal: number;
  netProfit: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: IShippingAddress;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerInstagram: string;
  courier: string;
  trackingNumber: string;
  trackingUrl: string;
  note: string;
  cancelReason: string;
  cancelledAt: Date | null;
  inventoryDeducted: boolean; // idempotency flag
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", default: null },
    scoopConfigId: { type: Schema.Types.ObjectId, ref: "ScoopConfig", default: null },
    sku: { type: String, default: "" },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    sellingPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    name: String,
    phone: String,
    email: String,
    house: String,
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [OrderItemSchema],
    scoopBookings: [{ type: Schema.Types.ObjectId, ref: "ScoopBooking" }],
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    packagingCost: { type: Number, default: 25 },
    paymentGatewayFee: { type: Number, default: 0 },
    otherCost: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    itemCostTotal: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "processing", "successful", "failed", "refunded", "cancelled"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["confirmed", "preparing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"],
      default: "confirmed",
    },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    customerInstagram: { type: String, default: "" },
    courier: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },
    note: { type: String, default: "" },
    cancelReason: { type: String, default: "" },
    cancelledAt: { type: Date, default: null },
    inventoryDeducted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Auto-increment order number handled in route/service layer using a counter.
export const Order = model<IOrder>("Order", OrderSchema);
