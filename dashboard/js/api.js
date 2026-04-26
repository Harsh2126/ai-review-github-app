import { STATS_API } from "./config.js";

// ===== API =====
// Fetches stats and recent reviews from the backend

export const fetchStats = async () => {
  const res = await fetch(STATS_API);
  if (!res.ok) throw new Error("API error");
  return res.json(); // returns { stats, recent_reviews }
};
