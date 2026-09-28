"""Configuration for OpsMind AI, loaded from environment variables.

All settings have sane local-dev defaults so `python -m opsmind.server_stdlib`
works with zero configuration once a Hindsight server is running.
"""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    hindsight_base_url: str = os.environ.get("HINDSIGHT_API_URL", "http://localhost:8888")
    hindsight_api_key: str | None = os.environ.get("HINDSIGHT_API_KEY") or None
    hindsight_tenant: str = os.environ.get("HINDSIGHT_TENANT", "default")

    # Every team/service gets its own isolated memory bank so incident
    # knowledge for "payments" never leaks into "auth" recall results.
    bank_prefix: str = os.environ.get("OPSMIND_BANK_PREFIX", "opsmind")

    db_path: str = os.environ.get("OPSMIND_DB_PATH", "./opsmind.db")

    host: str = os.environ.get("OPSMIND_HOST", "0.0.0.0")
    port: int = int(os.environ.get("OPSMIND_PORT", "8000"))

    # Number of past incidents recall() should surface when a new
    # incident comes in ("apply" step).
    recall_limit: int = int(os.environ.get("OPSMIND_RECALL_LIMIT", "5"))


settings = Settings()
