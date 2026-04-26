// ===== RENDER =====
// Updates stat counter cards in the DOM

export const updateStats = (stats) => {
  document.getElementById("total-reviews").textContent = stats.total_reviews ?? 0;
  document.getElementById("active-installs").textContent = stats.active_installations ?? 0;
};
