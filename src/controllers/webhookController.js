import githubService from "../services/githubService.js";
import reviewerService from "../services/reviewerService.js";
import Installation from "../models/Installation.js";
import Review from "../models/Review.js";
import Usage from "../models/Usage.js";

const handleInstallation = async (payload) => {
  const { action, installation } = payload;
  const { id: installationId, account: { login: username } } = installation;

  if (action === "created") {
    await Installation.findOneAndUpdate(
      { installation_id: installationId },
      { github_username: username, installation_id: installationId, created_at: new Date().toISOString(), is_active: 1 },
      { upsert: true }
    );
    console.info(`Installation saved: ${username} (${installationId})`);
  } else if (action === "deleted") {
    await Installation.updateOne({ installation_id: installationId }, { is_active: 0 });
    console.info(`Installation deactivated: ${installationId}`);
  }
};

const handlePullRequest = async (payload) => {
  const repoName = payload.repository.full_name;
  const prNumber = payload.pull_request.number;
  const installationId = payload.installation.id;

  console.info(`Reviewing PR #${prNumber} in ${repoName}`);

  try {
    const token = await githubService.getInstallationToken(installationId);
    const diff = await githubService.getPrDiff(repoName, prNumber, token);

    if (!diff || !diff.trim()) {
      console.warn(`Empty diff for PR #${prNumber}`);
      return;
    }

    const review = await reviewerService.review(diff);
    const comment = reviewerService.formatComment(review);

    await githubService.postReviewComment(repoName, prNumber, comment, token);

    await Review.create({
      repo_name: repoName, pr_number: prNumber,
      review_text: comment, score: review.score || "N/A",
      severity: review.severity || "low", created_at: new Date().toISOString(),
    });

    const month = new Date().toISOString().slice(0, 7);
    await Usage.findOneAndUpdate(
      { installation_id: installationId, month },
      { $inc: { pr_count: 1 } },
      { upsert: true }
    );

    console.info(`Review posted for PR #${prNumber} in ${repoName}`);
  } catch (e) {
    console.error(`Failed to review PR #${prNumber} in ${repoName}: ${e.message}`);
  }
};

export const webhookController = async (req, res) => {
  const event = req.headers["x-github-event"] || "";
  let payload;

  try {
    payload = JSON.parse(req.body.toString());
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (event === "installation") {
    await handleInstallation(payload);
  } else if (event === "pull_request") {
    if (["opened", "synchronize", "reopened"].includes(payload.action)) {
      await handlePullRequest(payload);
    }
  }

  res.json({ status: "ok" });
};
