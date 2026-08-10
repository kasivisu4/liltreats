import { Router } from "express";
import { Payment } from "../models/Payment.js";
import { Order } from "../models/Order.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/payments/admin/all  — admin
router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const filter: Record<string, unknown> = {};
    if (status && status !== "all") filter.status = status;
    if (from && to) filter.createdAt = { $gte: new Date(String(from)), $lte: new Date(String(to)) };

    const payments = await Payment.find(filter)
      .populate("userId", "name phone email")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch payments." });
  }
});

// PATCH /api/payments/:id/refund  — admin: mark as refunded
router.patch("/:id/refund", requireAdmin, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "refunded" } },
      { new: true },
    );
    if (!payment) { res.status(404).json({ error: "Payment not found." }); return; }
    // Also update the order's payment status
    await Order.findByIdAndUpdate(payment.orderId, { $set: { paymentStatus: "refunded" } });
    res.json({ payment });
  } catch (err) {
    res.status(500).json({ error: "Could not process refund." });
  }
});

export default router;
