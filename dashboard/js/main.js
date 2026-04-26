import { APP_NAME, REFRESH_INTERVAL } from "./config.js";
import { fetchStats } from "./api.js";
import { updateStats, renderReviews } from "./render.js";

// ===== INIT =====
// Set the GitHub App install button URL
document.getElementById("install-btn").href =
  `https://github.com/apps/${APP_NAME}/installations/new`;


// ===== LOAD DASHBOARD =====
// Fetches data from API and updates the UI
const loadDashboard = async () => {
  try {
    const data = await fetchStats();
    updateStats(data.stats);
    renderReviews(data.recent_reviews || []);
  } catch (err) {
    // Show error state if API call fails
    document.getElementById("reviews-list").innerHTML =
      `<p class="empty">⚠️ Could not load data. Is the server running?</p>`;
  }
};


// ===== START =====
// Load immediately on page open, then auto-refresh every 30s
loadDashboard();
setInterval(loadDashboard, REFRESH_INTERVAL);
