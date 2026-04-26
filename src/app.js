require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./database");
const GitHubAppAuth = require("./github_app");
const WebhookHandler = require("./webhook_handler");

const app = express();
const auth = new GitHubAppAuth();
const handler = new WebhookHandler();
const DASHBOARD_DIR = path.join(__dirname, "..", "dashboard");

const PORT = parseInt(process.env.PORT || "5000");

// Raw body for webhook signature verification
app.use("/webhook", express.raw({ type: "*/*" }));
app.use(express.json());

app.post("/webhook", async (req, res) => {
  const signature = req.headers["x-hub-signature-256"] || "";
  if (!auth.verifyWebhookSignature(req.body, signature)) {
    console.warn("Invalid webhook signature");
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = req.headers["x-github-event"] || "";
  let payload;
  try {
    payload = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  try {
    await handler.handle(event, payload);
  } catch (e) {
    console.error("Webhook handling error:", e);
    return res.status(500).json({ error: "Internal error" });
  }

  res.json({ status: "ok" });
});

app.get("/api/stats", async (req, res) => {
  const stats = await db.getStats();
  const reviews = await db.getRecentReviews(20);
  res.json({ stats, recent_reviews: reviews });
});

app.get("/install/success", (req, res) => {
  res.send(`
    <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0d1117;color:#e6edf3">
    <h1>✅ Installation Successful!</h1>
    <p>AI Code Reviewer is now active on your repositories.</p>
    <p>Open a Pull Request to see it in action.</p>
    <a href="/dashboard" style="color:#58a6ff">Go to Dashboard →</a>
    </body></html>
  `);
});

app.get(["/", "/dashboard", "/dashboard/"], (req, res) => {
  res.sendFile(path.join(DASHBOARD_DIR, "index.html"));
});

app.use("/dashboard", express.static(DASHBOARD_DIR));

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "ai-code-reviewer" });
});

db.initDb().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.info(`Starting AI Code Reviewer on port ${PORT}`);
  });
}).catch((e) => { console.error("DB init failed:", e); process.exit(1); });
