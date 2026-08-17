import { Router } from "express";
import { Order } from "../models/Order.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/delivery/admin/all  — admin
router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.orderStatus = status;

    const orders = await Order.find(filter)
      .select("orderNumber customerName customerPhone shippingAddress orderStatus courier trackingNumber trackingUrl createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ deliveries: orders });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch deliveries." });
  }
});

// PATCH /api/delivery/:orderId  — admin: update courier + status
router.patch("/:orderId", requireAdmin, async (req, res) => {
  try {
    const { courier, trackingNumber, trackingUrl, status } = req.body;
    const update: Record<string, unknown> = {};
    if (courier !== undefined) update.courier = courier;
    if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) update.trackingUrl = trackingUrl;
    if (status) update.orderStatus = status;

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { $set: update },
      { new: true },
    );
    if (!order) { res.status(404).json({ error: "Order not found." }); return; }
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: "Could not update delivery." });
  }
});

export default router;
