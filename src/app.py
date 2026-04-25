import os
import logging
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

import database as db
from github_app import GitHubAppAuth
from webhook_handler import WebhookHandler

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder="../dashboard")
CORS(app)

db.init_db()
auth = GitHubAppAuth()
handler = WebhookHandler()

DASHBOARD_DIR = os.path.join(os.path.dirname(__file__), "..", "dashboard")


@app.route("/webhook", methods=["POST"])
def webhook():
    payload_bytes = request.get_data()
    signature = request.headers.get("X-Hub-Signature-256", "")

    if not auth.verify_webhook_signature(payload_bytes, signature):
        logger.warning("Invalid webhook signature")
        return jsonify({"error": "Invalid signature"}), 401

    event = request.headers.get("X-GitHub-Event", "")
    payload = request.get_json(force=True, silent=True) or {}

    try:
        handler.handle(event, payload)
    except Exception as e:
        logger.error(f"Webhook handling error: {e}", exc_info=True)
        return jsonify({"error": "Internal error"}), 500

    return jsonify({"status": "ok"}), 200


@app.route("/api/stats")
def api_stats():
    stats = db.get_stats()
    reviews = db.get_recent_reviews(20)
    return jsonify({"stats": stats, "recent_reviews": reviews})


@app.route("/install/success")
def install_success():
    return """
    <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0d1117;color:#e6edf3">
    <h1>✅ Installation Successful!</h1>
    <p>AI Code Reviewer is now active on your repositories.</p>
    <p>Open a Pull Request to see it in action.</p>
    <a href="/dashboard" style="color:#58a6ff">Go to Dashboard →</a>
    </body></html>
    """


@app.route("/dashboard")
@app.route("/dashboard/")
def dashboard():
    return send_from_directory(DASHBOARD_DIR, "index.html")


@app.route("/dashboard/<path:filename>")
def dashboard_static(filename):
    return send_from_directory(DASHBOARD_DIR, filename)


@app.route("/")
def index():
    return dashboard()


@app.route("/health")
def health():
    return jsonify({"status": "healthy", "service": "ai-code-reviewer"}), 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "production") == "development"
    logger.info(f"Starting AI Code Reviewer on port {port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
