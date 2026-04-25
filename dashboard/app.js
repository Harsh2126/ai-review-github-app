const APP_ID = "harsh-codelens-ai";

document.getElementById("install-btn").href =
  `https://github.com/apps/${APP_ID}/installations/new`;

async function loadDashboard() {
  try {
    const res = await fetch("/api/stats");
    if (!res.ok) throw new Error("API error");
    const data = await res.json();

    document.getElementById("total-reviews").textContent =
      data.stats.total_reviews ?? 0;
    document.getElementById("active-installs").textContent =
      data.stats.active_installations ?? 0;

    renderReviews(data.recent_reviews || []);
  } catch (err) {
    document.getElementById("reviews-list").innerHTML =
      `<p class="empty">⚠️ Could not load data. Is the server running?</p>`;
  }
}

function renderReviews(reviews) {
  const container = document.getElementById("reviews-list");
  if (!reviews.length) {
    container.innerHTML = `<p class="empty">No reviews yet. Open a Pull Request to get started!</p>`;
    return;
  }

  container.innerHTML = reviews.map(r => {
    const severity = (r.severity || "low").toLowerCase();
    const badgeClass = `badge-${["low","medium","high"].includes(severity) ? severity : "low"}`;
    const date = r.created_at ? new Date(r.created_at).toLocaleString() : "—";
    return `
      <div class="review-card">
        <div>
          <div class="review-repo">📁 ${escHtml(r.repo_name)} — PR #${r.pr_number}</div>
          <div class="review-meta">${date}</div>
        </div>
        <div style="text-align:right">
          <div class="score">${escHtml(r.score || "N/A")}</div>
          <span class="badge ${badgeClass}">${severity.toUpperCase()}</span>
        </div>
      </div>`;
  }).join("");
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

loadDashboard();
setInterval(loadDashboard, 30000);
