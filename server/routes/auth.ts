import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken, requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role: "customer",
    });
    const token = signToken({ userId: String(user._id), role: "customer" });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error("[auth/signup]", err);
    res.status(500).json({ error: "Could not create account." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({ error: "No account found with that email." });
      return;
    }
    if (user.status === "suspended") {
      res.status(403).json({ error: "Your account has been suspended. Contact support." });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Incorrect password." });
      return;
    }
    user.lastLoginAt = new Date();
    await user.save();
    const token = signToken({ userId: String(user._id), role: user.role });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    });
  } catch (err) {
    console.error("[auth/login]", err);
    res.status(500).json({ error: "Login failed." });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user!.userId).select("-passwordHash");
    if (!user) { res.status(404).json({ error: "User not found." }); return; }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch profile." });
  }
});

// PATCH /api/auth/me
router.patch("/me", requireAuth, async (req, res) => {
  try {
    const { name, phone, instagram } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { $set: { name, phone, instagram } },
      { new: true, select: "-passwordHash" },
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Could not update profile." });
  }
});

// POST /api/auth/forgot-password  (sends reset link — placeholder for V1)
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  // In V1 we just confirm the email exists; actual email sending needs an email provider
  const user = await User.findOne({ email: email?.toLowerCase().trim() });
  // Return success regardless (security: don't reveal if email exists)
  res.json({ message: "If an account exists with that email, a reset link has been sent." });
  if (user) {
    console.log(`[auth] Password reset requested for ${user.email}`);
  }
});

export default router;
