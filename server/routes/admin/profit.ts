import { Router } from "express";
import { Order } from "../../models/Order.js";
import { requireAdmin } from "../../middleware/auth.js";

const router = Router();

// GET /api/admin/profit?period=today|week|month|all
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { period = "month" } = req.query;

    const now = new Date();
    let fromDate: Date | null = null;

    if (period === "today") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "week") {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const filter: Record<string, unknown> = { paymentStatus: "successful" };
    if (fromDate) filter.createdAt = { $gte: fromDate };

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    const revenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    const itemsCost = orders.reduce((s, o) => s + o.itemCostTotal, 0);
    const packagingCost = orders.reduce((s, o) => s + (o.packagingCost ?? 0), 0);
    const shippingCost = orders.reduce((s, o) => s + (o.shippingCost ?? 0), 0);
    const gatewayCost = orders.reduce((s, o) => s + (o.paymentGatewayFee ?? 0), 0);
    const discount = orders.reduce((s, o) => s + (o.discount ?? 0), 0);
    const totalCost = itemsCost + packagingCost + shippingCost + gatewayCost + discount;
    const netProfit = orders.reduce((s, o) => s + (o.netProfit ?? 0), 0);
    const margin = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;

    // Per-order breakdown
    const orderBreakdown = orders.map((o) => ({
      orderId: o.orderNumber,
      createdAt: o.createdAt,
      customerName: o.customerName,
      revenue: o.totalAmount,
      itemCost: o.itemCostTotal,
      packagingCost: o.packagingCost,
      shippingCost: o.shippingCost,
      gatewayCost: o.paymentGatewayFee,
      discount: o.discount,
      netProfit: o.netProfit,
      margin: o.totalAmount > 0
        ? Math.round(((o.netProfit ?? 0) / o.totalAmount) * 100)
        : 0,
    }));

    res.json({
      period,
      summary: {
        revenue,
        itemsCost,
        packagingCost,
        shippingCost,
        gatewayCost,
        discount,
        totalCost,
        netProfit,
        margin,
        orderCount: orders.length,
        avgOrderProfit: orders.length > 0 ? Math.round(netProfit / orders.length) : 0,
      },
      orders: orderBreakdown,
    });
  } catch (err) {
    console.error("[admin/profit]", err);
    res.status(500).json({ error: "Could not fetch profit data." });
  }
});

export default router;
