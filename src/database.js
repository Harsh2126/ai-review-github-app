const mongoose = require("mongoose");

async function initDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.info("MongoDB connected");
}

const installationSchema = new mongoose.Schema({
  github_username: String,
  installation_id: { type: Number, unique: true },
  created_at: String,
  is_active: { type: Number, default: 1 },
});

const reviewSchema = new mongoose.Schema({
  repo_name: String,
  pr_number: Number,
  review_text: String,
  score: String,
  severity: String,
  created_at: String,
});

const usageSchema = new mongoose.Schema({
  installation_id: Number,
  month: String,
  pr_count: { type: Number, default: 0 },
});
usageSchema.index({ installation_id: 1, month: 1 }, { unique: true });

const Installation = mongoose.model("Installation", installationSchema);
const Review = mongoose.model("Review", reviewSchema);
const Usage = mongoose.model("Usage", usageSchema);

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
