// ===== CONFIG =====
// GitHub App name — used to build the install URL
const APP_NAME = "harsh-codelens-ai";

// Auto-refresh interval (30 seconds)
const REFRESH_INTERVAL = 30000;


// ===== INIT: Set install button URL =====
document.getElementById("install-btn").href =
  `https://github.com/apps/${APP_NAME}/installations/new`;


// ===== MAIN: Fetch stats + reviews from API =====
async function loadDashboard() {
  try {
    const res = await fetch("/api/stats");
    if (!res.ok) throw new Error("API error");

    const data = await res.json();

    // Update stat counters
    updateStats(data.stats);

    // Render recent reviews list
    renderReviews(data.recent_reviews || []);

  } catch (err) {
    // Show error message if API call fails
    document.getElementById("reviews-list").innerHTML =
      `<p class="empty">⚠️ Could not load data. Is the server running?</p>`;
  }
}


// ===== UPDATE STATS: Fill in the stat card numbers =====
function updateStats(stats) {
  document.getElementById("total-reviews").textContent = stats.total_reviews ?? 0;
  document.getElementById("active-installs").textContent = stats.active_installations ?? 0;
}


// ===== RENDER REVIEWS: Build HTML for each review card =====
function renderReviews(reviews) {
  const container = document.getElementById("reviews-list");

  // Show empty state if no reviews yet
  if (!reviews.length) {
    container.innerHTML = `<p class="empty">No reviews yet. Open a Pull Request to get started!</p>`;
    return;
  }

  // Build a card for each review
  container.innerHTML = reviews.map(review => buildReviewCard(review)).join("");
}


// ===== BUILD REVIEW CARD: Returns HTML string for one review =====
function buildReviewCard(review) {
  // Normalize severity to lowercase, fallback to "low"
  const severity = (review.severity || "low").toLowerCase();
  const badgeClass = ["low", "medium", "high"].includes(severity)
    ? `badge-${severity}`
    : "badge-low";

  // Format date or show dash if missing
  const date = review.created_at
    ? new Date(review.created_at).toLocaleString()
    : "—";

  return `
    <div class="review-card">

      <!-- Left: Repo name + PR number + date -->
      <div>
        <div class="review-repo">📁 ${escHtml(review.repo_name)} — PR #${review.pr_number}</div>
        <div class="review-meta">${date}</div>
      </div>

      <!-- Right: Score + Severity badge -->
      <div style="text-align:right">
        <div class="score">${escHtml(review.score || "N/A")}</div>
        <span class="badge ${badgeClass}">${severity.toUpperCase()}</span>
      </div>

    </div>`;
}


// ===== HELPER: Escape HTML to prevent XSS =====
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


// ===== START: Load on page open + auto-refresh every 30s =====
loadDashboard();
setInterval(loadDashboard, REFRESH_INTERVAL);
