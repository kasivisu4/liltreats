import { Router } from "express";
import { Notification } from "../models/Notification.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/notifications  — customer: their notifications
router.get("/", requireAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user!.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch notifications." });
  }
});

// PATCH /api/notifications/read-all  — mark all as read
// NOTE: must be registered BEFORE /:id/read so Express doesn't treat "read-all" as an ID
router.patch("/read-all", requireAuth, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user!.userId, isRead: false },
      { $set: { isRead: true } },
    );
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    res.status(500).json({ error: "Could not mark notifications." });
  }
});

export default router;
