"""
A dependency-free HTTP server exposing the exact same routes as
`opsmind.api` (FastAPI), implemented with only `http.server`.

Use this when `pip install fastapi uvicorn` isn't an option (offline
grading environments, quick demos, CI sandboxes). All routes delegate
to the same `OpsMindAgent`, so behavior matches the FastAPI app exactly.

Run:
    python -m opsmind.server_stdlib
"""

from __future__ import annotations

import json
import os
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

from .agent import OpsMindAgent
from .config import settings

agent = OpsMindAgent()

ROUTES = [
    ("GET", re.compile(r"^/health$")),
    ("POST", re.compile(r"^/incidents$")),
    ("GET", re.compile(r"^/incidents$")),
    ("GET", re.compile(r"^/incidents/(?P<id>[^/]+)$")),
    ("POST", re.compile(r"^/incidents/(?P<id>[^/]+)/resolve$")),
    ("POST", re.compile(r"^/incidents/(?P<id>[^/]+)/feedback$")),
    ("POST", re.compile(r"^/reflect$")),
    ("GET", re.compile(r"^/insights$")),
    ("GET", re.compile(r"^/stats$")),
]


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print(f"[opsmind] {self.address_string()} {fmt % args}")

    # -- helpers -----------------------------------------------------------

    def _send_json(self, status: int, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        if not length:
            return {}
        return json.loads(self.rfile.read(length))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With")
        self.end_headers()

    def do_GET(self):
        self._dispatch("GET")

    def do_POST(self):
        self._dispatch("POST")

    # -- routing -----------------------------------------------------------

    def _dispatch(self, method: str):
        parsed = urlparse(self.path)
        path = parsed.path
        query = {k: v[0] for k, v in parse_qs(parsed.query).items()}

        try:
            if method == "GET" and (path in ("/", "/index.html", "/ui") or path.startswith("/static/")):
                return self._serve_frontend(path)
            if method == "GET" and path == "/health":
                return self._health()
            if method == "POST" and path == "/incidents":
                return self._open_incident()
            if method == "GET" and path == "/incidents":
                return self._list_incidents(query)
            if method == "GET" and path == "/insights":
                return self._list_insights(query)
            if method == "GET" and path == "/stats":
                return self._stats()
            if method == "POST" and path == "/reflect":
                return self._reflect()
            if method == "POST" and path == "/demo/seed":
                return self._seed_demo()

            m = re.match(r"^/incidents/(?P<id>[^/]+)$", path)
            if method == "GET" and m:
                return self._get_incident(m.group("id"))

            m = re.match(r"^/incidents/(?P<id>[^/]+)/resolve$", path)
            if method == "POST" and m:
                return self._resolve_incident(m.group("id"))

            m = re.match(r"^/incidents/(?P<id>[^/]+)/feedback$", path)
            if method == "POST" and m:
                return self._feedback(m.group("id"))

            self._send_json(404, {"error": "not found"})
        except KeyError as e:
            self._send_json(404, {"error": str(e)})
        except Exception as e:  # noqa: BLE001
            self._send_json(500, {"error": str(e)})

    # -- handlers -----------------------------------------------------------

    def _health(self):
        try:
            upstream = agent.hindsight.health()
        except Exception as e:  # noqa: BLE001
            upstream = {"error": str(e)}
        self._send_json(200, {"status": "ok", "hindsight": upstream})

    def _open_incident(self):
        body = self._read_json()
        incident = agent.on_incident_opened(
            service=body["service"],
            title=body["title"],
            description=body["description"],
            severity=body.get("severity", "SEV3"),
            tags=body.get("tags", []),
        )
        self._send_json(200, incident.to_dict())

    def _list_incidents(self, query: dict):
        incidents = agent.store.list_incidents(
            service=query.get("service"), status=query.get("status")
        )
        self._send_json(200, [i.to_dict() for i in incidents])

    def _get_incident(self, incident_id: str):
        incident = agent.store.get_incident(incident_id)
        if incident is None:
            self._send_json(404, {"error": "incident not found"})
            return
        self._send_json(200, incident.to_dict())

    def _resolve_incident(self, incident_id: str):
        body = self._read_json()
        try:
            incident = agent.on_incident_resolved(incident_id, body["root_cause"], body["resolution"])
        except KeyError:
            self._send_json(404, {"error": "incident not found"})
            return
        self._send_json(200, incident.to_dict())

    def _feedback(self, incident_id: str):
        body = self._read_json()
        feedback = agent.record_feedback(incident_id, body["suggestion_text"], body["was_helpful"])
        self._send_json(200, feedback.to_dict())

    def _reflect(self):
        body = self._read_json()
        insight = agent.reflect(body["service"], body["question"])
        self._send_json(200, insight.to_dict())

    def _list_insights(self, query: dict):
        bank_id = agent.bank_id(query["service"]) if query.get("service") else None
        insights = agent.store.list_insights(bank_id=bank_id)
        self._send_json(200, [i.to_dict() for i in insights])

    def _stats(self):
        self._send_json(200, agent.learning_stats())

    def _serve_frontend(self, path: str):
        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        if path in ("/", "/index.html", "/ui"):
            target_path = os.path.join(repo_root, "frontend", "index.html")
            content_type = "text/html; charset=utf-8"
        else:
            rel = path.lstrip("/")
            if rel.startswith("static/"):
                rel = rel[len("static/"):]
            target_path = os.path.join(repo_root, "frontend", rel)
            if target_path.endswith(".css"):
                content_type = "text/css; charset=utf-8"
            elif target_path.endswith(".js"):
                content_type = "application/javascript; charset=utf-8"
            elif target_path.endswith(".json"):
                content_type = "application/json; charset=utf-8"
            elif target_path.endswith(".svg"):
                content_type = "image/svg+xml"
            else:
                content_type = "text/html; charset=utf-8"

        if not os.path.isfile(target_path):
            self._send_json(404, {"error": "file not found"})
            return

        with open(target_path, "rb") as f:
            content = f.read()

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(content)

    def _seed_demo(self):
        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        data_file = os.path.join(repo_root, "data", "sample_incidents.json")
        if not os.path.isfile(data_file):
            self._send_json(404, {"error": "sample_incidents.json not found"})
            return

        with open(data_file, "r", encoding="utf-8") as f:
            records = json.load(f)

        loaded = []
        for rec in records:
            inc = agent.on_incident_opened(
                service=rec["service"],
                title=rec["title"],
                description=rec["description"],
                severity=rec.get("severity", "SEV3"),
                tags=rec.get("tags", []),
            )
            resolved = agent.on_incident_resolved(
                inc.id,
                root_cause=rec.get("root_cause", "Diagnosed and repaired"),
                resolution=rec.get("resolution", "Hotfix applied"),
            )
            loaded.append(resolved.to_dict())

        self._send_json(200, {"status": "ok", "loaded_count": len(loaded), "incidents": loaded})


def main():
    server = ThreadingHTTPServer((settings.host, settings.port), Handler)
    print(f"OpsMind AI (stdlib server) listening on http://{settings.host}:{settings.port}")
    print(f"Hindsight backend: {settings.hindsight_base_url}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
