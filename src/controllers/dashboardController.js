import path from "path";
import { fileURLToPath } from "url";
import Review from "../models/Review.js";
import Installation from "../models/Installation.js";

// __dirname not available in ES modules, so we derive it
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DASHBOARD_DIR = path.join(__dirname, "..", "..", "dashboard");

// GET /api/stats — returns total reviews, active installs, recent reviews
export const getStats = async (req, res) => {
  const [total_reviews, active_installations] = await Promise.all([
    Review.countDocuments(),
    Installation.countDocuments({ is_active: 1 }),
  ]);
  const recent_reviews = await Review.find()
    .sort({ created_at: -1 })
    .limit(20)
    .lean();

  res.json({ stats: { total_reviews, active_installations }, recent_reviews });
};

// GET / or /dashboard — serves the dashboard HTML file
export const getDashboard = (req, res) => {
  res.sendFile(path.join(DASHBOARD_DIR, "index.html"));
};

// GET /install/success — shown after GitHub App installation
export const getInstallSuccess = (req, res) => {
  res.send(`
    <html>
    <body style="font-family:sans-serif;text-align:center;padding:60px;background:#0d1117;color:#e6edf3">
      <h1>✅ Installation Successful!</h1>
      <p>AI Code Reviewer is now active on your repositories.</p>
      <a href="/dashboard" style="color:#58a6ff">Go to Dashboard →</a>
    </body>
    </html>
  `);
};
