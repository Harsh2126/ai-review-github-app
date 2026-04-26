import { Router } from "express";

const router = Router();

// Health check — used by Render/Railway to verify app is running
router.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "ai-code-reviewer" });
});

export default router;
