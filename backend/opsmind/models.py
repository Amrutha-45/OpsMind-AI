"""Plain-dataclass domain models — no ORM/pydantic dependency required."""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field, asdict
from typing import Optional


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


def now_iso() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


@dataclass
class SimilarIncident:
    """A recalled memory surfaced as a 'this looks like something we've
    seen before' suggestion when a new incident is opened."""

    text: str
    memory_type: str
    score: float


@dataclass
class Incident:
    id: str
    service: str
    title: str
    description: str
    severity: str = "SEV3"          # SEV1..SEV4
    status: str = "open"            # open | resolved
    created_at: str = field(default_factory=now_iso)
    resolved_at: Optional[str] = None
    root_cause: Optional[str] = None
    resolution: Optional[str] = None
    tags: list[str] = field(default_factory=list)
    # populated by the agent at creation time ("apply" step)
    similar_past_incidents: list[SimilarIncident] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)

    @staticmethod
    def create(service: str, title: str, description: str,
               severity: str = "SEV3", tags: Optional[list[str]] = None) -> "Incident":
        return Incident(
            id=new_id("inc"),
            service=service,
            title=title,
            description=description,
            severity=severity,
            tags=tags or [],
        )


@dataclass
class Insight:
    """The output of a `reflect` call — a synthesized, cited answer to a
    standing question like 'What keeps causing payments outages?'."""

    id: str
    bank_id: str
    question: str
    answer: str
    based_on: list[dict] = field(default_factory=list)
    confidence: Optional[float] = None
    created_at: str = field(default_factory=now_iso)

    def to_dict(self) -> dict:
        return asdict(self)

    @staticmethod
    def create(bank_id: str, question: str, answer: str,
               based_on: Optional[list[dict]] = None,
               confidence: Optional[float] = None) -> "Insight":
        return Insight(
            id=new_id("insight"),
            bank_id=bank_id,
            question=question,
            answer=answer,
            based_on=based_on or [],
            confidence=confidence,
        )


@dataclass
class SuggestionFeedback:
    """Tracks whether a responder found a recalled/reflected suggestion
    useful. This is the 'improve' loop: acceptance rates feed back into
    how confidently the agent surfaces future suggestions."""

    id: str
    incident_id: str
    suggestion_text: str
    was_helpful: bool
    created_at: str = field(default_factory=now_iso)

    def to_dict(self) -> dict:
        return asdict(self)

    @staticmethod
    def create(incident_id: str, suggestion_text: str, was_helpful: bool) -> "SuggestionFeedback":
        return SuggestionFeedback(
            id=new_id("fb"),
            incident_id=incident_id,
            suggestion_text=suggestion_text,
            was_helpful=was_helpful,
        )
