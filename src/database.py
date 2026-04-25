import sqlite3
import os
from datetime import datetime

DB_PATH = os.getenv("DB_PATH", "reviews.db")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS installations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                github_username TEXT NOT NULL,
                installation_id INTEGER UNIQUE NOT NULL,
                created_at TEXT NOT NULL,
                is_active INTEGER DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                repo_name TEXT NOT NULL,
                pr_number INTEGER NOT NULL,
                review_text TEXT,
                score TEXT,
                severity TEXT,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS usage (
                installation_id INTEGER NOT NULL,
                month TEXT NOT NULL,
                pr_count INTEGER DEFAULT 0,
                PRIMARY KEY (installation_id, month)
            );
        """)


def save_installation(github_username: str, installation_id: int):
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO installations (github_username, installation_id, created_at, is_active)
               VALUES (?, ?, ?, 1)
               ON CONFLICT(installation_id) DO UPDATE SET is_active=1""",
            (github_username, installation_id, datetime.utcnow().isoformat()),
        )


def deactivate_installation(installation_id: int):
    with get_conn() as conn:
        conn.execute(
            "UPDATE installations SET is_active=0 WHERE installation_id=?",
            (installation_id,),
        )


def get_installation(installation_id: int):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM installations WHERE installation_id=?", (installation_id,)
        ).fetchone()
        return dict(row) if row else None


def save_review(repo_name: str, pr_number: int, review_text: str, score: str, severity: str):
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO reviews (repo_name, pr_number, review_text, score, severity, created_at) VALUES (?,?,?,?,?,?)",
            (repo_name, pr_number, review_text, score, severity, datetime.utcnow().isoformat()),
        )


def get_recent_reviews(limit: int = 20):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM reviews ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        return [dict(r) for r in rows]


def get_stats():
    with get_conn() as conn:
        total = conn.execute("SELECT COUNT(*) FROM reviews").fetchone()[0]
        installs = conn.execute("SELECT COUNT(*) FROM installations WHERE is_active=1").fetchone()[0]
        return {"total_reviews": total, "active_installations": installs}


def increment_usage(installation_id: int):
    month = datetime.utcnow().strftime("%Y-%m")
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO usage (installation_id, month, pr_count) VALUES (?,?,1)
               ON CONFLICT(installation_id, month) DO UPDATE SET pr_count=pr_count+1""",
            (installation_id, month),
        )


def get_usage_count(installation_id: int) -> int:
    month = datetime.utcnow().strftime("%Y-%m")
    with get_conn() as conn:
        row = conn.execute(
            "SELECT pr_count FROM usage WHERE installation_id=? AND month=?",
            (installation_id, month),
        ).fetchone()
        return row[0] if row else 0
