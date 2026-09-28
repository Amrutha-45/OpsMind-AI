# OpsMind AI

**A memory-powered incident response agent, built on [Hindsight](https://github.com/vectorize-io/hindsight).**

Built for the *AI Agents That Learn Using Hindsight* hackathon.

---

## The idea

On-call engineers re-solve the same incidents over and over because nothing
remembers what worked last time. OpsMind AI is an incident-response agent
whose memory *is* Hindsight: every incident it sees becomes a permanent
memory, every new incident is checked against that memory before a human
even starts digging, and every so often it reflects across everything it's
retained to surface patterns no single incident would reveal on its own.

The hackathon asks for **REMEMBER → RECALL → APPLY → LEARN → IMPROVE**.
Here's exactly where each one lives in this codebase:

| Stage | Hindsight primitive | Where |
|---|---|---|
| **REMEMBER** | `retain` | `OpsMindAgent.on_incident_opened` / `on_incident_resolved` — every incident and its resolution is retained as it happens |
| **RECALL** | `recall` | `OpsMindAgent.on_incident_opened` — the moment a new incident is filed, Hindsight is asked "has anything like this happened before?" |
| **APPLY** | (recall's output, surfaced) | The recalled memories are attached to the incident as `similar_past_incidents` and shown directly to the responder in the dashboard — a fix that worked last time, not a fresh investigation |
| **LEARN** | `reflect` | `OpsMindAgent.reflect` — asks Hindsight to reason *across* every retained incident for a service ("why do payments outages keep happening?") and returns a cited, synthesized answer |
| **IMPROVE** | `retain` (again) | `OpsMindAgent.record_feedback` — whether a recalled suggestion actually helped is itself retained as a memory, so future recall/reflect calls are shaped by what has actually worked, not just raw incident text |

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full data-flow diagram.

---

## Project layout

```
opsmind-ai/
├── backend/
│   ├── opsmind/
│   │   ├── hindsight_client.py   # stdlib REST client for Hindsight (retain/recall/reflect)
│   │   ├── agent.py              # OpsMindAgent — the 5-stage loop
│   │   ├── models.py             # Incident / Insight / SuggestionFeedback
│   │   ├── store.py              # SQLite persistence
│   │   ├── config.py             # env-driven settings
│   │   ├── api.py                # FastAPI app (production entrypoint)
│   │   └── server_stdlib.py      # zero-dependency mirror of api.py
│   ├── tests/
│   │   ├── fake_hindsight_server.py   # protocol-accurate offline Hindsight stand-in
│   │   ├── test_hindsight_client.py
│   │   ├── test_agent_learning_loop.py
│   │   └── test_server_stdlib.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   └── index.html            # single-file operator dashboard, no build step
├── scripts/
│   └── seed_demo.py          # scripted demo of the full remember→...→improve arc
├── data/
│   └── sample_incidents.json # raw incident text used by seed_demo.py
├── docker-compose.yml         # hindsight + backend + frontend, one command
└── .env.example
```

---

## Running it

### Option A — with a real Hindsight server (recommended for judging)

```bash
cp .env.example .env
# edit .env and set OPENAI_API_KEY (or another provider — see below)
docker compose up --build
```

This starts three services:

- **Hindsight** itself at `http://localhost:8888` (API) and `http://localhost:9999` (its own memory-inspection UI — great for showing judges the raw retained memories, entity graphs, and observations)
- **OpsMind backend** (FastAPI) at `http://localhost:8000`
- **OpsMind dashboard** (static file server) at `http://localhost:3000`

Then seed the demo narrative:

```bash
python3 scripts/seed_demo.py --base-url http://localhost:8000
```

Open `http://localhost:3000` to see incidents, recalled memories, and
insights populate live.

Hindsight supports 25+ LLM providers (`openai`, `anthropic`, `gemini`,
`groq`, `ollama`, local models, etc.) — set `HINDSIGHT_LLM_PROVIDER` and
the matching API key in `.env`. See the
[Hindsight installation guide](https://hindsight.vectorize.io/developer/installation)
for the full list.

### Option B — zero-dependency local demo (1-command launcher, no `pip install`, no Docker, no LLM key)

Ideal for quick evaluation and offline grading environments. Starts the protocol-accurate in-memory Fake Hindsight server on `:8888` and the OpsMind server on `:8000` (which serves both the API and the interactive dashboard at `http://localhost:8000`):

```bash
python run_local_demo.py
# or: make demo
```

Then open `http://localhost:8000` in your browser.
Click **"▶ Demo Tour"** in the top header to run the full interactive 5-stage demonstration right in the browser!

Alternatively, you can run the demo script from the terminal:
```bash
python scripts/seed_demo.py --base-url http://localhost:8000
```

### Option C — production FastAPI, real Hindsight, no Docker

```bash
export HINDSIGHT_API_URL=https://api.hindsight.vectorize.io   # or your self-hosted URL
export HINDSIGHT_API_KEY=...                                    # if using Hindsight Cloud
pip install -r backend/requirements.txt
uvicorn opsmind.api:app --app-dir backend --reload
```

---

## Running the tests

```bash
cd backend
python3 -m unittest discover -s tests -t . -v
```

8 tests, all passing, exercising:
- the Hindsight REST client directly against a real HTTP server (retain → recall roundtrip, bank isolation, reflect synthesis, unreachable-server error handling)
- the full agent learning loop (open → resolve → open similar → recall surfaces the fix → reflect → feedback → stats)
- the entire zero-dependency HTTP server booted on a real socket and driven with real HTTP requests

No `pip install` is required to run the test suite — everything above
uses only the Python standard library plus the code in this repo.

---

## API reference

| Method | Path | Stage | Description |
|---|---|---|---|
| `GET`  | `/health` | — | Backend + Hindsight connectivity |
| `POST` | `/incidents` | REMEMBER + RECALL + APPLY | Open an incident; returns it with `similar_past_incidents` populated |
| `GET`  | `/incidents` | — | List incidents (`?service=`, `?status=`) |
| `GET`  | `/incidents/{id}` | — | Get one incident |
| `POST` | `/incidents/{id}/resolve` | REMEMBER | Resolve with `root_cause` + `resolution` |
| `POST` | `/incidents/{id}/feedback` | IMPROVE | Record whether a recalled suggestion helped |
| `POST` | `/reflect` | LEARN | Ask a standing question of a service's memory bank |
| `GET`  | `/insights` | — | List past reflect results (`?service=`) |
| `GET`  | `/stats` | — | Feedback acceptance rate (the improve loop's scoreboard) |

---

## Design notes / honest limitations

- **Memory banks are per-service** (`opsmind-payments`, `opsmind-auth`, …),
  matching Hindsight's own recommendation of one bank per isolated context —
  an incident in `payments` will never leak into `auth`'s recall results.
- **Memory is best-effort.** If Hindsight is briefly unreachable, opening or
  resolving an incident still succeeds — `HindsightError` is caught around
  every call. An incident-response tool must never be blocked by its own
  memory layer.
- **The offline `fake_hindsight_server.py` is intentionally dumb** (keyword
  overlap, not semantic search). It's there so the test suite and this
  README's "Option B" can prove the *integration* is correct without
  needing Docker/an LLM key/network access. Point `HINDSIGHT_API_URL` at a
  real Hindsight server (Option A or C) to get Hindsight's actual TEMPR
  retrieval, observations, and disposition-aware reflect.
- **`opsmind/hindsight_client.py` is a hand-rolled, stdlib-only REST
  client**, not the official `hindsight-client` PyPI package, so the repo
  has zero required dependencies at the transport layer. If you have the
  official SDK available, it's a drop-in swap — see the comment at the
  top of that file.
- **This is a hackathon build**, not a hardened production system: the
  SQLite store has no migrations story, there's no auth on the API, and
  the "reflect" cadence (when to re-ask a standing question) is manual
  (`POST /reflect`) rather than scheduled.

---

## What Hindsight Cloud's own UI adds

If you run `docker compose up`, open `http://localhost:9999` — that's
Hindsight's own web UI, showing the raw memory graph (entities,
relationships, world facts vs. experiences vs. observations) that OpsMind's
retained incidents are building up. It's the fastest way to show a judge
"here's what's actually inside the memory bank," independent of anything
OpsMind's own dashboard renders.
