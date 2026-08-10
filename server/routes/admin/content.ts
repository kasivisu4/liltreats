import { Router } from "express";
import { WebsiteContent } from "../../models/WebsiteContent.js";
import { Faq } from "../../models/Faq.js";
import { requireAdmin } from "../../middleware/auth.js";

const router = Router();

// ── Website Content ───────────────────────────────────────────────────────────

// GET /api/admin/content/:section  — public
router.get("/:section", async (req, res) => {
  try {
    const content = await WebsiteContent.findOne({ section: req.params.section }).lean();
    res.json({ content: content ?? null });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch content." });
  }
});

// GET /api/admin/content  — admin: all sections
router.get("/", requireAdmin, async (_req, res) => {
  try {
    const content = await WebsiteContent.find({}).lean();
    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch content." });
  }
});

// PUT /api/admin/content/:section  — admin: upsert a section
router.put("/:section", requireAdmin, async (req, res) => {
  try {
    const { content: contentData, images, isActive } = req.body;
    const doc = await WebsiteContent.findOneAndUpdate(
      { section: req.params.section },
      {
        $set: {
          content: contentData,
          images: images ?? [],
          isActive: isActive ?? true,
          updatedBy: req.user!.userId,
        },
      },
      { upsert: true, new: true },
    );
    res.json({ content: doc });
  } catch (err) {
    res.status(500).json({ error: "Could not update content." });
  }
});

// ── FAQs ──────────────────────────────────────────────────────────────────────

// GET /api/admin/content/faqs  — public
router.get("/faqs/list", async (_req, res) => {
  try {
    const faqs = await Faq.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    res.json({ faqs });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch FAQs." });
  }
});

// GET /api/admin/content/faqs/all  — admin: all including inactive
router.get("/faqs/all", requireAdmin, async (_req, res) => {
  try {
    const faqs = await Faq.find({}).sort({ sortOrder: 1 }).lean();
    res.json({ faqs });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch FAQs." });
  }
});

// POST /api/admin/content/faqs  — admin
router.post("/faqs", requireAdmin, async (req, res) => {
  try {
    const { question, answer, sortOrder } = req.body;
    if (!question || !answer) {
      res.status(400).json({ error: "question and answer are required." });
      return;
    }
    const faq = await Faq.create({ question, answer, sortOrder: sortOrder ?? 0 });
    res.status(201).json({ faq });
  } catch (err) {
    res.status(500).json({ error: "Could not create FAQ." });
  }
});

// PUT /api/admin/content/faqs/:id  — admin
router.put("/faqs/:id", requireAdmin, async (req, res) => {
  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!faq) { res.status(404).json({ error: "FAQ not found." }); return; }
    res.json({ faq });
  } catch (err) {
    res.status(500).json({ error: "Could not update FAQ." });
  }
});

// DELETE /api/admin/content/faqs/:id  — admin
router.delete("/faqs/:id", requireAdmin, async (req, res) => {
  try {
    await Faq.findByIdAndDelete(req.params.id);
    res.json({ message: "FAQ deleted." });
  } catch (err) {
    res.status(500).json({ error: "Could not delete FAQ." });
  }
});

export default router;
