import { Router } from "express";
import { Order } from "../../models/Order.js";
import { Inventory } from "../../models/Inventory.js";
import { VideoBooking } from "../../models/VideoBooking.js";
import { requireAdmin } from "../../middleware/auth.js";

const router = Router();

// GET /api/admin/dashboard  — admin: all KPIs
router.get("/", requireAdmin, async (_req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const [allOrders, inventory, videoBookings] = await Promise.all([
      Order.find({}).lean(),
      Inventory.find({}).lean(),
      VideoBooking.find({ status: "confirmed" }).lean(),
    ]);

    const todayOrders = allOrders.filter((o) => o.createdAt?.toISOString().startsWith(today));
    const paidOrders = allOrders.filter((o) => o.paymentStatus === "successful");
    const monthlyOrders = paidOrders.filter((o) => o.createdAt && o.createdAt >= startOfMonth);
    const weeklyOrders = paidOrders.filter((o) => o.createdAt && o.createdAt >= startOfWeek);

    const todayBookings = videoBookings.filter((b) =>
      b.videoDate === today,
    );
    const upcomingBookings = videoBookings.filter((b) =>
      b.videoDate && b.videoDate > today,
    );

    const lowStock = inventory.filter((i) => i.currentStock > 0 && i.currentStock <= i.minimumStock);
    const outOfStock = inventory.filter((i) => i.currentStock === 0);

    res.json({
      // Sales
      todaySales: todayOrders.filter((o) => o.paymentStatus === "successful").reduce((s, o) => s + o.totalAmount, 0),
      weeklySales: weeklyOrders.reduce((s, o) => s + o.totalAmount, 0),
      monthlySales: monthlyOrders.reduce((s, o) => s + o.totalAmount, 0),
      totalSales: paidOrders.reduce((s, o) => s + o.totalAmount, 0),
      // Orders
      todayOrders: todayOrders.length,
      pendingOrders: allOrders.filter((o) => o.orderStatus === "confirmed").length,
      processingOrders: allOrders.filter((o) => ["preparing", "packed"].includes(o.orderStatus)).length,
      shippedOrders: allOrders.filter((o) => ["shipped", "out_for_delivery"].includes(o.orderStatus)).length,
      deliveredOrders: allOrders.filter((o) => o.orderStatus === "delivered").length,
      cancelledOrders: allOrders.filter((o) => o.orderStatus === "cancelled").length,
      // Video
      todayVideoBookings: todayBookings.length,
      upcomingVideoBookings: upcomingBookings.length,
      // Inventory
      totalItems: inventory.length,
      lowStockItems: lowStock.length,
      outOfStockItems: outOfStock.length,
      stockValue: inventory.reduce((s, i) => s + i.stockValue, 0),
      // Profit
      todayProfit: todayOrders.reduce((s, o) => s + (o.netProfit ?? 0), 0),
      monthlyProfit: monthlyOrders.reduce((s, o) => s + (o.netProfit ?? 0), 0),
      totalProfit: paidOrders.reduce((s, o) => s + (o.netProfit ?? 0), 0),
    });
  } catch (err) {
    console.error("[admin/dashboard]", err);
    res.status(500).json({ error: "Could not fetch dashboard stats." });
  }
});

export default router;
