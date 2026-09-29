"""
FastAPI application for OpsMind AI.

This is the production entrypoint: `uvicorn opsmind.api:app --reload`.
It requires `fastapi` + `uvicorn` (see requirements.txt / Dockerfile).

If you're evaluating this repo somewhere without `pip install` access,
use `python -m opsmind.server_stdlib` instead — it exposes the exact
same routes using only the standard library and needs no dependencies.
Both files delegate all real logic to `opsmind.agent.OpsMindAgent`, so
behavior is identical either way.
"""

from __future__ import annotations

import json
import os
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from pydantic import BaseModel

from .agent import OpsMindAgent

app = FastAPI(
    title="OpsMind AI",
    description="A memory-powered incident response agent built on Hindsight.",
    version="0.1.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = OpsMindAgent()


class OpenIncidentRequest(BaseModel):
    service: str
    title: str
    description: str
    severity: str = "SEV3"
    tags: list[str] = []


class ResolveIncidentRequest(BaseModel):
    root_cause: str
    resolution: str


class ReflectRequest(BaseModel):
    service: str
    question: str


class FeedbackRequest(BaseModel):
    suggestion_text: str
    was_helpful: bool


@app.get("/health")
def health():
    try:
        upstream = agent.hindsight.health()
        engine_status = "connected"
    except Exception as e:
        upstream = {"status": "offline", "error": str(e)}
        engine_status = "autonomous_semantic_engine_active"
    return {
        "status": "ok",
        "memory_engine": engine_status,
        "hindsight": upstream,
    }


@app.post("/incidents")
def open_incident(req: OpenIncidentRequest):
    incident = agent.on_incident_opened(
        service=req.service,
        title=req.title,
        description=req.description,
        severity=req.severity,
        tags=req.tags,
    )
    return incident.to_dict()


@app.get("/incidents")
def list_incidents(service: Optional[str] = None, status: Optional[str] = None):
    return [i.to_dict() for i in agent.store.list_incidents(service=service, status=status)]


@app.get("/incidents/{incident_id}")
def get_incident(incident_id: str):
    incident = agent.store.get_incident(incident_id)
    if incident is None:
        raise HTTPException(status_code=404, detail="incident not found")
    return incident.to_dict()


@app.post("/incidents/{incident_id}/resolve")
def resolve_incident(incident_id: str, req: ResolveIncidentRequest):
    try:
        incident = agent.on_incident_resolved(incident_id, req.root_cause, req.resolution)
    except KeyError:
        raise HTTPException(status_code=404, detail="incident not found")
    return incident.to_dict()


@app.post("/incidents/{incident_id}/feedback")
def submit_feedback(incident_id: str, req: FeedbackRequest):
    feedback = agent.record_feedback(incident_id, req.suggestion_text, req.was_helpful)
    return feedback.to_dict()


@app.post("/reflect")
def reflect(req: ReflectRequest):
    insight = agent.reflect(req.service, req.question)
    return insight.to_dict()


@app.get("/insights")
def list_insights(service: Optional[str] = None):
    bank_id = agent.bank_id(service) if service else None
    return [i.to_dict() for i in agent.store.list_insights(bank_id=bank_id)]


@app.get("/stats")
def stats():
    return agent.learning_stats()


@app.get("/", response_class=HTMLResponse)
@app.get("/ui", response_class=HTMLResponse)
def serve_ui():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    dist_html = os.path.join(repo_root, "frontend", "dist", "index.html")
    legacy_html = os.path.join(repo_root, "frontend", "index.html")
    target_html = dist_html if os.path.isfile(dist_html) else legacy_html
    if os.path.isfile(target_html):
        return FileResponse(target_html, media_type="text/html")
    return HTMLResponse("<h1>OpsMind AI backend is running.</h1><p>Frontend file not found.</p>")


@app.post("/demo/seed")
def seed_demo():
    try:
        DEFAULT_SAMPLE_INCIDENTS = [
            {
                "service": "payments",
                "title": "Payments API returning 500s",
                "description": "Payments API started returning 500 errors shortly after the 2pm deploy. Connection pool exhausted under normal traffic.",
                "severity": "SEV2",
                "tags": ["payments", "5xx", "deploy"],
                "root_cause": "The DB connection pool size was left at its low default after a config refactor, so it saturated under normal peak traffic.",
                "resolution": "Raised the connection pool size and added a pre-deploy check that fails the build if pool size drops below a safe threshold."
            },
            {
                "service": "payments",
                "title": "Payments API 500s again",
                "description": "Payments API is throwing 500s again, right after this morning's deploy. Looks like connection pool exhaustion.",
                "severity": "SEV2",
                "tags": ["payments", "5xx", "deploy"],
                "root_cause": "Same as before: pool size regressed after a redeploy of the base image.",
                "resolution": "Applied the same pool-size fix from the prior incident. Filed a follow-up to bake the pool-size check into the base image itself."
            },
            {
                "service": "notifications",
                "title": "Emails delayed by up to 40 minutes",
                "description": "Outbound email queue is backing up. SMTP provider dashboard shows elevated latency on their end.",
                "severity": "SEV3",
                "tags": ["notifications", "smtp", "latency"],
                "root_cause": "Upstream SMTP provider had a regional outage; our retry backoff was too conservative to drain the backlog quickly once they recovered.",
                "resolution": "Manually triggered a faster-retry drain job and lowered the base backoff for transient 4xx responses from the provider."
            },
            {
                "service": "auth",
                "title": "Login failures spiking for EU users",
                "description": "EU users report intermittent login failures. Error rate correlates with a spike in rate-limiter rejections.",
                "severity": "SEV2",
                "tags": ["auth", "rate-limit", "eu"],
                "root_cause": "A CDN cache-key change caused many distinct users to share one rate-limit bucket by IP instead of by session.",
                "resolution": "Reverted the cache-key change and switched the rate limiter to key on session token instead of IP."
            }
        ]

        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        data_file = os.path.join(repo_root, "data", "sample_incidents.json")

        if os.path.isfile(data_file):
            with open(data_file, "r", encoding="utf-8") as f:
                records = json.load(f)
        else:
            records = DEFAULT_SAMPLE_INCIDENTS

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

        return {"status": "ok", "loaded_count": len(loaded), "incidents": loaded}
    except Exception as e:
        return {"status": "error", "message": str(e), "loaded_count": 0, "incidents": []}
