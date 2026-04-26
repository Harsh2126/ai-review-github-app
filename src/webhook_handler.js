const GitHubAppAuth = require("./github_app");
const AIReviewer = require("./reviewer");
const db = require("./database");

const logger = console;

class WebhookHandler {
  constructor() {
    this.auth = new GitHubAppAuth();
    this.reviewer = new AIReviewer();
  }

  async handle(event, payload) {
    if (event === "installation") {
      await this._handleInstallation(payload);
    } else if (event === "pull_request") {
      const action = payload.action || "";
      if (["opened", "synchronize", "reopened"].includes(action)) {
        await this._handlePullRequest(payload);
      }
    }
  }

  async _handleInstallation(payload) {
    const action = payload.action;
    const installationId = payload.installation.id;
    const username = payload.installation.account.login;

    if (action === "created") {
      db.saveInstallation(username, installationId);
      logger.info(`Installation saved: ${username} (${installationId})`);
    } else if (action === "deleted") {
      db.deactivateInstallation(installationId);
      logger.info(`Installation deactivated: ${installationId}`);
    }
  }

  async _handlePullRequest(payload) {
    const repoName = payload.repository.full_name;
    const prNumber = payload.pull_request.number;
    const installationId = payload.installation.id;

    logger.info(`Reviewing PR #${prNumber} in ${repoName}`);

    try {
      const token = await this.auth.getInstallationToken(installationId);
      const diff = await this.auth.getPrDiff(repoName, prNumber, token);

      if (!diff || !diff.trim()) {
        logger.warn(`Empty diff for PR #${prNumber}`);
        return;
      }

      const review = await this.reviewer.review(diff);
      const comment = this.reviewer.formatComment(review);

      await this.auth.postReviewComment(repoName, prNumber, comment, token);

      db.saveReview(repoName, prNumber, comment, review.score || "N/A", review.severity || "low");
      db.incrementUsage(installationId);
      logger.info(`Review posted for PR #${prNumber} in ${repoName}`);
    } catch (e) {
      logger.error(`Failed to review PR #${prNumber} in ${repoName}: ${e.message}`, e);
    }
  }
}

module.exports = WebhookHandler;
