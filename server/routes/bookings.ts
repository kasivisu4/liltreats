import { Router } from "express";
import { ScoopBooking } from "../models/ScoopBooking.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/bookings  — customer: their own scoop bookings
router.get("/", requireAuth, async (req, res) => {
  try {
    const bookings = await ScoopBooking.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch bookings." });
  }
});

// GET /api/bookings/admin/all  — admin
router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const { tier, experience, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (tier) filter.tier = tier;
    if (experience) filter.experience = experience;
    if (status) filter.status = status;
    const bookings = await ScoopBooking.find(filter)
      .populate("userId", "name phone email")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch bookings." });
  }
});

// GET /api/bookings/:id  — customer (own) or admin
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const booking = await ScoopBooking.findById(req.params.id).lean();
    if (!booking) { res.status(404).json({ error: "Booking not found." }); return; }
    if (req.user!.role !== "admin" && String(booking.userId) !== req.user!.userId) {
      res.status(403).json({ error: "Forbidden." }); return;
    }
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch booking." });
  }
});

export default router;
