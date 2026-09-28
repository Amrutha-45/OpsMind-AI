"""SQLite persistence for incidents, insights, and feedback.

Deliberately dependency-free (stdlib `sqlite3`) so the whole backend runs
without a database server. Swap for Postgres/SQLAlchemy in production by
implementing the same methods.
"""

from __future__ import annotations

import json
import os
import sqlite3
import threading
from typing import Optional

from .models import Incident, Insight, SimilarIncident, SuggestionFeedback


class Store:
    def __init__(self, db_path: str = "./opsmind.db"):
        self._db_path = db_path
        db_dir = os.path.dirname(os.path.abspath(self._db_path))
        if db_dir:
            os.makedirs(db_dir, exist_ok=True)
        self._local = threading.local()
        self._init_schema()

    def close(self) -> None:
        conn = getattr(self._local, "conn", None)
        if conn is not None:
            try:
                conn.close()
            finally:
                self._local.conn = None

    # -- connection handling -------------------------------------------------

    @property
    def _conn(self) -> sqlite3.Connection:
        conn = getattr(self._local, "conn", None)
        if conn is None:
            conn = sqlite3.connect(self._db_path)
            conn.row_factory = sqlite3.Row
            self._local.conn = conn
        return conn

    def _init_schema(self) -> None:
        conn = self._conn
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS incidents (
                id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                service TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS insights (
                id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                bank_id TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS feedback (
                id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                incident_id TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
            """
        )
        conn.commit()

    # -- incidents -------------------------------------------------------

    def save_incident(self, incident: Incident) -> None:
        payload = json.dumps(incident.to_dict())
        self._conn.execute(
            "INSERT INTO incidents (id, data, service, status, created_at) "
            "VALUES (?, ?, ?, ?, ?) "
            "ON CONFLICT(id) DO UPDATE SET data=excluded.data, status=excluded.status",
            (incident.id, payload, incident.service, incident.status, incident.created_at),
        )
        self._conn.commit()

    def get_incident(self, incident_id: str) -> Optional[Incident]:
        row = self._conn.execute(
            "SELECT data FROM incidents WHERE id = ?", (incident_id,)
        ).fetchone()
        return self._row_to_incident(row) if row else None

    def list_incidents(self, service: Optional[str] = None, status: Optional[str] = None) -> list[Incident]:
        query = "SELECT data FROM incidents WHERE 1=1"
        params: list = []
        if service:
            query += " AND service = ?"
            params.append(service)
        if status:
            query += " AND status = ?"
            params.append(status)
        query += " ORDER BY created_at DESC"
        rows = self._conn.execute(query, params).fetchall()
        return [self._row_to_incident(r) for r in rows]

    @staticmethod
    def _row_to_incident(row: sqlite3.Row) -> Incident:
        d = json.loads(row["data"])
        similar = [SimilarIncident(**s) for s in d.pop("similar_past_incidents", [])]
        incident = Incident(**d)
        incident.similar_past_incidents = similar
        return incident

    # -- insights ---------------------------------------------------------

    def save_insight(self, insight: Insight) -> None:
        payload = json.dumps(insight.to_dict())
        self._conn.execute(
            "INSERT INTO insights (id, data, bank_id, created_at) VALUES (?, ?, ?, ?)",
            (insight.id, payload, insight.bank_id, insight.created_at),
        )
        self._conn.commit()

    def list_insights(self, bank_id: Optional[str] = None, limit: int = 50) -> list[Insight]:
        query = "SELECT data FROM insights WHERE 1=1"
        params: list = []
        if bank_id:
            query += " AND bank_id = ?"
            params.append(bank_id)
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        rows = self._conn.execute(query, params).fetchall()
        return [Insight(**json.loads(r["data"])) for r in rows]

    # -- feedback (the "improve" loop) ------------------------------------

    def save_feedback(self, feedback: SuggestionFeedback) -> None:
        payload = json.dumps(feedback.to_dict())
        self._conn.execute(
            "INSERT INTO feedback (id, data, incident_id, created_at) VALUES (?, ?, ?, ?)",
            (feedback.id, payload, feedback.incident_id, feedback.created_at),
        )
        self._conn.commit()

    def feedback_stats(self) -> dict:
        rows = self._conn.execute("SELECT data FROM feedback").fetchall()
        total = len(rows)
        helpful = sum(1 for r in rows if json.loads(r["data"])["was_helpful"])
        return {
            "total_feedback": total,
            "helpful": helpful,
            "acceptance_rate": (helpful / total) if total else None,
        }
