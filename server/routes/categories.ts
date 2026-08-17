import { Router } from "express";
import { Category } from "../models/Category.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/categories
router.get("/", async (_req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch categories." });
  }
});

// POST /api/categories  — admin
router.post("/", requireAdmin, async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ category: cat });
  } catch (err) {
    res.status(400).json({ error: "Could not create category." });
  }
});

// PATCH /api/categories/:id  — admin
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json({ category: cat });
  } catch (err) {
    res.status(500).json({ error: "Could not update category." });
  }
});

export default router;
