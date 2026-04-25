import logging
from github_app import GitHubAppAuth
from reviewer import AIReviewer
import database as db

logger = logging.getLogger(__name__)


class WebhookHandler:
    def __init__(self):
        self.auth = GitHubAppAuth()
        self.reviewer = AIReviewer()

    def handle(self, event: str, payload: dict):
        if event == "installation":
            self._handle_installation(payload)
        elif event == "pull_request":
            action = payload.get("action", "")
            if action in ("opened", "synchronize", "reopened"):
                self._handle_pull_request(payload)

    def _handle_installation(self, payload: dict):
        action = payload.get("action")
        installation_id = payload["installation"]["id"]
        username = payload["installation"]["account"]["login"]

        if action == "created":
            db.save_installation(username, installation_id)
            logger.info(f"Installation saved: {username} ({installation_id})")
        elif action == "deleted":
            db.deactivate_installation(installation_id)
            logger.info(f"Installation deactivated: {installation_id}")

    def _handle_pull_request(self, payload: dict):
        repo_name = payload["repository"]["full_name"]
        pr_number = payload["pull_request"]["number"]
        installation_id = payload["installation"]["id"]

        logger.info(f"Reviewing PR #{pr_number} in {repo_name}")

        try:
            token = self.auth.get_installation_token(installation_id)
            diff = self.auth.get_pr_diff(repo_name, pr_number, token)

            if not diff or not diff.strip():
                logger.warning(f"Empty diff for PR #{pr_number}")
                return

            review = self.reviewer.review(diff)
            comment = self.reviewer.format_comment(review)

            self.auth.post_review_comment(repo_name, pr_number, comment, token)

            db.save_review(
                repo_name,
                pr_number,
                comment,
                review.get("score", "N/A"),
                review.get("severity", "low"),
            )
            db.increment_usage(installation_id)
            logger.info(f"Review posted for PR #{pr_number} in {repo_name}")

        except Exception as e:
            logger.error(f"Failed to review PR #{pr_number} in {repo_name}: {e}", exc_info=True)
