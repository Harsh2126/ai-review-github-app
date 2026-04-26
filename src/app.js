import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import webhookRoutes from "./routes/webhook.js";
import dashboardRoutes from "./routes/dashboard.js";
import healthRoutes from "./routes/health.js";

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use("/webhook", express.raw({ type: "*/*" })); // raw body for webhook signature
app.use(express.json());

// ── Static Files (dashboard CSS/JS) ──────────────────────
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/dashboard", express.static(path.join(__dirname, "..", "dashboard")));

// ── Routes ─────────────────────────────────────────────────
app.use("/webhook", webhookRoutes);
app.use("/", dashboardRoutes);
app.use("/", healthRoutes);

// ── Start Server after DB connects ─────────────────────────
const PORT = parseInt(process.env.PORT || "5000");

connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.info(`AI Code Reviewer running on port ${PORT}`);
    });
  })
  .catch((e) => {
    console.error("DB connection failed:", e);
    process.exit(1);
  });
