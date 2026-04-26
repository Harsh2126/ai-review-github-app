import jwt from "jsonwebtoken";
import { Octokit } from "@octokit/rest";

class GitHubService {
  constructor() {
    this.appId = process.env.GITHUB_APP_ID;
    this.privateKey = (process.env.GITHUB_APP_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  }

  generateJwt() {
    const now = Math.floor(Date.now() / 1000);
    return jwt.sign({ iat: now - 60, exp: now + 540, iss: this.appId }, this.privateKey, { algorithm: "RS256" });
  }

  async getInstallationToken(installationId) {
    const octokit = new Octokit({ auth: `Bearer ${this.generateJwt()}` });
    const { data } = await octokit.request("POST /app/installations/{installation_id}/access_tokens", {
      installation_id: installationId,
    });
    return data.token;
  }

  async getPrDiff(repoName, prNumber, token) {
    const [owner, repo] = repoName.split("/");
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
      owner, repo, pull_number: prNumber,
      headers: { accept: "application/vnd.github.v3.diff" },
    });
    return typeof data === "string" ? data : JSON.stringify(data);
  }

  async postReviewComment(repoName, prNumber, body, token) {
    const [owner, repo] = repoName.split("/");
    const octokit = new Octokit({ auth: token });
    await octokit.issues.createComment({ owner, repo, issue_number: prNumber, body });
  }
}

export default new GitHubService();
