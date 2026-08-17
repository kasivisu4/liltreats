/**
 * server/seed.ts
 * Seed the MongoDB database with initial required data.
 * Run once: node --loader ts-node/esm server/seed.ts
 * Safe to re-run — all operations are upserts.
 */

import { connectDB } from "./db.js";
import { ScoopConfig } from "./models/ScoopConfig.js";
import { VideoConfig } from "./models/VideoConfig.js";
import { Category } from "./models/Category.js";
import { Product } from "./models/Product.js";
import { Inventory } from "./models/Inventory.js";

async function seed() {
  await connectDB();
  console.log("[seed] Connected to MongoDB");

  // ── Video Config (singleton) ───────────────────────────────────────────────
  const existingConfig = await VideoConfig.findOne();
  if (!existingConfig) {
    await VideoConfig.create({
      minimumLeadDays: 5,
      bookingWindowDays: 30,
      maxBookingsPerDay: 2,
      reservationTimeoutMinutes: 15,
    });
    console.log("[seed] Created default video config");
  }

  // ── Scoop Configs ─────────────────────────────────────────────────────────
  const scoops = [
    {
      tier: "mini",
      name: "Mini Scoop",
      slug: "mini-scoop",
      price: 499,
      itemRange: "5–6",
      description: "A delightful little mystery box packed with 5–6 handpicked LilTreats items. Perfect for a first taste of the magic.",
      isActive: true,
    },
    {
      tier: "magic",
      name: "Magic Scoop",
      slug: "magic-scoop",
      price: 899,
      itemRange: "8–10",
      description: "Our most popular scoop. Eight to ten carefully curated mystery items spanning jewellery, accessories, beauty, and lifestyle.",
      isActive: true,
    },
    {
      tier: "premium",
      name: "Premium Scoop",
      slug: "premium-scoop",
      price: 1099,
      itemRange: "10–12",
      description: "The ultimate LilTreats experience. Ten to twelve premium mystery items — our finest picks, packed with love.",
      isActive: true,
    },
  ];

  for (const scoop of scoops) {
    await ScoopConfig.findOneAndUpdate(
      { tier: scoop.tier },
      { $setOnInsert: scoop },
      { upsert: true },
    );
  }
  console.log("[seed] Scoop configs upserted");

  // ── Categories ────────────────────────────────────────────────────────────
  const categories = [
    { name: "Jewellery", slug: "jewellery", sortOrder: 1 },
    { name: "Hair", slug: "hair", sortOrder: 2 },
    { name: "Accessories", slug: "accessories", sortOrder: 3 },
    { name: "Beauty", slug: "beauty", sortOrder: 4 },
    { name: "Trinkets", slug: "trinkets", sortOrder: 5 },
    { name: "Stationery", slug: "stationery", sortOrder: 6 },
    { name: "Lifestyle", slug: "lifestyle", sortOrder: 7 },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categories) {
    const doc = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { $setOnInsert: { ...cat, isActive: true } },
      { upsert: true, new: true },
    );
    categoryMap[cat.name] = String(doc._id);
  }
  console.log("[seed] Categories upserted");

  // ── Sample Products + Inventory ───────────────────────────────────────────
  const products = [
    { sku: "JWL-001", name: "Pearl drop earrings", category: "Jewellery", costPrice: 80, sellingPrice: 249, stock: 14, minStock: 5, isNew: true, isFeatured: true, description: "Delicate freshwater pearl drops on gold-plated hooks." },
    { sku: "JWL-002", name: "Charm bracelet", category: "Jewellery", costPrice: 110, sellingPrice: 349, stock: 4, minStock: 5, isFeatured: true, description: "Adjustable gold-tone bracelet with celestial and floral charms." },
    { sku: "JWL-003", name: "Dainty ring set (×3)", category: "Jewellery", costPrice: 90, sellingPrice: 299, stock: 16, minStock: 8, isNew: true, description: "Three stackable thin rings in gold-filled." },
    { sku: "HAIR-001", name: "Hair bow clips (set of 4)", category: "Hair", costPrice: 55, sellingPrice: 199, stock: 20, minStock: 10, isFeatured: true, description: "Satin-finish bow clips in blush, ivory, sage & lavender." },
    { sku: "HAIR-002", name: "Velvet headband", category: "Hair", costPrice: 50, sellingPrice: 179, stock: 11, minStock: 5, isNew: true, description: "Padded velvet headband in berry." },
    { sku: "HAIR-003", name: "Butterfly bobby pins (×6)", category: "Hair", costPrice: 40, sellingPrice: 149, stock: 5, minStock: 5, description: "Gold-tone butterfly micro pins." },
    { sku: "ACC-001", name: "Celestial phone charm", category: "Accessories", costPrice: 60, sellingPrice: 199, stock: 6, minStock: 5, isNew: true, isFeatured: true, description: "Crescent moon + star pendant on a thin bead string." },
    { sku: "ACC-002", name: "Mini tote bag", category: "Accessories", costPrice: 150, sellingPrice: 499, stock: 7, minStock: 3, description: "Canvas mini tote, liltreats lettered in gold." },
    { sku: "ACC-003", name: "Retro sunglasses", category: "Accessories", costPrice: 120, sellingPrice: 399, stock: 3, minStock: 5, isFeatured: true, description: "Rounded tortoise-shell frames with UV400 lenses." },
    { sku: "BEA-001", name: "Tinted lip balm", category: "Beauty", costPrice: 45, sellingPrice: 149, stock: 17, minStock: 10, description: "Sheer berry tint with vitamin E + shea butter. SPF 15." },
    { sku: "BEA-002", name: "Mini perfume vial", category: "Beauty", costPrice: 85, sellingPrice: 299, stock: 10, minStock: 5, isNew: true, isFeatured: true, description: "10ml eau de parfum — jasmine & vanilla base." },
    { sku: "BEA-003", name: "Crystal nail charms (set)", category: "Beauty", costPrice: 35, sellingPrice: 129, stock: 12, minStock: 8, description: "Mixed-shape rhinestone charms for nail art." },
    { sku: "TRK-001", name: "Kawaii keychain plush", category: "Trinkets", costPrice: 50, sellingPrice: 179, stock: 3, minStock: 5, description: "5cm plush bear keyring with satin ribbon charm." },
    { sku: "TRK-002", name: "Holographic sticker sheet", category: "Trinkets", costPrice: 25, sellingPrice: 99, stock: 22, minStock: 10, description: "A4 sheet with 30 holographic die-cut stickers." },
    { sku: "TRK-003", name: "Crystal pocket stone", category: "Trinkets", costPrice: 40, sellingPrice: 149, stock: 8, minStock: 5, isFeatured: true, description: "Tumbled rose quartz stone." },
    { sku: "STA-001", name: "Pressed flower bookmark", category: "Stationery", costPrice: 28, sellingPrice: 99, stock: 9, minStock: 5, description: "Laminated pressed wildflower bookmark with gold tassel." },
    { sku: "STA-002", name: "Mini notebook", category: "Stationery", costPrice: 40, sellingPrice: 149, stock: 12, minStock: 8, description: "A6 dot-grid notebook with floral cover." },
    { sku: "LIF-001", name: "Scented candle (tin)", category: "Lifestyle", costPrice: 100, sellingPrice: 349, stock: 6, minStock: 3, isNew: true, isFeatured: true, description: "60g soy wax candle — white tea & fig. 20hr burn." },
    { sku: "LIF-002", name: "Herbal tea sampler (×5)", category: "Lifestyle", costPrice: 60, sellingPrice: 199, stock: 15, minStock: 8, description: "5 flavours: chamomile, hibiscus, jasmine, mint, rose." },
    { sku: "LIF-003", name: "Trinket dish (ceramic)", category: "Lifestyle", costPrice: 75, sellingPrice: 249, stock: 5, minStock: 3, description: "Hand-painted leaf-shaped ceramic dish." },
  ];

  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const categoryId = categoryMap[p.category];

    const product = await Product.findOneAndUpdate(
      { sku: p.sku },
      {
        $setOnInsert: {
          sku: p.sku,
          name: p.name,
          slug,
          description: p.description,
          images: [],
          categoryId,
          costPrice: p.costPrice,
          sellingPrice: p.sellingPrice,
          currentStock: p.stock,
          minimumStock: p.minStock,
          isActive: true,
          isFeatured: p.isFeatured ?? false,
          isNew: p.isNew ?? false,
        },
      },
      { upsert: true, new: true },
    );

    // Create inventory record if missing
    await Inventory.findOneAndUpdate(
      { productId: product._id },
      {
        $setOnInsert: {
          productId: product._id,
          sku: p.sku,
          currentStock: p.stock,
          minimumStock: p.minStock,
          costPrice: p.costPrice,
          stockValue: p.stock * p.costPrice,
        },
      },
      { upsert: true },
    );
  }
  console.log("[seed] Products and inventory upserted");
  console.log("[seed] Done. MongoDB is ready.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] Fatal error:", err);
  process.exit(1);
});
