"""End-to-end test that boots the actual zero-dependency HTTP server
(opsmind.server_stdlib) on a background thread and drives it with real
HTTP requests, with a FakeHindsightServer standing in for Hindsight.
This proves the whole stack -- routing, JSON parsing, the agent, sqlite
storage, and the Hindsight client -- works together over real sockets,
not just in-process function calls.
"""

import json
import os
import tempfile
import threading
import unittest
import urllib.request
from http.server import ThreadingHTTPServer

from opsmind import server_stdlib
from opsmind.agent import OpsMindAgent
from opsmind.hindsight_client import Hindsight
from opsmind.store import Store
from .fake_hindsight_server import FakeHindsightServer


def _call(method, url, payload=None):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method,
                                  headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return resp.status, json.loads(resp.read())


class TestServerStdlib(unittest.TestCase):
    def setUp(self):
        self.tmp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.tmp_db.close()

    def tearDown(self):
        if hasattr(server_stdlib, "agent") and server_stdlib.agent:
            server_stdlib.agent.close()
        try:
            os.unlink(self.tmp_db.name)
        except (PermissionError, FileNotFoundError):
            pass

    def test_end_to_end_over_http(self):
        with FakeHindsightServer() as hs:
            # Point the module-level agent at our fake Hindsight + a temp DB
            server_stdlib.agent = OpsMindAgent(
                hindsight=Hindsight(base_url=hs.url),
                store=Store(self.tmp_db.name),
            )
            httpd = ThreadingHTTPServer(("127.0.0.1", 0), server_stdlib.Handler)
            host, port = httpd.server_address
            base = f"http://{host}:{port}"
            thread = threading.Thread(target=httpd.serve_forever, daemon=True)
            thread.start()
            try:
                status, body = _call("GET", f"{base}/health")
                self.assertEqual(status, 200)
                self.assertEqual(body["hindsight"], {"status": "ok"})

                status, incident = _call("POST", f"{base}/incidents", {
                    "service": "payments",
                    "title": "Payments API 500s",
                    "description": "Connection pool exhausted after deploy",
                    "severity": "SEV2",
                })
                self.assertEqual(status, 200)
                incident_id = incident["id"]

                status, resolved = _call(
                    "POST", f"{base}/incidents/{incident_id}/resolve",
                    {"root_cause": "pool too small", "resolution": "raised pool size"},
                )
                self.assertEqual(status, 200)
                self.assertEqual(resolved["status"], "resolved")

                status, incidents = _call("GET", f"{base}/incidents")
                self.assertEqual(status, 200)
                self.assertEqual(len(incidents), 1)

                status, insight = _call("POST", f"{base}/reflect", {
                    "service": "payments",
                    "question": "pool exhausted",
                })
                self.assertEqual(status, 200)
                self.assertIn("pool", insight["answer"].lower())

                status, fb = _call(
                    "POST", f"{base}/incidents/{incident_id}/feedback",
                    {"suggestion_text": "raised pool size", "was_helpful": True},
                )
                self.assertEqual(status, 200)
                self.assertTrue(fb["was_helpful"])

                status, stats = _call("GET", f"{base}/stats")
                self.assertEqual(status, 200)
                self.assertEqual(stats["total_feedback"], 1)

                # Test serving frontend dashboard
                req_ui = urllib.request.Request(f"{base}/")
                with urllib.request.urlopen(req_ui) as resp_ui:
                    self.assertEqual(resp_ui.status, 200)
                    self.assertIn("OpsMind AI", resp_ui.read().decode())

                # Test demo seed endpoint
                status, seed_res = _call("POST", f"{base}/demo/seed")
                self.assertEqual(status, 200)
                self.assertGreaterEqual(seed_res["loaded_count"], 1)
            finally:
                httpd.shutdown()
                httpd.server_close()


if __name__ == "__main__":
    unittest.main()
