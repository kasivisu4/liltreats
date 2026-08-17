import { Router } from "express";
import { ScoopConfig } from "../models/ScoopConfig.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/scoops  — public
router.get("/", async (_req, res) => {
  try {
    const scoops = await ScoopConfig.find({ isActive: true }).sort({ price: 1 }).lean();
    res.json({ scoops });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch scoops." });
  }
});

// GET /api/scoops/admin/all  — admin (includes inactive)
router.get("/admin/all", requireAdmin, async (_req, res) => {
  try {
    const scoops = await ScoopConfig.find({}).sort({ price: 1 }).lean();
    res.json({ scoops });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch scoops." });
  }
});

// GET /api/scoops/:id
router.get("/:id", async (req, res) => {
  try {
    const scoop = await ScoopConfig.findById(req.params.id).lean();
    if (!scoop) { res.status(404).json({ error: "Scoop not found." }); return; }
    res.json({ scoop });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch scoop." });
  }
});

// POST /api/scoops  — admin
router.post("/", requireAdmin, async (req, res) => {
  try {
    const scoop = await ScoopConfig.create(req.body);
    res.status(201).json({ scoop });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Could not create scoop.";
    res.status(400).json({ error: msg });
  }
});

// PATCH /api/scoops/:id  — admin
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const scoop = await ScoopConfig.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!scoop) { res.status(404).json({ error: "Scoop not found." }); return; }
    res.json({ scoop });
  } catch (err) {
    res.status(500).json({ error: "Could not update scoop." });
  }
});

export default router;
