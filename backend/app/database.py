"""
Lightweight SQLite persistence layer. One file-backed DB, fine for a
portfolio-scale demo. Swap DB_PATH for a Postgres connection string +
psycopg/SQLAlchemy later if traffic grows; the query surface here is small
on purpose.
"""
import json
import os
import sqlite3
import threading
from contextlib import contextmanager
from datetime import datetime, timezone

DB_PATH = os.environ.get(
    "VERINEWS_DB_PATH",
    os.path.join(os.path.dirname(__file__), "..", "data", "verinews.db"),
)

_lock = threading.Lock()


def init_db():
    os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS predictions (
                request_id TEXT PRIMARY KEY,
                input_preview TEXT NOT NULL,
                label TEXT NOT NULL,
                confidence REAL NOT NULL,
                word_count INTEGER NOT NULL,
                top_fake_words TEXT,
                top_real_words TEXT,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.commit()


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def insert_prediction(result: dict, input_text: str):
    preview = input_text.strip().replace("\n", " ")[:160]
    with _lock, get_conn() as conn:
        conn.execute(
            """
            INSERT INTO predictions
                (request_id, input_preview, label, confidence, word_count,
                 top_fake_words, top_real_words, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                result["request_id"],
                preview,
                result["label"],
                result["confidence"],
                result["word_count"],
                json.dumps(result["top_fake_words"]),
                json.dumps(result["top_real_words"]),
                datetime.now(timezone.utc).isoformat(),
            ),
        )
        conn.commit()


def get_stats() -> dict:
    with get_conn() as conn:
        total = conn.execute("SELECT COUNT(*) AS c FROM predictions").fetchone()["c"]
        fake = conn.execute(
            "SELECT COUNT(*) AS c FROM predictions WHERE label = 'FAKE'"
        ).fetchone()["c"]
        real = total - fake
        avg_conf = conn.execute(
            "SELECT AVG(confidence) AS a FROM predictions"
        ).fetchone()["a"] or 0.0
    return {
        "total_predictions": total,
        "fake_count": fake,
        "real_count": real,
        "fake_pct": round((fake / total * 100), 1) if total else 0.0,
        "real_pct": round((real / total * 100), 1) if total else 0.0,
        "average_confidence": round(avg_conf, 1),
    }


def get_recent(limit: int = 10) -> list[dict]:
    limit = max(1, min(limit, 50))
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT request_id, input_preview, label, confidence, created_at "
            "FROM predictions ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return [dict(r) for r in rows]
