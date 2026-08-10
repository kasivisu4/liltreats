import { Router } from "express";
import { Product } from "../models/Product.js";
import { Inventory } from "../models/Inventory.js";
import { InventoryMovement } from "../models/InventoryMovement.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/products  — public: active products only
router.get("/", async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const filter: Record<string, unknown> = { isActive: true };
    if (category && category !== "all") filter.categoryId = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    let q = Product.find(filter).populate("categoryId", "name");
    if (sort === "price_asc") q = q.sort({ sellingPrice: 1 });
    else if (sort === "price_desc") q = q.sort({ sellingPrice: -1 });
    else if (sort === "newest") q = q.sort({ createdAt: -1 });
    else q = q.sort({ isFeatured: -1, createdAt: -1 });

    const products = await q.lean();

    // Attach live stock from inventory collection
    const ids = products.map((p) => p._id);
    const inv = await Inventory.find({ productId: { $in: ids } }).lean();
    const stockMap = new Map(inv.map((i) => [String(i.productId), i.currentStock]));

    const enriched = products.map((p) => ({
      ...p,
      currentStock: stockMap.get(String(p._id)) ?? p.currentStock ?? 0,
    }));

    res.json({ products: enriched });
  } catch (err) {
    console.error("[products/GET]", err);
    res.status(500).json({ error: "Could not fetch products." });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("categoryId", "name").lean();
    if (!product) { res.status(404).json({ error: "Product not found." }); return; }
    const inv = await Inventory.findOne({ productId: product._id }).lean();
    res.json({ product: { ...product, currentStock: inv?.currentStock ?? 0 } });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch product." });
  }
});

// GET /api/products/admin/all  — admin: all products including inactive
router.get("/admin/all", requireAdmin, async (req, res) => {
  try {
    const products = await Product.find({}).populate("categoryId", "name").lean();
    const ids = products.map((p) => p._id);
    const inv = await Inventory.find({ productId: { $in: ids } }).lean();
    const stockMap = new Map(inv.map((i) => [String(i.productId), i]));
    const enriched = products.map((p) => ({
      ...p,
      inventory: stockMap.get(String(p._id)) ?? null,
    }));
    res.json({ products: enriched });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch products." });
  }
});

// POST /api/products  — admin only
router.post("/", requireAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    // Create inventory record
    await Inventory.create({
      productId: product._id,
      sku: product.sku,
      currentStock: product.currentStock ?? 0,
      minimumStock: product.minimumStock ?? 5,
      costPrice: product.costPrice,
      stockValue: (product.currentStock ?? 0) * product.costPrice,
    });
    // Record initial stock entry
    if ((product.currentStock ?? 0) > 0) {
      await InventoryMovement.create({
        productId: product._id,
        sku: product.sku,
        type: "stock_entry",
        quantity: product.currentStock,
        previousStock: 0,
        newStock: product.currentStock,
        reason: "Initial stock entry",
        referenceType: "manual",
        createdBy: req.user!.userId,
      });
    }
    res.status(201).json({ product });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Could not create product.";
    res.status(400).json({ error: msg });
  }
});

// PATCH /api/products/:id  — admin only
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!product) { res.status(404).json({ error: "Product not found." }); return; }
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: "Could not update product." });
  }
});

// DELETE /api/products/:id  — admin only (soft delete = deactivate)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { $set: { isActive: false } });
    res.json({ message: "Product deactivated." });
  } catch (err) {
    res.status(500).json({ error: "Could not deactivate product." });
  }
});

export default router;
