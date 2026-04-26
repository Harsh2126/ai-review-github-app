const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  repo_name: { type: String, required: true },
  pr_number: { type: Number, required: true },
  review_text: { type: String },
  score: { type: String },
  severity: { type: String, enum: ["low", "medium", "high"], default: "low" },
  created_at: { type: String, default: () => new Date().toISOString() },
});

module.exports = mongoose.model("Review", reviewSchema);
