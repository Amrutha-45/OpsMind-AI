#!/usr/bin/env python3
"""
run_local_demo.py
------------------
One-command runner for evaluating OpsMind AI offline.
Starts:
  1. FakeHindsightServer on http://127.0.0.1:8888 (protocol-accurate offline memory stand-in)
  2. OpsMind stdlib server on http://127.0.0.1:8000 (serves both API & Frontend Dashboard)

Requires only the Python standard library. No pip install, no Docker, no LLM API key.
"""

from __future__ import annotations

import os
import sys
import time
import webbrowser
from http.server import ThreadingHTTPServer

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from opsmind.config import settings
from opsmind.server_stdlib import Handler, agent
from tests.fake_hindsight_server import FakeHindsightServer


def main():
    print("=" * 72)
    print("  OpsMind AI — Local Offline Demo Launcher")
    print("=" * 72)
    print("Starting in-memory Fake Hindsight server on http://127.0.0.1:8888 ...")

    with FakeHindsightServer(host="127.0.0.1", port=8888) as fake_hindsight:
        print(f"[OK] Fake Hindsight running at {fake_hindsight.url}")

        server = ThreadingHTTPServer(("127.0.0.1", 8000), Handler)
        dashboard_url = "http://127.0.0.1:8000"
        print(f"[OK] OpsMind Server running at {dashboard_url}")
        print("-" * 72)
        print(f"Open {dashboard_url} in your browser to interact with the dashboard!")
        print("Press Ctrl+C to stop the servers.")
        print("-" * 72)

        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down OpsMind demo servers...")
        finally:
            server.server_close()


if __name__ == "__main__":
    main()
