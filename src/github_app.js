const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Octokit } = require("@octokit/rest");

class GitHubAppAuth {
  constructor() {
    this.appId = process.env.GITHUB_APP_ID;
    this.webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || "";
    const rawKey = process.env.GITHUB_APP_PRIVATE_KEY || "";
    this.privateKey = rawKey.replace(/\\n/g, "\n");
  }

  generateJwt() {
    const now = Math.floor(Date.now() / 1000);
    const payload = { iat: now - 60, exp: now + 540, iss: this.appId };
    return jwt.sign(payload, this.privateKey, { algorithm: "RS256" });
  }

  async getInstallationToken(installationId) {
    const token = this.generateJwt();
    const octokit = new Octokit({ auth: `Bearer ${token}` });
    const { data } = await octokit.request("POST /app/installations/{installation_id}/access_tokens", {
      installation_id: installationId,
    });
    return data.token;
  }

  async getPrDiff(repoName, prNumber, token) {
    const [owner, repo] = repoName.split("/");
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
      owner,
      repo,
      pull_number: prNumber,
      headers: { accept: "application/vnd.github.v3.diff" },
    });
    return typeof data === "string" ? data : JSON.stringify(data);
  }

  async postReviewComment(repoName, prNumber, reviewBody, token) {
    const [owner, repo] = repoName.split("/");
    const octokit = new Octokit({ auth: token });
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: reviewBody,
    });
  }

  verifyWebhookSignature(payload, signature) {
    if (!signature || !this.webhookSecret) return false;
    const mac = crypto.createHmac("sha256", this.webhookSecret).update(payload).digest("hex");
    const expected = `sha256=${mac}`;
    try {
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    } catch {
      return false;
    }
  }
}

module.exports = GitHubAppAuth;
