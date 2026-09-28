"""
hindsight_client.py
--------------------
A minimal, dependency-free client for the Hindsight memory API
(https://github.com/vectorize-io/hindsight).

Why a hand-rolled client instead of the official `hindsight-client` PyPI
package? Two reasons:

1. It keeps OpsMind AI runnable in locked-down environments (no `pip
   install` required) since it only uses the Python standard library
   (`urllib`, `json`).
2. It talks directly to Hindsight's documented REST surface, so it works
   identically against a self-hosted server (`docker run ... hindsight`),
   Hindsight Cloud, or the offline `fake_hindsight_server.py` used in
   this repo's test suite.

If you have the official SDK installed and prefer it, swap this module
for `from hindsight_client import Hindsight` — the method signatures
below (`retain`, `retain_batch`, `recall`, `reflect`, `health`) were
kept intentionally close to it so the rest of the codebase doesn't
need to change.

REST surface used (see https://hindsight.vectorize.io/api-reference):
    GET  /health
    POST /v1/default/banks/{bank_id}/memories          (retain)
    POST /v1/default/banks/{bank_id}/memories/recall    (recall)
    POST /v1/default/banks/{bank_id}/reflect            (reflect)
"""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from typing import Any, Optional


class HindsightError(RuntimeError):
    """Raised when the Hindsight API returns an error or is unreachable."""

    def __init__(self, message: str, status_code: Optional[int] = None, body: Any = None):
        super().__init__(message)
        self.status_code = status_code
        self.body = body


@dataclass
class MemoryItem:
    """A single retrieved memory returned by `recall`."""

    text: str
    type: str = "unknown"          # world | experience | observation
    score: float = 0.0
    metadata: dict = field(default_factory=dict)

    @classmethod
    def from_dict(cls, d: dict) -> "MemoryItem":
        return cls(
            text=d.get("text") or d.get("content") or "",
            type=d.get("type", "unknown"),
            score=float(d.get("score", 0.0) or 0.0),
            metadata=d.get("metadata", {}) or {},
        )


@dataclass
class RecallResult:
    results: list[MemoryItem] = field(default_factory=list)
    raw: dict = field(default_factory=dict)

    def __iter__(self):
        return iter(self.results)

    def __len__(self):
        return len(self.results)


@dataclass
class ReflectResponse:
    text: str
    based_on: list[dict] = field(default_factory=list)
    confidence: Optional[float] = None
    raw: dict = field(default_factory=dict)


class Hindsight:
    """Thin REST wrapper around a running Hindsight server."""

    def __init__(
        self,
        base_url: str = "http://localhost:8888",
        api_key: Optional[str] = None,
        tenant: str = "default",
        timeout: float = 30.0,
    ):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.tenant = tenant
        self.timeout = timeout

    # -- internal ---------------------------------------------------------

    def _url(self, path: str) -> str:
        return f"{self.base_url}{path}"

    def _request(self, method: str, path: str, payload: Optional[dict] = None) -> dict:
        url = self._url(path)
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                raw = resp.read()
                return json.loads(raw) if raw else {}
        except urllib.error.HTTPError as e:
            body = e.read()
            try:
                body = json.loads(body)
            except Exception:
                body = body.decode("utf-8", "replace")
            raise HindsightError(
                f"Hindsight API error {e.code} for {method} {path}: {body}",
                status_code=e.code,
                body=body,
            ) from e
        except urllib.error.URLError as e:
            raise HindsightError(
                f"Could not reach Hindsight server at {url}: {e.reason}"
            ) from e

    # -- public API ---------------------------------------------------------

    def health(self) -> dict:
        return self._request("GET", "/health")

    def retain(
        self,
        bank_id: str,
        content: str,
        context: Optional[str] = None,
        timestamp: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> dict:
        """Store a single memory (fact, event, or conversation) in a bank."""
        item: dict = {"content": content}
        if context:
            item["context"] = context
        if timestamp:
            item["timestamp"] = timestamp
        if metadata:
            item["metadata"] = metadata
        return self.retain_batch(bank_id, [item])

    def retain_batch(self, bank_id: str, items: list[dict]) -> dict:
        path = f"/v1/{self.tenant}/banks/{bank_id}/memories"
        return self._request("POST", path, {"items": items})

    def recall(
        self,
        bank_id: str,
        query: str,
        max_results: int = 10,
        fact_types: Optional[list[str]] = None,
    ) -> RecallResult:
        path = f"/v1/{self.tenant}/banks/{bank_id}/memories/recall"
        payload: dict = {"query": query, "max_results": max_results}
        if fact_types:
            payload["fact_type"] = fact_types
        raw = self._request("POST", path, payload)
        results = [MemoryItem.from_dict(r) for r in raw.get("results", [])]
        return RecallResult(results=results, raw=raw)

    def reflect(
        self,
        bank_id: str,
        query: str,
        context: Optional[str] = None,
        budget: str = "medium",
    ) -> ReflectResponse:
        path = f"/v1/{self.tenant}/banks/{bank_id}/reflect"
        payload: dict = {"query": query, "budget": budget}
        if context:
            payload["context"] = context
        raw = self._request("POST", path, payload)
        return ReflectResponse(
            text=raw.get("text", ""),
            based_on=raw.get("based_on", []) or [],
            confidence=raw.get("confidence"),
            raw=raw,
        )
