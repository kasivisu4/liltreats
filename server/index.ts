import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import { optionalAuth } from "./middleware/auth.js";

// Route groups
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import scoopRoutes from "./routes/scoops.js";
import scoopMappingRoutes from "./routes/scoopMappings.js";
import videoRoutes from "./routes/video.js";
import orderRoutes from "./routes/orders.js";
import bookingRoutes from "./routes/bookings.js";
import inventoryRoutes from "./routes/inventory.js";
import paymentRoutes from "./routes/payments.js";
import deliveryRoutes from "./routes/delivery.js";
import notificationRoutes from "./routes/notifications.js";
import adminCustomerRoutes from "./routes/admin/customers.js";
import adminReportRoutes from "./routes/admin/reports.js";
import adminProfitRoutes from "./routes/admin/profit.js";
import adminContentRoutes from "./routes/admin/content.js";
import adminDashboardRoutes from "./routes/admin/dashboard.js";

const app = express();
const PORT = process.env.API_PORT ?? 5001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(optionalAuth);

// ── Health ────────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/scoops", scoopRoutes);
app.use("/api/scoop-mappings", scoopMappingRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/admin/reports", adminReportRoutes);
app.use("/api/admin/profit", adminProfitRoutes);
app.use("/api/admin/content", adminContentRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server error]", err.message);
  res.status(500).json({ error: "Internal server error." });
});

// ── Start ──────────────────────────────────────────────────────────────────── v2
async function start() {
  // Start the HTTP server first so the frontend is always reachable,
  // then attempt MongoDB connection. If Atlas rejects (IP not whitelisted)
  // the server stays up and API routes return 503 instead of crashing.
  app.listen(PORT, () => {
    console.log(`[api] LilTreats API running on port ${PORT}`);
  });

  try {
    await connectDB();
  } catch (err) {
    // connectDB already logs and handles retries — this is a final fallback.
    const message = err instanceof Error ? err.message : String(err);
    console.error("[api] MongoDB unavailable — API routes requiring DB will return 503.", message);
  }
}

start().catch((err) => {
  console.error("[fatal] Unexpected error during startup:", err);
});

export default app;
