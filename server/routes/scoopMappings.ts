import { Router } from "express";
import { ScoopItemMapping } from "../models/ScoopItemMapping.js";
import { Product } from "../models/Product.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/scoop-mappings/:scoopId  — admin: get all item mappings for a scoop
router.get("/:scoopId", requireAdmin, async (req, res) => {
  try {
    const mappings = await ScoopItemMapping.find({ scoopId: req.params.scoopId })
      .populate("productId", "name sku costPrice sellingPrice")
      .lean();
    // Calculate total mapped cost
    const totalCost = mappings.reduce((sum, m) => {
      const p = m.productId as { costPrice?: number } | null;
      return sum + (p?.costPrice ?? 0) * m.quantity;
    }, 0);
    res.json({ mappings, totalCost });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch scoop mappings." });
  }
});

// POST /api/scoop-mappings  — admin: add item to scoop
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { scoopId, productId, quantity } = req.body;
    if (!scoopId || !productId || !quantity) {
      res.status(400).json({ error: "scoopId, productId and quantity are required." });
      return;
    }
    // Upsert — if same product already mapped, update quantity
    const mapping = await ScoopItemMapping.findOneAndUpdate(
      { scoopId, productId },
      { $set: { quantity } },
      { upsert: true, new: true },
    ).populate("productId", "name sku costPrice");
    res.status(201).json({ mapping });
  } catch (err) {
    res.status(400).json({ error: "Could not save mapping." });
  }
});

// PATCH /api/scoop-mappings/:id  — admin: update quantity
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const mapping = await ScoopItemMapping.findByIdAndUpdate(
      req.params.id,
      { $set: { quantity: req.body.quantity } },
      { new: true },
    ).populate("productId", "name sku costPrice");
    if (!mapping) { res.status(404).json({ error: "Mapping not found." }); return; }
    res.json({ mapping });
  } catch (err) {
    res.status(500).json({ error: "Could not update mapping." });
  }
});

// DELETE /api/scoop-mappings/:id  — admin: remove item from scoop
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await ScoopItemMapping.findByIdAndDelete(req.params.id);
    res.json({ message: "Mapping removed." });
  } catch (err) {
    res.status(500).json({ error: "Could not remove mapping." });
  }
});

// GET /api/scoop-mappings/:scoopId/cost  — internal: calculate total cost of a scoop
router.get("/:scoopId/cost", async (req, res) => {
  try {
    const mappings = await ScoopItemMapping.find({ scoopId: req.params.scoopId })
      .populate<{ productId: { costPrice: number } }>("productId", "costPrice")
      .lean();
    const totalCost = mappings.reduce((sum, m) => sum + m.productId.costPrice * m.quantity, 0);
    res.json({ totalCost, mappings });
  } catch (err) {
    res.status(500).json({ error: "Could not calculate scoop cost." });
  }
});

export default router;
