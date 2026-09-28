#!/usr/bin/env python3
"""
Seeds OpsMind AI with a small narrative arc that demonstrates the full
REMEMBER -> RECALL -> APPLY -> LEARN -> IMPROVE loop against a running
backend (either `opsmind.api` via uvicorn, or `opsmind.server_stdlib`).

Usage:
    python scripts/seed_demo.py [--base-url http://localhost:8000]

What it does, in order:
  1. Opens & resolves incident #1 (payments outage, root cause found).
     -> REMEMBER
  2. Opens incident #2 with the *same* symptom and prints what the
     agent recalled from incident #1.
     -> RECALL + APPLY
  3. Resolves incident #2, then asks the agent to reflect on why
     payments keeps breaking.
     -> LEARN
  4. Submits feedback saying the recalled suggestion was helpful, then
     re-reflects to show the answer is now grounded in confirmed,
     working fixes -- not just raw incident text.
     -> IMPROVE
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.request


def call(base_url: str, method: str, path: str, payload: dict | None = None) -> dict:
    url = f"{base_url}{path}"
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method,
                                  headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def banner(text: str) -> None:
    print()
    print("=" * 72)
    print(text)
    print("=" * 72)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:8000")
    args = parser.parse_args()
    base = args.base_url.rstrip("/")

    banner("STEP 1 - REMEMBER: open & resolve the first payments incident")
    inc1 = call(base, "POST", "/incidents", {
        "service": "payments",
        "title": "Payments API returning 500s",
        "description": "Payments API started returning 500 errors shortly after the 2pm deploy. "
                        "Connection pool exhausted under normal traffic.",
        "severity": "SEV2",
        "tags": ["payments", "5xx", "deploy"],
    })
    print(f"Opened incident {inc1['id']} -> similar past incidents found: "
          f"{len(inc1['similar_past_incidents'])} (expected: 0, nothing to learn from yet)")

    call(base, "POST", f"/incidents/{inc1['id']}/resolve", {
        "root_cause": "The DB connection pool size was left at its low default after a "
                       "config refactor, so it saturated under normal peak traffic.",
        "resolution": "Raised the connection pool size and added a pre-deploy check that "
                       "fails the build if pool size drops below a safe threshold.",
    })
    print(f"Resolved incident {inc1['id']}. This resolution is now a permanent memory.")

    banner("STEP 2 - RECALL + APPLY: a second incident with the same symptom")
    inc2 = call(base, "POST", "/incidents", {
        "service": "payments",
        "title": "Payments API 500s again",
        "description": "Payments API is throwing 500s again, right after this morning's deploy. "
                        "Looks like connection pool exhaustion.",
        "severity": "SEV2",
        "tags": ["payments", "5xx", "deploy"],
    })
    print(f"Opened incident {inc2['id']}. The agent recalled "
          f"{len(inc2['similar_past_incidents'])} similar past incident(s):")
    for s in inc2["similar_past_incidents"]:
        print(f"  - [{s['memory_type']}, score={s['score']}] {s['text']}")
    print("-> APPLY: a responder now sees the fix that worked last time, instead of")
    print("   re-diagnosing connection-pool exhaustion from scratch.")

    call(base, "POST", f"/incidents/{inc2['id']}/resolve", {
        "root_cause": "Same as before: pool size regressed after a redeploy of the base image.",
        "resolution": "Applied the same pool-size fix from the prior incident. Filed a "
                       "follow-up to bake the pool-size check into the base image itself.",
    })

    banner("STEP 3 - LEARN: reflect across every payments incident retained so far")
    insight = call(base, "POST", "/reflect", {
        "service": "payments",
        "question": "Why do payments outages keep happening, and what should responders "
                     "check first?",
    })
    print(insight["answer"])
    print(f"(confidence: {insight['confidence']}, based on {len(insight['based_on'])} memories)")

    banner("STEP 4 - IMPROVE: record that the recalled suggestion actually helped")
    if inc2["similar_past_incidents"]:
        suggestion_text = inc2["similar_past_incidents"][0]["text"]
        call(base, "POST", f"/incidents/{inc2['id']}/feedback", {
            "suggestion_text": suggestion_text,
            "was_helpful": True,
        })
        print("Feedback recorded: the recalled suggestion WAS helpful.")

    stats = call(base, "GET", "/stats")
    print(f"Learning stats so far: {stats}")

    banner("Done. Open the frontend or GET /incidents, /insights, /stats to explore.")


if __name__ == "__main__":
    try:
        main()
    except urllib.error.URLError as e:  # type: ignore[attr-defined]
        print(f"Could not reach OpsMind backend: {e}", file=sys.stderr)
        print("Start it first, e.g.: python -m opsmind.server_stdlib", file=sys.stderr)
        sys.exit(1)
