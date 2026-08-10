import { Router } from "express";
import { Order } from "../../models/Order.js";
import { Inventory } from "../../models/Inventory.js";
import { ScoopBooking } from "../../models/ScoopBooking.js";
import { User } from "../../models/User.js";
import { requireAdmin } from "../../middleware/auth.js";

const router = Router();

// GET /api/admin/reports?type=sales|inventory|bookings|customers&from=&to=
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { type = "sales", from, to } = req.query;
    const dateFilter: Record<string, unknown> = {};
    if (from && to) {
      dateFilter.createdAt = { $gte: new Date(String(from)), $lte: new Date(String(to)) };
    }

    if (type === "sales") {
      const orders = await Order.find({ paymentStatus: "successful", ...dateFilter }).lean();
      res.json({
        totalOrders: orders.length,
        totalRevenue: orders.reduce((s, o) => s + o.totalAmount, 0),
        avgOrderValue: orders.length ? orders.reduce((s, o) => s + o.totalAmount, 0) / orders.length : 0,
        totalProfit: orders.reduce((s, o) => s + (o.netProfit ?? 0), 0),
        byTier: ["mini", "magic", "premium"].map((tier) => {
          const t = orders.filter((o) => o.items.some((i) => i.name.toLowerCase().includes(tier)));
          return { tier, count: t.length, revenue: t.reduce((s, o) => s + o.totalAmount, 0) };
        }),
      });
    } else if (type === "inventory") {
      const inventory = await Inventory.find({}).populate("productId", "name sku").lean();
      res.json({
        totalSKUs: inventory.length,
        totalUnits: inventory.reduce((s, i) => s + i.currentStock, 0),
        totalStockValue: inventory.reduce((s, i) => s + i.stockValue, 0),
        lowStock: inventory.filter((i) => i.currentStock > 0 && i.currentStock <= i.minimumStock),
        outOfStock: inventory.filter((i) => i.currentStock === 0),
      });
    } else if (type === "bookings") {
      const bookings = await ScoopBooking.find({ ...dateFilter }).lean();
      res.json({
        total: bookings.length,
        withVideo: bookings.filter((b) => b.experience === "with_video").length,
        withoutVideo: bookings.filter((b) => b.experience === "without_video").length,
        mini: bookings.filter((b) => b.tier === "mini").length,
        magic: bookings.filter((b) => b.tier === "magic").length,
        premium: bookings.filter((b) => b.tier === "premium").length,
      });
    } else if (type === "customers") {
      const customers = await User.find({ role: "customer", ...dateFilter }).lean();
      const orders = await Order.find({ paymentStatus: "successful" }).lean();
      const byCustomer = new Map<string, number>();
      orders.forEach((o) => {
        const id = String(o.userId);
        byCustomer.set(id, (byCustomer.get(id) ?? 0) + 1);
      });
      const returning = Array.from(byCustomer.values()).filter((c) => c > 1).length;
      res.json({
        total: customers.length,
        returning,
        new: customers.length - returning,
        totalSpend: orders.reduce((s, o) => s + o.totalAmount, 0),
        avgSpend: customers.length
          ? orders.reduce((s, o) => s + o.totalAmount, 0) / customers.length
          : 0,
      });
    } else {
      res.status(400).json({ error: "Invalid report type." });
    }
  } catch (err) {
    res.status(500).json({ error: "Could not generate report." });
  }
});

export default router;
