"""
A tiny, in-memory stand-in for a real Hindsight server, implemented with
only the standard library (`http.server`). It implements just enough of
Hindsight's documented REST contract (retain / recall / reflect / health)
for OpsMind's own test suite to exercise real HTTP requests end-to-end
without needing Docker, PostgreSQL, an LLM API key, or network access.

It is NOT a reimplementation of Hindsight's retrieval intelligence
(TEMPR, entity graphs, disposition-aware reasoning, consolidation, etc.)
-- recall() here is a naive keyword-overlap search and reflect() is a
simple template. It exists purely so this repository's tests can prove
"if you point a real HTTP client at a real Hindsight-shaped API, the
agent's retain -> recall -> reflect orchestration behaves correctly."
Swap `HINDSIGHT_API_URL` for a real server (see docker-compose.yml) to
get real memory quality.
"""

from __future__ import annotations

import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer


class _State:
    def __init__(self):
        self.banks: dict[str, list[dict]] = {}


class _Handler(BaseHTTPRequestHandler):
    state: _State = None  # set by FakeHindsightServer

    def log_message(self, fmt, *args):  # silence default stderr logging
        pass

    def _send_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        if not length:
            return {}
        return json.loads(self.rfile.read(length))

    def do_GET(self):
        if self.path == "/health":
            self._send_json(200, {"status": "ok"})
        else:
            self._send_json(404, {"error": "not found"})

    def do_POST(self):
        parts = self.path.strip("/").split("/")
        # /v1/{tenant}/banks/{bank_id}/memories
        # /v1/{tenant}/banks/{bank_id}/memories/recall
        # /v1/{tenant}/banks/{bank_id}/reflect
        try:
            if parts[0] != "v1" or parts[2] != "banks":
                raise ValueError
            bank_id = parts[3]
        except (IndexError, ValueError):
            self._send_json(404, {"error": "not found"})
            return

        body = self._read_json()
        bank = self.state.banks.setdefault(bank_id, [])

        if parts[4:] == ["memories"]:
            items = body.get("items", [])
            for item in items:
                bank.append(item)
            self._send_json(200, {"stored": len(items)})

        elif parts[4:] == ["memories", "recall"]:
            query = (body.get("query") or "").lower()
            query_terms = set(query.split())
            max_results = int(body.get("max_results", 10))
            scored = []
            for item in bank:
                content = (item.get("content") or "").lower()
                overlap = len(query_terms & set(content.split()))
                if overlap:
                    scored.append((overlap, item))
            scored.sort(key=lambda t: t[0], reverse=True)
            results = [
                {
                    "text": item.get("content", ""),
                    "type": "experience",
                    "score": round(min(1.0, overlap / max(len(query_terms), 1)), 3),
                    "metadata": item.get("metadata", {}),
                }
                for overlap, item in scored[:max_results]
            ]
            self._send_json(200, {"results": results})

        elif parts[4:] == ["reflect"]:
            query = body.get("query", "")
            relevant = [
                item.get("content", "")
                for item in bank
                if set(query.lower().split()) & set((item.get("content") or "").lower().split())
            ]
            if relevant:
                answer = (
                    f"Based on {len(relevant)} related memor"
                    f"{'y' if len(relevant) == 1 else 'ies'} in this bank, here is a synthesis "
                    f"relevant to '{query}': " + " | ".join(relevant[:5])
                )
            else:
                answer = f"No memories in this bank relate to '{query}' yet."
            self._send_json(
                200,
                {
                    "text": answer,
                    "based_on": [{"text": r} for r in relevant[:5]],
                    "confidence": 0.9 if relevant else 0.0,
                },
            )
        else:
            self._send_json(404, {"error": "not found"})


class FakeHindsightServer:
    """Usage:

        with FakeHindsightServer() as srv:
            client = Hindsight(base_url=srv.url)
            ...
    """

    def __init__(self, host: str = "127.0.0.1", port: int = 0):
        self._state = _State()
        handler = type("BoundHandler", (_Handler,), {"state": self._state})
        self._httpd = HTTPServer((host, port), handler)
        self._thread = threading.Thread(target=self._httpd.serve_forever, daemon=True)

    @property
    def url(self) -> str:
        host, port = self._httpd.server_address
        return f"http://{host}:{port}"

    def __enter__(self):
        self._thread.start()
        return self

    def __exit__(self, *exc):
        self._httpd.shutdown()
        self._httpd.server_close()
