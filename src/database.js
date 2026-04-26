const mongoose = require("mongoose");
const Installation = require("./models/Installation");
const Review = require("./models/Review");
const Usage = require("./models/Usage");

async function initDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.info("MongoDB connected");
}

async function saveInstallation(githubUsername, installationId) {
  await Installation.findOneAndUpdate(
    { installation_id: installationId },
    { github_username: githubUsername, installation_id: installationId, created_at: new Date().toISOString(), is_active: 1 },
    { upsert: true }
  );
}

async function deactivateInstallation(installationId) {
  await Installation.updateOne({ installation_id: installationId }, { is_active: 0 });
}

async function getInstallation(installationId) {
  return Installation.findOne({ installation_id: installationId }).lean();
}

async function saveReview(repoName, prNumber, reviewText, score, severity) {
  await Review.create({ repo_name: repoName, pr_number: prNumber, review_text: reviewText, score, severity, created_at: new Date().toISOString() });
}

async function getRecentReviews(limit = 20) {
  return Review.find().sort({ created_at: -1 }).limit(limit).lean();
}

async function getStats() {
  const [totalReviews, activeInstallations] = await Promise.all([
    Review.countDocuments(),
    Installation.countDocuments({ is_active: 1 }),
  ]);
  return { total_reviews: totalReviews, active_installations: activeInstallations };
}

async function incrementUsage(installationId) {
  const month = new Date().toISOString().slice(0, 7);
  await Usage.findOneAndUpdate(
    { installation_id: installationId, month },
    { $inc: { pr_count: 1 } },
    { upsert: true }
  );
}

async function getUsageCount(installationId) {
  const month = new Date().toISOString().slice(0, 7);
  const row = await Usage.findOne({ installation_id: installationId, month }).lean();
  return row ? row.pr_count : 0;
}

module.exports = { initDb, saveInstallation, deactivateInstallation, getInstallation, saveReview, getRecentReviews, getStats, incrementUsage, getUsageCount };
