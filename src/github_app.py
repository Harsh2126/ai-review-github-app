import os
import time
import jwt
import requests
import hashlib
import hmac
from github import Github


class GitHubAppAuth:
    def __init__(self):
        self.app_id = os.getenv("GITHUB_APP_ID")
        self.webhook_secret = os.getenv("GITHUB_WEBHOOK_SECRET", "")
        raw_key = os.getenv("GITHUB_APP_PRIVATE_KEY", "")
        self.private_key = raw_key.replace("\\n", "\n")

    def generate_jwt(self):
        now = int(time.time())
        payload = {"iat": now - 60, "exp": now + 540, "iss": self.app_id}
        return jwt.encode(payload, self.private_key, algorithm="RS256")

    def get_installation_token(self, installation_id):
        token = self.generate_jwt()
        url = f"https://api.github.com/app/installations/{installation_id}/access_tokens"
        resp = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
            },
        )
        resp.raise_for_status()
        return resp.json()["token"]

    def get_pr_diff(self, repo_name, pr_number, token):
        url = f"https://api.github.com/repos/{repo_name}/pulls/{pr_number}"
        resp = requests.get(
            url,
            headers={
                "Authorization": f"token {token}",
                "Accept": "application/vnd.github.v3.diff",
            },
        )
        resp.raise_for_status()
        return resp.text

    def post_review_comment(self, repo_name, pr_number, review_body, token):
        g = Github(token)
        repo = g.get_repo(repo_name)
        pr = repo.get_pull(pr_number)
        pr.create_issue_comment(review_body)

    def verify_webhook_signature(self, payload: bytes, signature: str) -> bool:
        if not signature or not self.webhook_secret:
            return False
        mac = hmac.new(self.webhook_secret.encode(), payload, hashlib.sha256)
        expected = "sha256=" + mac.hexdigest()
        return hmac.compare_digest(expected, signature)
