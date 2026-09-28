# Architecture

## Data flow

```
                        ┌─────────────────────────────────────────────┐
                        │                 Hindsight                    │
                        │  (memory banks: opsmind-payments, opsmind-…) │
                        │                                               │
                        │   retain()  recall()  reflect()              │
                        └───────▲───────────▲───────────▲──────────────┘
                                │           │           │
                     REMEMBER  │    RECALL │    LEARN  │
                                │           │           │
                        ┌───────┴───────────┴───────────┴──────────────┐
                        │              OpsMindAgent                     │
                        │  (backend/opsmind/agent.py)                   │
                        │                                                │
                        │  on_incident_opened()  ── retain + recall      │
                        │  on_incident_resolved() ── retain               │
                        │  reflect()              ── reflect              │
                        │  record_feedback()      ── retain (IMPROVE)      │
                        └───────▲────────────────────────────▲───────────┘
                                │                             │
                          reads/writes                   reads/writes
                                │                             │
                        ┌───────┴───────────┐         ┌───────┴───────┐
                        │   SQLite (Store)  │         │  HTTP API      │
                        │  incidents        │         │  api.py /      │
                        │  insights         │         │  server_stdlib │
                        │  feedback         │         └───────▲────────┘
                        └───────────────────┘                 │
                                                                │  fetch()
                                                        ┌───────┴────────┐
                                                        │  frontend/      │
                                                        │  index.html      │
                                                        │  (dashboard)     │
                                                        └──────────────────┘
```

## Why per-service memory banks

Hindsight's own docs recommend one bank per isolated context (a bank per
user, in their chat-personalization example). OpsMind applies the same
idea per **service**: `opsmind-payments`, `opsmind-auth`,
`opsmind-notifications`, etc. This means:

- Recall for a payments incident can never surface an unrelated auth
  incident, even if both happen to share vocabulary ("500 errors").
- Reflect questions are scoped ("why does *payments* keep breaking?")
  rather than averaged across the whole organization's incident history.
- A service's memory can be inspected, exported, or wiped independently
  (Hindsight's own admin tooling operates at the bank level).

The trade-off: a systemic issue that spans multiple services (e.g. "our
shared Postgres cluster is undersized") won't be visible from a single
service's reflect call. A production version of this would likely add a
cross-cutting `opsmind-platform` bank fed by every service's retains, or
periodically retain a summary of each service's reflect output into a
shared bank.

## The five stages, traced through one incident

1. **A payments incident opens.**
   `POST /incidents` → `agent.on_incident_opened("payments", ...)`
   - **REMEMBER**: `hindsight.retain(bank_id="opsmind-payments", content="Incident opened: ...")`
   - **RECALL**: `hindsight.recall(bank_id="opsmind-payments", query="<title>. <description>")`
   - **APPLY**: the recalled memories are attached to the `Incident` object
     as `similar_past_incidents` and returned to the caller — the
     dashboard renders them directly under "Recalled from memory," so a
     responder sees a candidate fix before they've run a single query.

2. **The incident is resolved.**
   `POST /incidents/{id}/resolve` → `agent.on_incident_resolved(...)`
   - **REMEMBER**: the root cause and resolution are retained as a second
     memory. This is deliberately a *separate* retain from the "opened"
     one — Hindsight's extraction treats them as distinct events, so a
     later reflect can distinguish "what was reported" from "what
     actually fixed it."

3. **Weeks later, someone asks a standing question.**
   `POST /reflect {"service": "payments", "question": "why do payments outages keep happening?"}`
   → `agent.reflect(...)` → `hindsight.reflect(...)`
   - **LEARN**: Hindsight reasons across every retained memory in the
     bank — not just the two above, but every incident ever opened or
     resolved for that service — and returns a synthesized, cited answer.
     This is stored as an `Insight` so the dashboard has a running log of
     what's been learned over time, not just the latest answer.

4. **A responder marks a suggestion helpful (or not).**
   `POST /incidents/{id}/feedback` → `agent.record_feedback(...)`
   - **IMPROVE**: this is retained back into the bank as its own memory
     ("the suggestion '...' was helpful"). It also updates the SQLite
     `feedback` table, which powers the dashboard's acceptance-rate
     scoreboard. The net effect: the next time someone asks Hindsight to
     reflect on this service, "what has actually worked before" is part
     of the evidence it reasons over — not just raw incident text.

## Two servers, one set of routes

`backend/opsmind/api.py` (FastAPI) and `backend/opsmind/server_stdlib.py`
(stdlib `http.server`) expose **identical routes** and both delegate every
line of actual logic to the same `OpsMindAgent`. This exists so the
project can be:

- **run in production** with `uvicorn` behind a real ASGI server, or
- **run anywhere with just `python3`**, no `pip install`, for quick
  review or locked-down grading environments.

`backend/tests/test_server_stdlib.py` boots the stdlib server on a real
socket and drives it with real HTTP requests, so both entrypoints are
proven to route to the same, correctly-behaving agent.
