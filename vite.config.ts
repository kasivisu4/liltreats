import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// ─────────────────────────────────────────────────────────────────────────────
// LilTreats API Server — runs as a Vite plugin so it starts inside the same
// Node process. Zero new files needed; works within the 46-file build context.
// ─────────────────────────────────────────────────────────────────────────────
function lilTreatsApiPlugin(): Plugin {
  return {
    name: "liltreats-api",
    configureServer(server) {
      // Dynamically import so the build (tsc/vite build) never tries to bundle these
      Promise.all([
        import("express").then((m) => m.default),
        import("mongoose").then((m) => m.default),
        import("bcryptjs").then((m) => m.default),
        import("jsonwebtoken").then((m) => m.default),
        import("cors").then((m) => m.default),
      ]).then(([express, mongoose, bcrypt, jwt, cors]) => {
        const MONGODB_URI = process.env.MONGODB_URI || "";
        const DB_NAME = process.env.DB_NAME || "liltreats";
        const JWT_SECRET = process.env.JWT_SECRET || "liltreats-dev-secret-2026";
        const API_PORT = parseInt(process.env.API_PORT || "5001", 10);

        if (!MONGODB_URI) {
          console.warn("[api] MONGODB_URI not set — API server skipped");
          return;
        }

        // ── Mongoose connection ──────────────────────────────────────────────
        let dbConnected = false;

        function connectWithRetry(attempt = 1): void {
          const MAX = 5;
          mongoose
            .connect(MONGODB_URI, { dbName: DB_NAME })
            .then(() => {
              dbConnected = true;
              console.log(`[api] MongoDB connected to database: ${DB_NAME}`);
            })
            .catch((err: Error) => {
              console.error(`[api] Connection attempt ${attempt}/${MAX} failed: ${err.message}`);
              if (attempt < MAX) {
                setTimeout(() => connectWithRetry(attempt + 1), 3000 * attempt);
              } else {
                console.error("[api] Could not connect to MongoDB after 5 attempts. API running without DB.");
              }
            });
        }
        connectWithRetry();

        // ── Schemas ──────────────────────────────────────────────────────────
        const { Schema, model, models } = mongoose;

        const UserSchema = new Schema({
          name: { type: String, required: true },
          email: { type: String, required: true, unique: true },
          phone: { type: String, required: true },
          passwordHash: { type: String, required: true },
          role: { type: String, enum: ["customer", "admin"], default: "customer" },
          status: { type: String, default: "active" },
          lastLoginAt: Date,
        }, { timestamps: true });

        const AddressSchema = new Schema({
          userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
          label: { type: String, default: "Home" },
          name: String,
          phone: String,
          house: String,
          street: String,
          area: String,
          city: String,
          state: String,
          pincode: String,
          isDefault: { type: Boolean, default: false },
        }, { timestamps: true });

        const ProductSchema = new Schema({
          sku: { type: String, required: true, unique: true },
          name: { type: String, required: true },
          slug: String,
          description: String,
          images: [String],
          category: String,
          costPrice: { type: Number, required: true },
          sellingPrice: { type: Number, required: true },
          currentStock: { type: Number, default: 0 },
          minimumStock: { type: Number, default: 5 },
          isActive: { type: Boolean, default: true },
          isFeatured: { type: Boolean, default: false },
          isNewArrival: { type: Boolean, default: false },
          isLimited: { type: Boolean, default: false },
          emoji: String,
        }, { timestamps: true });

        const ScoopConfigSchema = new Schema({
          tier: { type: String, enum: ["mini", "magic", "premium"], required: true, unique: true },
          name: String,
          price: Number,
          itemCountMin: Number,
          itemCountMax: Number,
          description: String,
          images: [String],
          isActive: { type: Boolean, default: true },
        }, { timestamps: true });

        const ScoopItemMappingSchema = new Schema({
          scoopId: { type: Schema.Types.ObjectId, ref: "ScoopConfig", required: true },
          productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
          quantity: { type: Number, default: 1 },
        }, { timestamps: true });

        const VideoConfigSchema = new Schema({
          minimumLeadDays: { type: Number, default: 5 },
          bookingWindowDays: { type: Number, default: 30 },
          maxBookingsPerDay: { type: Number, default: 2 },
          reservationTimeoutMinutes: { type: Number, default: 15 },
        }, { timestamps: true });

        const VideoSlotSchema = new Schema({
          date: { type: String, required: true },
          startTime: { type: String, required: true },
          endTime: String,
          maxCapacity: { type: Number, default: 1 },
          bookedCount: { type: Number, default: 0 },
          status: { type: String, enum: ["available", "blocked", "full"], default: "available" },
        }, { timestamps: true });

        const VideoBookingSchema = new Schema({
          bookingRef: String,
          orderId: { type: Schema.Types.ObjectId, ref: "Order" },
          userId: { type: Schema.Types.ObjectId, ref: "User" },
          scoopTier: String,
          videoDate: String,
          videoSlotId: { type: Schema.Types.ObjectId, ref: "VideoSlot" },
          startTime: String,
          status: { type: String, enum: ["reserved", "confirmed", "completed", "cancelled", "expired"], default: "reserved" },
          expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
        }, { timestamps: true });

        const OrderItemSchema = new Schema({
          productId: Schema.Types.ObjectId,
          scoopTier: String,
          name: String,
          quantity: Number,
          sellingPrice: Number,
          costPrice: Number,
          subtotal: Number,
        });

        const OrderSchema = new Schema({
          orderNumber: { type: String, unique: true },
          userId: { type: Schema.Types.ObjectId, ref: "User" },
          customerName: String,
          customerPhone: String,
          customerEmail: String,
          customerInstagram: String,
          items: [OrderItemSchema],
          subtotal: Number,
          shippingCost: { type: Number, default: 60 },
          discount: { type: Number, default: 0 },
          paymentGatewayFee: Number,
          packagingCost: Number,
          otherCost: { type: Number, default: 0 },
          totalAmount: Number,
          netProfit: Number,
          paymentStatus: { type: String, enum: ["pending", "processing", "successful", "failed", "refunded", "cancelled"], default: "pending" },
          orderStatus: { type: String, enum: ["confirmed", "preparing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"], default: "confirmed" },
          deliveryStatus: { type: String, default: "preparing" },
          shippingAddress: {
            house: String, street: String, area: String,
            city: String, state: String, pincode: String,
          },
          videoAddon: { type: Boolean, default: false },
          videoDate: String,
          videoTime: String,
          videoSlotId: Schema.Types.ObjectId,
          scoopTier: String,
          tierId: String,
          inventoryDeducted: { type: Boolean, default: false },
          cancelledAt: Date,
          cancelReason: String,
        }, { timestamps: true });

        const PaymentSchema = new Schema({
          orderId: { type: Schema.Types.ObjectId, ref: "Order" },
          userId: Schema.Types.ObjectId,
          orderNumber: String,
          amount: Number,
          currency: { type: String, default: "INR" },
          gateway: { type: String, default: "razorpay" },
          transactionId: String,
          paymentMethod: String,
          status: { type: String, enum: ["pending", "processing", "successful", "failed", "refunded", "cancelled"], default: "pending" },
          gatewayResponse: Schema.Types.Mixed,
          paidAt: Date,
        }, { timestamps: true });

        const DeliverySchema = new Schema({
          orderId: { type: Schema.Types.ObjectId, ref: "Order" },
          userId: Schema.Types.ObjectId,
          courierName: String,
          trackingNumber: String,
          trackingUrl: String,
          status: { type: String, enum: ["preparing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"], default: "preparing" },
          shippedAt: Date,
          deliveredAt: Date,
        }, { timestamps: true });

        const InventoryMovementSchema = new Schema({
          productId: { type: Schema.Types.ObjectId, ref: "Product" },
          sku: String,
          type: { type: String, enum: ["stock_entry", "automatic_debit", "manual_debit", "adjustment", "order_reversal"] },
          quantity: Number,
          previousStock: Number,
          newStock: Number,
          reason: String,
          referenceType: String,
          referenceId: String,
          createdBy: String,
        }, { timestamps: true });

        const NotificationSchema = new Schema({
          userId: Schema.Types.ObjectId,
          type: String,
          title: String,
          message: String,
          referenceType: String,
          referenceId: String,
          isRead: { type: Boolean, default: false },
        }, { timestamps: true });

        const WebsiteContentSchema = new Schema({
          section: { type: String, unique: true },
          content: Schema.Types.Mixed,
          images: [String],
          isActive: { type: Boolean, default: true },
          updatedBy: String,
        }, { timestamps: true });

        const FaqSchema = new Schema({
          question: String,
          answer: String,
          sortOrder: { type: Number, default: 0 },
          isActive: { type: Boolean, default: true },
        }, { timestamps: true });

        // Register models (guard against re-registration in dev HMR)
        const User = models.User || model("User", UserSchema);
        const Address = models.Address || model("Address", AddressSchema);
        const Product = models.Product || model("Product", ProductSchema);
        const ScoopConfig = models.ScoopConfig || model("ScoopConfig", ScoopConfigSchema);
        const ScoopItemMapping = models.ScoopItemMapping || model("ScoopItemMapping", ScoopItemMappingSchema);
        const VideoConfig = models.VideoConfig || model("VideoConfig", VideoConfigSchema);
        const VideoSlot = models.VideoSlot || model("VideoSlot", VideoSlotSchema);
        const VideoBooking = models.VideoBooking || model("VideoBooking", VideoBookingSchema);
        const Order = models.Order || model("Order", OrderSchema);
        const Payment = models.Payment || model("Payment", PaymentSchema);
        const Delivery = models.Delivery || model("Delivery", DeliverySchema);
        const InventoryMovement = models.InventoryMovement || model("InventoryMovement", InventoryMovementSchema);
        const Notification = models.Notification || model("Notification", NotificationSchema);
        const WebsiteContent = models.WebsiteContent || model("WebsiteContent", WebsiteContentSchema);
        const Faq = models.Faq || model("Faq", FaqSchema);

        // ── Express app ──────────────────────────────────────────────────────
        const app = express();
        app.use(cors({ origin: "*" }));
        app.use(express.json());

        // DB status check middleware
        function requireDb(req: any, res: any, next: any) {
          if (!dbConnected) return res.status(503).json({ error: "Database not connected yet" });
          next();
        }

        // Auth middleware
        function authMiddleware(req: any, res: any, next: any) {
          const token = req.headers.authorization?.replace("Bearer ", "");
          if (!token) return res.status(401).json({ error: "No token" });
          try {
            req.user = jwt.verify(token, JWT_SECRET);
            next();
          } catch {
            return res.status(401).json({ error: "Invalid token" });
          }
        }

        function adminMiddleware(req: any, res: any, next: any) {
          authMiddleware(req, res, () => {
            if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin only" });
            next();
          });
        }

        // ── Health ───────────────────────────────────────────────────────────
        app.get("/api/health", (_req, res) => {
          res.json({ status: "ok", db: dbConnected ? "connected" : "disconnected", ts: new Date().toISOString() });
        });

        // ── Auth routes ──────────────────────────────────────────────────────
        app.post("/api/auth/signup", requireDb, async (req, res) => {
          try {
            const { name, email, phone, password } = req.body;
            if (!name || !email || !phone || !password) return res.status(400).json({ error: "All fields required" });
            const exists = await User.findOne({ email });
            if (exists) return res.status(409).json({ error: "Email already registered" });
            const passwordHash = await bcrypt.hash(password, 12);
            const user = await User.create({ name, email, phone, passwordHash, role: "customer" });
            const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
            res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
          } catch (err: any) {
            res.status(500).json({ error: err.message });
          }
        });

        app.post("/api/auth/login", requireDb, async (req, res) => {
          try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(401).json({ error: "Invalid email or password" });
            const valid = await bcrypt.compare(password, user.passwordHash);
            if (!valid) return res.status(401).json({ error: "Invalid email or password" });
            await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
            const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
            res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
          } catch (err: any) {
            res.status(500).json({ error: err.message });
          }
        });

        app.get("/api/auth/me", authMiddleware, requireDb, async (req: any, res) => {
          try {
            const user = await User.findById(req.user.id).select("-passwordHash");
            if (!user) return res.status(404).json({ error: "User not found" });
            res.json(user);
          } catch (err: any) {
            res.status(500).json({ error: err.message });
          }
        });

        // ── Products ─────────────────────────────────────────────────────────
        app.get("/api/products", requireDb, async (_req, res) => {
          try {
            const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
            res.json(products);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.get("/api/products/all", adminMiddleware, requireDb, async (_req, res) => {
          try {
            const products = await Product.find().sort({ createdAt: -1 });
            res.json(products);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.post("/api/products", adminMiddleware, requireDb, async (req, res) => {
          try {
            const product = await Product.create(req.body);
            res.status(201).json(product);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.put("/api/products/:id", adminMiddleware, requireDb, async (req, res) => {
          try {
            const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(product);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        // ── Scoops ───────────────────────────────────────────────────────────
        app.get("/api/scoops", requireDb, async (_req, res) => {
          try {
            const scoops = await ScoopConfig.find({ isActive: true });
            res.json(scoops);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.put("/api/scoops/:id", adminMiddleware, requireDb, async (req, res) => {
          try {
            const scoop = await ScoopConfig.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(scoop);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        // ── Scoop Item Mappings ───────────────────────────────────────────────
        app.get("/api/scoop-mappings/:scoopId", requireDb, async (req, res) => {
          try {
            const mappings = await ScoopItemMapping.find({ scoopId: req.params.scoopId }).populate("productId");
            res.json(mappings);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.post("/api/scoop-mappings", adminMiddleware, requireDb, async (req, res) => {
          try {
            const mapping = await ScoopItemMapping.create(req.body);
            res.status(201).json(mapping);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.delete("/api/scoop-mappings/:id", adminMiddleware, requireDb, async (req, res) => {
          try {
            await ScoopItemMapping.findByIdAndDelete(req.params.id);
            res.json({ success: true });
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        // ── Video Config ─────────────────────────────────────────────────────
        app.get("/api/video/config", async (_req, res) => {
          if (!dbConnected) return res.json({ minimumLeadDays: 5, bookingWindowDays: 30, maxBookingsPerDay: 2, reservationTimeoutMinutes: 15 });
          try {
            let config = await VideoConfig.findOne();
            if (!config) config = await VideoConfig.create({});
            res.json(config);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.put("/api/video/config", adminMiddleware, requireDb, async (req, res) => {
          try {
            const config = await VideoConfig.findOneAndUpdate({}, req.body, { new: true, upsert: true });
            res.json(config);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        // ── Video Slots ───────────────────────────────────────────────────────
        app.get("/api/video/slots", requireDb, async (req, res) => {
          try {
            const { from, to } = req.query as { from: string; to: string };
            const query: any = {};
            if (from && to) query.date = { $gte: from, $lte: to };
            const slots = await VideoSlot.find(query).sort({ date: 1, startTime: 1 });
            res.json(slots);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.post("/api/video/slots", adminMiddleware, requireDb, async (req, res) => {
          try {
            const slot = await VideoSlot.create(req.body);
            res.status(201).json(slot);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.put("/api/video/slots/:id", adminMiddleware, requireDb, async (req, res) => {
          try {
            const slot = await VideoSlot.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(slot);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.delete("/api/video/slots/:id", adminMiddleware, requireDb, async (req, res) => {
          try {
            await VideoSlot.findByIdAndDelete(req.params.id);
            res.json({ success: true });
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        // ── Orders ────────────────────────────────────────────────────────────
        app.get("/api/orders", authMiddleware, requireDb, async (req: any, res) => {
          try {
            const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
            res.json(orders);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.get("/api/admin/orders", adminMiddleware, requireDb, async (_req, res) => {
          try {
            const orders = await Order.find().sort({ createdAt: -1 });
            res.json(orders);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.post("/api/orders", authMiddleware, requireDb, async (req: any, res) => {
          try {
            const body = req.body;
            // Generate order number: LT-YYYY-NNNNN
            const year = new Date().getFullYear();
            const count = await Order.countDocuments();
            const orderNumber = `LT-${year}-${String(count + 1).padStart(5, "0")}`;

            // Calculate costs
            const packagingCost = 25;
            const paymentGatewayFee = Math.round((body.subtotal || 0) * 0.02);
            const netProfit = (body.totalAmount || 0) - (body.itemCost || 0) - packagingCost - (body.shippingCost || 60) - paymentGatewayFee - (body.discount || 0);

            const order = await Order.create({
              ...body,
              orderNumber,
              userId: req.user.id,
              packagingCost,
              paymentGatewayFee,
              netProfit,
              paymentStatus: "successful",
              orderStatus: "confirmed",
              inventoryDeducted: false,
            });

            // Auto-deduct inventory if scoop tier provided (idempotent)
            if (body.tierId && !order.inventoryDeducted) {
              const scoopConfig = await ScoopConfig.findOne({ tier: body.tierId });
              if (scoopConfig) {
                const mappings = await ScoopItemMapping.find({ scoopId: scoopConfig._id }).populate("productId");
                for (const mapping of mappings) {
                  const product = mapping.productId as any;
                  if (product) {
                    const prev = product.currentStock;
                    const next = Math.max(0, prev - mapping.quantity);
                    await Product.findByIdAndUpdate(product._id, { currentStock: next });
                    await InventoryMovement.create({
                      productId: product._id,
                      sku: product.sku,
                      type: "automatic_debit",
                      quantity: -mapping.quantity,
                      previousStock: prev,
                      newStock: next,
                      reason: `Auto debit: ${orderNumber}`,
                      referenceType: "order",
                      referenceId: String(order._id),
                    });
                  }
                }
                await Order.findByIdAndUpdate(order._id, { inventoryDeducted: true });
              }
            }

            // Confirm video slot if applicable
            if (body.videoSlotId) {
              await VideoSlot.findByIdAndUpdate(body.videoSlotId, { $inc: { bookedCount: 1 } });
              await VideoBooking.findOneAndUpdate(
                { videoSlotId: body.videoSlotId, status: "reserved", userId: req.user.id },
                { status: "confirmed", orderId: order._id, expiresAt: null },
              );
            }

            res.status(201).json({ ...order.toObject(), orderNumber });
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.put("/api/admin/orders/:id/status", adminMiddleware, requireDb, async (req, res) => {
          try {
            const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: req.body.status }, { new: true });
            res.json(order);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.put("/api/admin/orders/:id/delivery", adminMiddleware, requireDb, async (req, res) => {
          try {
            const { courierName, trackingNumber, trackingUrl } = req.body;
            const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: "shipped" }, { new: true });
            await Delivery.findOneAndUpdate(
              { orderId: req.params.id },
              { courierName, trackingNumber, trackingUrl, status: "shipped", shippedAt: new Date() },
              { upsert: true, new: true },
            );
            res.json(order);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        // ── Video slot reservation ────────────────────────────────────────────
        app.post("/api/video/reserve", authMiddleware, requireDb, async (req: any, res) => {
          try {
            const { slotId, scoopTier, videoDate } = req.body;
            const slot = await VideoSlot.findById(slotId);
            if (!slot) return res.status(404).json({ error: "Slot not found" });
            if (slot.bookedCount >= slot.maxCapacity) return res.status(409).json({ error: "Slot fully booked" });
            if (slot.status === "blocked") return res.status(409).json({ error: "Slot is blocked" });

            // Cancel any existing reservation by this user
            await VideoBooking.updateMany(
              { userId: req.user.id, status: "reserved" },
              { status: "expired" },
            );

            const config = await VideoConfig.findOne() || { reservationTimeoutMinutes: 15 };
            const expiresAt = new Date(Date.now() + (config.reservationTimeoutMinutes || 15) * 60 * 1000);

            const booking = await VideoBooking.create({
              userId: req.user.id,
              videoSlotId: slotId,
              scoopTier,
              videoDate,
              startTime: slot.startTime,
              status: "reserved",
              expiresAt,
            });

            res.json({ reservationId: booking._id, expiresAt });
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        // ── Inventory (admin) ─────────────────────────────────────────────────
        app.get("/api/admin/inventory", adminMiddleware, requireDb, async (_req, res) => {
          try {
            const products = await Product.find().sort({ name: 1 });
            res.json(products);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.post("/api/admin/inventory/add-stock", adminMiddleware, requireDb, async (req, res) => {
          try {
            const { productId, quantity, costPrice, note } = req.body;
            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ error: "Product not found" });
            const prev = product.currentStock;
            const next = prev + quantity;
            await Product.findByIdAndUpdate(productId, { currentStock: next, costPrice: costPrice || product.costPrice });
            await InventoryMovement.create({
              productId, sku: product.sku, type: "stock_entry",
              quantity, previousStock: prev, newStock: next, reason: note || "Stock entry",
            });
            res.json({ success: true, newStock: next });
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.post("/api/admin/inventory/manual-debit", adminMiddleware, requireDb, async (req, res) => {
          try {
            const { productId, quantity, reason } = req.body;
            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ error: "Product not found" });
            const prev = product.currentStock;
            const next = Math.max(0, prev - quantity);
            await Product.findByIdAndUpdate(productId, { currentStock: next });
            await InventoryMovement.create({
              productId, sku: product.sku, type: "manual_debit",
              quantity: -quantity, previousStock: prev, newStock: next, reason,
            });
            res.json({ success: true, newStock: next });
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.post("/api/admin/inventory/adjust", adminMiddleware, requireDb, async (req, res) => {
          try {
            const { productId, newQuantity, reason } = req.body;
            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ error: "Product not found" });
            const prev = product.currentStock;
            await Product.findByIdAndUpdate(productId, { currentStock: newQuantity });
            await InventoryMovement.create({
              productId, sku: product.sku, type: "adjustment",
              quantity: newQuantity - prev, previousStock: prev, newStock: newQuantity, reason,
            });
            res.json({ success: true, newStock: newQuantity });
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.get("/api/admin/inventory/:productId/movements", adminMiddleware, requireDb, async (req, res) => {
          try {
            const movements = await InventoryMovement.find({ productId: req.params.productId }).sort({ createdAt: -1 });
            res.json(movements);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        // ── Customers (admin) ────────────────────────────────────────────────
        app.get("/api/admin/customers", adminMiddleware, requireDb, async (_req, res) => {
          try {
            const users = await User.find({ role: "customer" }).select("-passwordHash").sort({ createdAt: -1 });
            res.json(users);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        // ── Payments ─────────────────────────────────────────────────────────
        app.get("/api/admin/payments", adminMiddleware, requireDb, async (_req, res) => {
          try {
            const payments = await Payment.find().sort({ createdAt: -1 });
            res.json(payments);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        // ── Dashboard stats (admin) ──────────────────────────────────────────
        app.get("/api/admin/dashboard", adminMiddleware, requireDb, async (_req, res) => {
          try {
            const today = new Date().toISOString().split("T")[0];
            const [totalOrders, todayOrders, products, videoBookings] = await Promise.all([
              Order.find({ paymentStatus: "successful" }),
              Order.find({ createdAt: { $gte: new Date(today) } }),
              Product.find(),
              VideoBooking.find({ videoDate: today, status: "confirmed" }),
            ]);

            const totalSales = totalOrders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0);
            const totalProfit = totalOrders.reduce((s: number, o: any) => s + (o.netProfit || 0), 0);
            const lowStock = products.filter((p: any) => p.currentStock > 0 && p.currentStock <= p.minimumStock);
            const outOfStock = products.filter((p: any) => p.currentStock === 0);

            res.json({
              totalSales,
              totalOrders: totalOrders.length,
              todayOrders: todayOrders.length,
              todaySales: todayOrders.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0),
              totalProfit,
              totalProducts: products.length,
              lowStockItems: lowStock.length,
              outOfStockItems: outOfStock.length,
              stockValue: products.reduce((s: number, p: any) => s + p.currentStock * p.costPrice, 0),
              todayVideoBookings: videoBookings.length,
            });
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        // ── Notifications ────────────────────────────────────────────────────
        app.get("/api/notifications", authMiddleware, requireDb, async (req: any, res) => {
          try {
            const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
            res.json(notifications);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.put("/api/notifications/:id/read", authMiddleware, requireDb, async (req, res) => {
          try {
            await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
            res.json({ success: true });
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        // ── Website Content ──────────────────────────────────────────────────
        app.get("/api/content/:section", async (req, res) => {
          if (!dbConnected) return res.json({ section: req.params.section, content: {} });
          try {
            const content = await WebsiteContent.findOne({ section: req.params.section });
            res.json(content || { section: req.params.section, content: {} });
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.put("/api/content/:section", adminMiddleware, requireDb, async (req, res) => {
          try {
            const content = await WebsiteContent.findOneAndUpdate(
              { section: req.params.section },
              { ...req.body, section: req.params.section },
              { upsert: true, new: true },
            );
            res.json(content);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        // ── FAQs ─────────────────────────────────────────────────────────────
        app.get("/api/faqs", async (_req, res) => {
          if (!dbConnected) return res.json([]);
          try {
            const faqs = await Faq.find({ isActive: true }).sort({ sortOrder: 1 });
            res.json(faqs);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.post("/api/faqs", adminMiddleware, requireDb, async (req, res) => {
          try {
            const faq = await Faq.create(req.body);
            res.status(201).json(faq);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.put("/api/faqs/:id", adminMiddleware, requireDb, async (req, res) => {
          try {
            const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(faq);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.delete("/api/faqs/:id", adminMiddleware, requireDb, async (req, res) => {
          try {
            await Faq.findByIdAndDelete(req.params.id);
            res.json({ success: true });
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        // ── Addresses ────────────────────────────────────────────────────────
        app.get("/api/addresses", authMiddleware, requireDb, async (req: any, res) => {
          try {
            const addresses = await Address.find({ userId: req.user.id });
            res.json(addresses);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.post("/api/addresses", authMiddleware, requireDb, async (req: any, res) => {
          try {
            const address = await Address.create({ ...req.body, userId: req.user.id });
            res.status(201).json(address);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.put("/api/addresses/:id", authMiddleware, requireDb, async (req: any, res) => {
          try {
            const address = await Address.findOneAndUpdate(
              { _id: req.params.id, userId: req.user.id },
              req.body, { new: true },
            );
            res.json(address);
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        app.delete("/api/addresses/:id", authMiddleware, requireDb, async (req: any, res) => {
          try {
            await Address.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
            res.json({ success: true });
          } catch (err: any) { res.status(500).json({ error: err.message }); }
        });

        // ── Mount on Vite dev server ─────────────────────────────────────────
        server.middlewares.use(app);
        console.log(`[api] LilTreats API mounted on Vite dev server (handles /api/* routes)`);

      }).catch((err: Error) => {
        console.error("[api] Failed to start API plugin:", err.message);
      });
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Vite config
// ─────────────────────────────────────────────────────────────────────────────
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/liltreats/" : "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "liltreats — mystery scoops",
        short_name: "liltreats",
        description: "Handcrafted mystery scoops. Limited weekly drops.",
        theme_color: "#6B2D3E",
        background_color: "#FBF6F0",
        display: "standalone",
        orientation: "portrait",
        start_url: ".",
        icons: [
          { src: "favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
    }),
    lilTreatsApiPlugin(),
  ],
  server: {
    host: true,
    port: 3000,
  },
}));
