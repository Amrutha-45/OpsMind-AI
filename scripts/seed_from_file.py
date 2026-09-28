#!/usr/bin/env python3
"""Loads data/sample_incidents.json into a running OpsMind backend —
opens and immediately resolves each one, so the memory bank has a richer
multi-service history to recall/reflect over than scripts/seed_demo.py's
minimal two-incident story.

Usage:
    python scripts/seed_from_file.py [--base-url http://localhost:8000]
"""

from __future__ import annotations

import argparse
import json
import pathlib
import sys
import urllib.error
import urllib.request

DATA_FILE = pathlib.Path(__file__).resolve().parent.parent / "data" / "sample_incidents.json"


def call(base_url: str, method: str, path: str, payload: dict | None = None) -> dict:
    url = f"{base_url}{path}"
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method,
                                  headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:8000")
    args = parser.parse_args()
    base = args.base_url.rstrip("/")

    incidents = json.loads(DATA_FILE.read_text())
    for record in incidents:
        opened = call(base, "POST", "/incidents", {
            "service": record["service"],
            "title": record["title"],
            "description": record["description"],
            "severity": record["severity"],
            "tags": record.get("tags", []),
        })
        print(f"Opened {opened['id']} ({record['service']}): {record['title']} "
              f"-> recalled {len(opened['similar_past_incidents'])} similar incident(s)")

        call(base, "POST", f"/incidents/{opened['id']}/resolve", {
            "root_cause": record["root_cause"],
            "resolution": record["resolution"],
        })

    print(f"\nLoaded {len(incidents)} incidents across "
          f"{len(set(r['service'] for r in incidents))} services.")
    print("Try: POST /reflect {\"service\": \"payments\", \"question\": \"...\"}")


if __name__ == "__main__":
    try:
        main()
    except urllib.error.URLError as e:
        print(f"Could not reach OpsMind backend: {e}", file=sys.stderr)
        sys.exit(1)
