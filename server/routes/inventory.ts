import { Router } from "express";
import { Inventory } from "../models/Inventory.js";
import { InventoryMovement } from "../models/InventoryMovement.js";
import { Product } from "../models/Product.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/inventory  — admin: all inventory items
router.get("/", requireAdmin, async (_req, res) => {
  try {
    const items = await Inventory.find({})
      .populate("productId", "name sku category isActive isNew isFeatured sellingPrice images")
      .lean();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch inventory." });
  }
});

// GET /api/inventory/movements  — admin: all movements
router.get("/movements", requireAdmin, async (req, res) => {
  try {
    const { productId, type, limit = 100 } = req.query;
    const filter: Record<string, unknown> = {};
    if (productId) filter.productId = productId;
    if (type) filter.type = type;
    const movements = await InventoryMovement.find(filter)
      .populate("productId", "name sku")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    res.json({ movements });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch movements." });
  }
});

// GET /api/inventory/movements/:productId  — admin: movements for one product
router.get("/movements/:productId", requireAdmin, async (req, res) => {
  try {
    const movements = await InventoryMovement.find({ productId: req.params.productId })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ movements });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch movements." });
  }
});

// POST /api/inventory/add-stock  — admin: add stock to an item
router.post("/add-stock", requireAdmin, async (req, res) => {
  try {
    const { productId, quantity, costPrice, note } = req.body;
    if (!productId || !quantity || quantity <= 0) {
      res.status(400).json({ error: "productId and positive quantity required." });
      return;
    }
    const inv = await Inventory.findOne({ productId });
    if (!inv) { res.status(404).json({ error: "Inventory record not found." }); return; }

    const prev = inv.currentStock;
    inv.currentStock += quantity;
    if (costPrice > 0) inv.costPrice = costPrice;
    inv.stockValue = inv.currentStock * inv.costPrice;
    await inv.save();

    // Also update the product's cost price snapshot
    if (costPrice > 0) {
      await Product.findByIdAndUpdate(productId, { $set: { costPrice } });
    }

    await InventoryMovement.create({
      productId,
      sku: inv.sku,
      type: "stock_entry",
      quantity,
      previousStock: prev,
      newStock: inv.currentStock,
      reason: note || "Stock entry",
      referenceType: "manual",
      createdBy: req.user!.userId,
    });

    res.json({ inventory: inv });
  } catch (err) {
    res.status(500).json({ error: "Could not add stock." });
  }
});

// POST /api/inventory/manual-debit  — admin: manually deduct stock
router.post("/manual-debit", requireAdmin, async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;
    if (!productId || !quantity || quantity <= 0 || !reason) {
      res.status(400).json({ error: "productId, quantity and reason are required." });
      return;
    }
    const inv = await Inventory.findOne({ productId });
    if (!inv) { res.status(404).json({ error: "Inventory record not found." }); return; }

    const prev = inv.currentStock;
    inv.currentStock = Math.max(0, prev - quantity);
    inv.stockValue = inv.currentStock * inv.costPrice;
    await inv.save();

    await InventoryMovement.create({
      productId,
      sku: inv.sku,
      type: "manual_debit",
      quantity: -quantity,
      previousStock: prev,
      newStock: inv.currentStock,
      reason,
      referenceType: "manual",
      createdBy: req.user!.userId,
    });

    res.json({ inventory: inv });
  } catch (err) {
    res.status(500).json({ error: "Could not debit stock." });
  }
});

// POST /api/inventory/adjust  — admin: set physical count
router.post("/adjust", requireAdmin, async (req, res) => {
  try {
    const { productId, newQuantity, reason } = req.body;
    if (productId === undefined || newQuantity === undefined || !reason) {
      res.status(400).json({ error: "productId, newQuantity and reason are required." });
      return;
    }
    const inv = await Inventory.findOne({ productId });
    if (!inv) { res.status(404).json({ error: "Inventory record not found." }); return; }

    const prev = inv.currentStock;
    const diff = newQuantity - prev;
    inv.currentStock = newQuantity;
    inv.stockValue = newQuantity * inv.costPrice;
    await inv.save();

    await InventoryMovement.create({
      productId,
      sku: inv.sku,
      type: "adjustment",
      quantity: diff,
      previousStock: prev,
      newStock: newQuantity,
      reason,
      referenceType: "manual",
      createdBy: req.user!.userId,
    });

    res.json({ inventory: inv });
  } catch (err) {
    res.status(500).json({ error: "Could not adjust stock." });
  }
});

export default router;
