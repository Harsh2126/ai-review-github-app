import { escHtml, formatDate } from "./utils.js";

// ===== RENDER =====
// All functions that build and inject HTML into the DOM

// Updates the stat counter cards (PRs Reviewed, Active Installations)
export const updateStats = (stats) => {
  document.getElementById("total-reviews").textContent = stats.total_reviews ?? 0;
  document.getElementById("active-installs").textContent = stats.active_installations ?? 0;
};

// Renders the full list of recent reviews
export const renderReviews = (reviews) => {
  const container = document.getElementById("reviews-list");

  // Show empty state if no reviews exist yet
  if (!reviews.length) {
    container.innerHTML = `<p class="empty">No reviews yet. Open a Pull Request to get started!</p>`;
    return;
  }

  // Build and inject all review cards
  container.innerHTML = reviews.map(buildReviewCard).join("");
};

// Builds HTML string for a single review card
const buildReviewCard = (review) => {
  // Normalize severity, fallback to "low"
  const severity = (review.severity || "low").toLowerCase();
  const badgeClass = ["low", "medium", "high"].includes(severity)
    ? `badge-${severity}`
    : "badge-low";

  return `
    <div class="review-card">

      <!-- Left: Repo name + PR number + date -->
      <div>
        <div class="review-repo">
          📁 ${escHtml(review.repo_name)} — PR #${review.pr_number}
        </div>
        <div class="review-meta">${formatDate(review.created_at)}</div>
      </div>

      <!-- Right: Score + Severity badge -->
      <div style="text-align:right">
        <div class="score">${escHtml(review.score || "N/A")}</div>
        <span class="badge ${badgeClass}">${severity.toUpperCase()}</span>
      </div>

    </div>`;
};
