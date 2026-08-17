import { Router } from "express";
import { VideoConfig } from "../models/VideoConfig.js";
import { VideoSlot } from "../models/VideoSlot.js";
import { VideoBooking } from "../models/VideoBooking.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

// ── Config ────────────────────────────────────────────────────────────────────

// GET /api/video/config  — public: customers need this to build the date picker
router.get("/config", async (_req, res) => {
  try {
    let config = await VideoConfig.findOne().lean();
    if (!config) {
      // Seed default if not exists
      const created = await VideoConfig.create({});
      config = created.toObject();
    }
    res.json({ config });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch video config." });
  }
});

// PATCH /api/video/config  — admin
router.patch("/config", requireAdmin, async (req, res) => {
  try {
    const config = await VideoConfig.findOneAndUpdate(
      {},
      { $set: req.body },
      { upsert: true, new: true },
    );
    res.json({ config });
  } catch (err) {
    res.status(500).json({ error: "Could not update video config." });
  }
});

// ── Slots ─────────────────────────────────────────────────────────────────────

// GET /api/video/slots?from=YYYY-MM-DD&to=YYYY-MM-DD  — public
router.get("/slots", async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) { res.status(400).json({ error: "from and to dates are required." }); return; }
    const slots = await VideoSlot.find({
      date: { $gte: String(from), $lte: String(to) },
    }).sort({ date: 1, startTime: 1 }).lean();
    res.json({ slots });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch slots." });
  }
});

// POST /api/video/slots  — admin: create a new slot for a date
router.post("/slots", requireAdmin, async (req, res) => {
  try {
    const { date, startTime, endTime, maxCapacity } = req.body;
    if (!date || !startTime) {
      res.status(400).json({ error: "date and startTime are required." });
      return;
    }
    const slot = await VideoSlot.create({ date, startTime, endTime, maxCapacity: maxCapacity ?? 1 });
    res.status(201).json({ slot });
  } catch (err: unknown) {
    const msg = err instanceof Error && err.message.includes("duplicate")
      ? "A slot at that time already exists for this date."
      : "Could not create slot.";
    res.status(400).json({ error: msg });
  }
});

// PATCH /api/video/slots/:id  — admin: edit or block/unblock slot
router.patch("/slots/:id", requireAdmin, async (req, res) => {
  try {
    const slot = await VideoSlot.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!slot) { res.status(404).json({ error: "Slot not found." }); return; }
    res.json({ slot });
  } catch (err) {
    res.status(500).json({ error: "Could not update slot." });
  }
});

// DELETE /api/video/slots/:id  — admin
router.delete("/slots/:id", requireAdmin, async (req, res) => {
  try {
    const slot = await VideoSlot.findById(req.params.id);
    if (!slot) { res.status(404).json({ error: "Slot not found." }); return; }
    if (slot.bookedCount > 0) {
      res.status(409).json({ error: "Cannot delete a slot that has active bookings." });
      return;
    }
    await slot.deleteOne();
    res.json({ message: "Slot deleted." });
  } catch (err) {
    res.status(500).json({ error: "Could not delete slot." });
  }
});

// ── Availability summary ──────────────────────────────────────────────────────

// GET /api/video/availability?from=YYYY-MM-DD&to=YYYY-MM-DD  — public: per-date totals
router.get("/availability", async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) { res.status(400).json({ error: "from and to are required." }); return; }
    const config = await VideoConfig.findOne().lean();
    const maxPerDay = config?.maxBookingsPerDay ?? 2;

    const slots = await VideoSlot.find({
      date: { $gte: String(from), $lte: String(to) },
      status: { $ne: "blocked" },
    }).lean();

    // Group by date
    const byDate = new Map<string, { booked: number; capacity: number }>();
    for (const slot of slots) {
      const existing = byDate.get(slot.date) ?? { booked: 0, capacity: 0 };
      existing.booked += slot.bookedCount;
      existing.capacity += slot.maxCapacity;
      byDate.set(slot.date, existing);
    }

    const availability = Array.from(byDate.entries()).map(([date, data]) => ({
      date,
      booked: data.booked,
      capacity: Math.min(data.capacity, maxPerDay),
      available: Math.max(0, Math.min(data.capacity, maxPerDay) - data.booked),
      fullyBooked: data.booked >= Math.min(data.capacity, maxPerDay),
    }));

    res.json({ availability, maxBookingsPerDay: maxPerDay });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch availability." });
  }
});

// ── Reserve (temp hold during checkout) ──────────────────────────────────────

// POST /api/video/reserve  — authenticated: reserve a slot for 15 min
router.post("/reserve", requireAuth, async (req, res) => {
  try {
    const { slotId } = req.body;
    if (!slotId) { res.status(400).json({ error: "slotId is required." }); return; }

    const config = await VideoConfig.findOne().lean();
    const timeoutMins = config?.reservationTimeoutMinutes ?? 15;

    const slot = await VideoSlot.findById(slotId);
    if (!slot) { res.status(404).json({ error: "Slot not found." }); return; }
    if (slot.status === "blocked") { res.status(409).json({ error: "This slot is blocked." }); return; }

    const totalBooked = slot.bookedCount + slot.reservedCount;
    if (totalBooked >= slot.maxCapacity) {
      res.status(409).json({ error: "This slot is no longer available. Please select another." });
      return;
    }

    // Increment reserved count
    slot.reservedCount += 1;
    await slot.save();

    // Create a reserved video booking (expires after timeout)
    const expiresAt = new Date(Date.now() + timeoutMins * 60 * 1000);
    const booking = await VideoBooking.create({
      userId: req.user!.userId,
      videoSlotId: slotId,
      videoDate: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: "reserved",
      expiresAt,
    });

    res.status(201).json({ reservationId: booking._id, expiresAt, slotId });
  } catch (err) {
    console.error("[video/reserve]", err);
    res.status(500).json({ error: "Could not reserve slot." });
  }
});

// POST /api/video/release/:reservationId  — release a reservation (payment failed)
router.post("/release/:reservationId", requireAuth, async (req, res) => {
  try {
    const booking = await VideoBooking.findById(req.params.reservationId);
    if (!booking || booking.status !== "reserved") {
      res.json({ message: "Nothing to release." });
      return;
    }
    booking.status = "expired";
    await booking.save();

    // Decrement reserved count
    await VideoSlot.findByIdAndUpdate(booking.videoSlotId, {
      $inc: { reservedCount: -1 },
    });

    res.json({ message: "Reservation released." });
  } catch (err) {
    res.status(500).json({ error: "Could not release reservation." });
  }
});

// ── Admin: bookings for a date ────────────────────────────────────────────────

// GET /api/video/bookings?date=YYYY-MM-DD  — admin
router.get("/bookings", requireAdmin, async (req, res) => {
  try {
    const { date } = req.query;
    const filter: Record<string, unknown> = { status: "confirmed" };
    if (date) filter.videoDate = date;
    const bookings = await VideoBooking.find(filter)
      .populate("userId", "name phone email")
      .populate("videoSlotId", "startTime endTime")
      .sort({ videoDate: 1, startTime: 1 })
      .lean();
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch video bookings." });
  }
});

export default router;
