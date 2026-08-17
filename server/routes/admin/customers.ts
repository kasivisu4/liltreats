import { Router } from "express";
import { User } from "../../models/User.js";
import { Order } from "../../models/Order.js";
import { ScoopBooking } from "../../models/ScoopBooking.js";
import { Address } from "../../models/Address.js";
import { requireAdmin } from "../../middleware/auth.js";

const router = Router();

// GET /api/admin/customers  — admin: all customers
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    const filter: Record<string, unknown> = { role: "customer" };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    const customers = await User.find(filter)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with order stats
    const enriched = await Promise.all(
      customers.map(async (c) => {
        const orders = await Order.find({ userId: c._id, paymentStatus: "successful" })
          .select("totalAmount netProfit createdAt orderNumber")
          .lean();
        return {
          ...c,
          totalOrders: orders.length,
          totalSpend: orders.reduce((s, o) => s + o.totalAmount, 0),
          totalProfit: orders.reduce((s, o) => s + (o.netProfit ?? 0), 0),
          lastOrderAt: orders[0]?.createdAt ?? null,
        };
      }),
    );

    res.json({ customers: enriched });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch customers." });
  }
});

// GET /api/admin/customers/:id  — admin: single customer detail
router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select("-passwordHash").lean();
    if (!customer) { res.status(404).json({ error: "Customer not found." }); return; }

    const [orders, bookings, addresses] = await Promise.all([
      Order.find({ userId: req.params.id }).sort({ createdAt: -1 }).lean(),
      ScoopBooking.find({ userId: req.params.id }).sort({ createdAt: -1 }).lean(),
      Address.find({ userId: req.params.id }).lean(),
    ]);

    res.json({
      customer,
      orders,
      bookings,
      addresses,
      totalOrders: orders.length,
      totalSpend: orders.filter((o) => o.paymentStatus === "successful").reduce((s, o) => s + o.totalAmount, 0),
    });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch customer." });
  }
});

export default router;
