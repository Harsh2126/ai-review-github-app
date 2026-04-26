const mongoose = require("mongoose");

const installationSchema = new mongoose.Schema({
  github_username: { type: String, required: true },
  installation_id: { type: Number, unique: true, required: true },
  created_at: { type: String, default: () => new Date().toISOString() },
  is_active: { type: Number, default: 1 },
});

module.exports = mongoose.model("Installation", installationSchema);
