import { APP_NAME, REFRESH_INTERVAL } from "./config.js";
import { fetchStats } from "./api.js";
import { updateStats } from "./render.js";

// ===== INIT: Set install button URL =====
document.getElementById("install-btn").href =
  `https://github.com/apps/${APP_NAME}/installations/new`;

// ===== LOAD DASHBOARD: Fetch stats and update UI =====
const loadDashboard = async () => {
  try {
    const data = await fetchStats();
    updateStats(data.stats);
  } catch (err) {
    console.error("Failed to load stats:", err);
  }
};

// ===== START: Load on open + auto-refresh every 30s =====
loadDashboard();
setInterval(loadDashboard, REFRESH_INTERVAL);
