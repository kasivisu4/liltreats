import { Router } from "express";
import { Order } from "../models/Order.js";
import { ScoopBooking } from "../models/ScoopBooking.js";
import { VideoBooking } from "../models/VideoBooking.js";
import { VideoSlot } from "../models/VideoSlot.js";
import { ScoopItemMapping } from "../models/ScoopItemMapping.js";
import { Inventory } from "../models/Inventory.js";
import { InventoryMovement } from "../models/InventoryMovement.js";
import { Payment } from "../models/Payment.js";
import { Notification } from "../models/Notification.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── Order number generator ────────────────────────────────────────────────────
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const last = await Order.findOne({ orderNumber: new RegExp(`^LT-${year}-`) })
    .sort({ orderNumber: -1 })
    .select("orderNumber")
    .lean();
  const lastNum = last ? parseInt(last.orderNumber.split("-")[2] ?? "0", 10) : 0;
  return `LT-${year}-${String(lastNum + 1).padStart(5, "0")}`;
}

// ── Inventory auto-deduction (idempotent) ─────────────────────────────────────
async function deductInventory(order: InstanceType<typeof Order>): Promise<void> {
  if (order.inventoryDeducted) return; // idempotency guard

  const movements: Array<{
    productId: unknown; sku: string; type: string; quantity: number;
    previousStock: number; newStock: number; reason: string;
    referenceType: string; referenceId: unknown;
  }> = [];

  for (const item of order.items) {
    if (item.productId) {
      // Individual item
      const inv = await Inventory.findOne({ productId: item.productId });
      if (inv) {
        const prev = inv.currentStock;
        const next = Math.max(0, prev - item.quantity);
        inv.currentStock = next;
        inv.stockValue = next * inv.costPrice;
        await inv.save();
        movements.push({
          productId: item.productId,
          sku: item.sku,
          type: "automatic_debit",
          quantity: -item.quantity,
          previousStock: prev,
          newStock: next,
          reason: `Order ${order.orderNumber}`,
          referenceType: "order",
          referenceId: order._id,
        });
      }
    } else if (item.scoopConfigId) {
      // Scoop — deduct mapped items
      const mappings = await ScoopItemMapping.find({ scoopId: item.scoopConfigId });
      for (const mapping of mappings) {
        const inv = await Inventory.findOne({ productId: mapping.productId });
        if (inv) {
          const prev = inv.currentStock;
          const deduct = mapping.quantity * item.quantity;
          const next = Math.max(0, prev - deduct);
          inv.currentStock = next;
          inv.stockValue = next * inv.costPrice;
          await inv.save();
          movements.push({
            productId: mapping.productId,
            sku: inv.sku,
            type: "automatic_debit",
            quantity: -deduct,
            previousStock: prev,
            newStock: next,
            reason: `Scoop order ${order.orderNumber}`,
            referenceType: "order",
            referenceId: order._id,
          });
        }
      }
    }
  }

  if (movements.length > 0) {
    await InventoryMovement.insertMany(movements);
  }

  order.inventoryDeducted = true;
  await order.save();
}

// ── Notifications helper ──────────────────────────────────────────────────────
async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  refType: string,
  refId: unknown,
) {
  try {
    await Notification.create({ userId, type, title, message, referenceType: refType, referenceId: refId });
  } catch {
    // Non-critical
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/orders  — authenticated: create order
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      items, scoopBookingData, reservationId,
      subtotal, shippingCost, discount, packagingCost, paymentGatewayFee,
      totalAmount, itemCostTotal, netProfit,
      shippingAddress, customerName, customerPhone, customerEmail,
      customerInstagram, note, paymentMethod,
    } = req.body;

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      userId: req.user!.userId,
      items: items ?? [],
      subtotal: subtotal ?? 0,
      shippingCost: shippingCost ?? 0,
      discount: discount ?? 0,
      packagingCost: packagingCost ?? 25,
      paymentGatewayFee: paymentGatewayFee ?? 0,
      totalAmount: totalAmount ?? 0,
      itemCostTotal: itemCostTotal ?? 0,
      netProfit: netProfit ?? 0,
      paymentStatus: "successful", // V1: simulate successful payment
      orderStatus: "confirmed",
      shippingAddress,
      customerName, customerPhone, customerEmail,
      customerInstagram: customerInstagram ?? "",
      note: note ?? "",
    });

    // Confirm video reservation if present
    if (reservationId) {
      const reservation = await VideoBooking.findById(reservationId);
      if (reservation && reservation.status === "reserved") {
        reservation.status = "confirmed";
        reservation.orderId = order._id;
        await reservation.save();
        // Move reserved → booked on the slot
        await VideoSlot.findByIdAndUpdate(reservation.videoSlotId, {
          $inc: { bookedCount: 1, reservedCount: -1 },
        });
      }
    }

    // Create scoop booking record if applicable
    if (scoopBookingData) {
      await ScoopBooking.create({
        ...scoopBookingData,
        orderId: order._id,
        userId: req.user!.userId,
        status: "confirmed",
      });
    }

    // Create payment record
    await Payment.create({
      orderId: order._id,
      userId: req.user!.userId,
      orderNumber,
      amount: totalAmount,
      currency: "INR",
      gateway: paymentMethod ?? "upi",
      status: "successful",
      paidAt: new Date(),
    });

    // Deduct inventory
    await deductInventory(order as InstanceType<typeof Order>);

    // Notifications
    await createNotification(
      req.user!.userId, "order_confirmed",
      "Order Confirmed!", `Your order ${orderNumber} has been confirmed.`,
      "order", order._id,
    );

    res.status(201).json({ order: { ...order.toObject() } });
  } catch (err) {
    console.error("[orders/POST]", err);
    res.status(500).json({ error: "Could not create order." });
  }
});

// GET /api/orders  — customer: their own orders
router.get("/", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch orders." });
  }
});

// GET /api/orders/admin/all  — admin: all orders
router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.orderStatus = status;
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean();
    const total = await Order.countDocuments(filter);
    res.json({ orders, total });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch orders." });
  }
});

// GET /api/orders/:id  — customer (own) or admin
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) { res.status(404).json({ error: "Order not found." }); return; }
    // Customers can only view their own orders
    if (req.user!.role !== "admin" && String(order.userId) !== req.user!.userId) {
      res.status(403).json({ error: "Forbidden." }); return;
    }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch order." });
  }
});

// PATCH /api/orders/:id/status  — admin
router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { orderStatus: status } },
      { new: true },
    );
    if (!order) { res.status(404).json({ error: "Order not found." }); return; }
    // Notify customer
    await createNotification(
      String(order.userId), `order_${status}`,
      `Order ${status.replace(/_/g, " ")}`,
      `Your order ${order.orderNumber} is now: ${status.replace(/_/g, " ")}.`,
      "order", order._id,
    );
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: "Could not update status." });
  }
});

// PATCH /api/orders/:id/delivery  — admin: add tracking
router.patch("/:id/delivery", requireAdmin, async (req, res) => {
  try {
    const { courier, trackingNumber, trackingUrl } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { courier, trackingNumber, trackingUrl, orderStatus: "shipped" } },
      { new: true },
    );
    if (!order) { res.status(404).json({ error: "Order not found." }); return; }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: "Could not update delivery." });
  }
});

// POST /api/orders/:id/cancel  — admin
router.post("/:id/cancel", requireAdmin, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) { res.status(404).json({ error: "Order not found." }); return; }

    order.orderStatus = "cancelled";
    order.cancelReason = reason ?? "";
    order.cancelledAt = new Date();
    await order.save();

    // Release video booking
    const vb = await VideoBooking.findOne({ orderId: order._id, status: "confirmed" });
    if (vb) {
      vb.status = "cancelled";
      await vb.save();
      await VideoSlot.findByIdAndUpdate(vb.videoSlotId, { $inc: { bookedCount: -1 } });
    }

    // Reverse inventory if already deducted
    if (order.inventoryDeducted) {
      const movements = await InventoryMovement.find({
        referenceId: order._id,
        type: "automatic_debit",
      });
      for (const mv of movements) {
        const inv = await Inventory.findOne({ productId: mv.productId });
        if (inv) {
          const prev = inv.currentStock;
          const next = prev + Math.abs(mv.quantity);
          inv.currentStock = next;
          inv.stockValue = next * inv.costPrice;
          await inv.save();
          await InventoryMovement.create({
            productId: mv.productId,
            sku: mv.sku,
            type: "order_reversal",
            quantity: Math.abs(mv.quantity),
            previousStock: prev,
            newStock: next,
            reason: `Order cancelled: ${order.orderNumber}`,
            referenceType: "order",
            referenceId: order._id,
          });
        }
      }
      order.inventoryDeducted = false;
      await order.save();
    }

    res.json({ order });
  } catch (err) {
    console.error("[orders/cancel]", err);
    res.status(500).json({ error: "Could not cancel order." });
  }
});

export default router;
