"""
agent.py
--------
OpsMindAgent is the brain of the incident-response agent. It wires
Hindsight's retain / recall / reflect primitives into the five-stage
loop the hackathon asks for:

    REMEMBER  -> agent.on_incident_opened() / on_incident_resolved()
                 call hindsight.retain() so every incident and its
                 resolution becomes a durable memory.

    RECALL    -> agent.on_incident_opened() also calls hindsight.recall()
                 to surface prior incidents with similar symptoms.

    APPLY     -> the recalled incidents are attached to the new incident
                 as `similar_past_incidents`, which the API/UI shows to
                 the responder as actionable suggestions ("last time this
                 happened, X fixed it").

    LEARN     -> agent.reflect() calls hindsight.reflect(), which
                 reasons *across* many retained incidents to produce a
                 standing insight ("payments outages are almost always
                 caused by connection-pool exhaustion after deploys").

    IMPROVE   -> agent.record_feedback() stores whether a responder found
                 a suggestion useful. Nothing here is thrown away — it is
                 retained back into Hindsight as its own memory, so future
                 recall/reflect calls are shaped by what has actually
                 helped responders before, not just by raw incident text.
"""

from __future__ import annotations

from typing import Optional

from .config import settings
from .hindsight_client import Hindsight, HindsightError
from .models import Incident, Insight, SimilarIncident, SuggestionFeedback
from .store import Store


class OpsMindAgent:
    def __init__(self, hindsight: Optional[Hindsight] = None, store: Optional[Store] = None):
        self.hindsight = hindsight or Hindsight(
            base_url=settings.hindsight_base_url,
            api_key=settings.hindsight_api_key,
            tenant=settings.hindsight_tenant,
        )
        self.store = store or Store(settings.db_path)

    def close(self) -> None:
        if self.store is not None:
            self.store.close()

    def bank_id(self, service: str) -> str:
        """One memory bank per service keeps incident knowledge isolated,
        the same way Hindsight recommends one bank per user for chat
        personalization."""
        safe = "".join(c if c.isalnum() or c in "-_" else "-" for c in service.lower())
        return f"{settings.bank_prefix}-{safe}"

    # ---------------------------------------------------------------- REMEMBER + RECALL + APPLY

    def on_incident_opened(self, service: str, title: str, description: str,
                            severity: str = "SEV3", tags: Optional[list[str]] = None) -> Incident:
        incident = Incident.create(service, title, description, severity, tags)
        bank = self.bank_id(service)

        # RECALL + APPLY: search ONLY PREVIOUSLY COMMITTED/RESOLVED memories in this bank.
        # The current incident is NOT added to permanent memory until it is resolved by an operator.
        try:
            recalled = self.hindsight.recall(
                bank_id=bank,
                query=f"{title}. {description}",
                max_results=settings.recall_limit,
            )
            filtered_results = []
            for m in recalled.results:
                m_meta = m.metadata or {}
                # Exclude self-matches: match by incident ID in metadata, context, or content
                if m_meta.get("incident_id") == incident.id:
                    continue
                if f"incident:{incident.id}" in m.text or incident.id in str(m_meta):
                    continue
                if m.text.startswith(f"Incident opened: {title}"):
                    continue
                # Exclude memories below similarity threshold
                if m.score < settings.similarity_threshold:
                    continue
                filtered_results.append(
                    SimilarIncident(text=m.text, memory_type=m.type, score=m.score)
                )

            incident.similar_past_incidents = filtered_results
        except HindsightError:
            incident.similar_past_incidents = []

        self.store.save_incident(incident)
        return incident

    # ---------------------------------------------------------------- REMEMBER (resolution)

    def on_incident_resolved(self, incident_id: str, root_cause: str, resolution: str) -> Incident:
        incident = self.store.get_incident(incident_id)
        if incident is None:
            raise KeyError(f"Unknown incident: {incident_id}")

        incident.status = "resolved"
        incident.root_cause = root_cause
        incident.resolution = resolution
        from .models import now_iso
        incident.resolved_at = now_iso()

        bank = self.bank_id(incident.service)

        # REMEMBER: the resolution is the highest-value memory in the
        # whole system — it's what makes the *next* similar incident
        # resolve faster.
        try:
            self.hindsight.retain(
                bank_id=bank,
                content=(
                    f"Incident resolved: {incident.title}. "
                    f"Root cause: {root_cause}. Resolution: {resolution}."
                ),
                context=f"incident:{incident.id}",
                metadata={"incident_id": incident.id, "phase": "resolved"},
            )
        except HindsightError:
            pass

        self.store.save_incident(incident)
        return incident

    # ---------------------------------------------------------------- LEARN

    def reflect(self, service: str, question: str) -> Insight:
        """Ask Hindsight to reason across every retained incident for a
        service and produce a standing, cited insight. This is what
        turns a pile of past tickets into something an on-call engineer
        can actually read at 3am."""
        bank = self.bank_id(service)
        response = self.hindsight.reflect(bank_id=bank, query=question)
        insight = Insight.create(
            bank_id=bank,
            question=question,
            answer=response.text,
            based_on=response.based_on,
            confidence=response.confidence,
        )
        self.store.save_insight(insight)
        return insight

    # ---------------------------------------------------------------- IMPROVE

    def record_feedback(self, incident_id: str, suggestion_text: str, was_helpful: bool) -> SuggestionFeedback:
        feedback = SuggestionFeedback.create(incident_id, suggestion_text, was_helpful)
        self.store.save_feedback(feedback)

        incident = self.store.get_incident(incident_id)
        if incident is not None:
            bank = self.bank_id(incident.service)
            verdict = "was helpful" if was_helpful else "was NOT helpful"
            try:
                self.hindsight.retain(
                    bank_id=bank,
                    content=(
                        f"Responder feedback on incident {incident.id}: the suggestion "
                        f'"{suggestion_text}" {verdict}.'
                    ),
                    context=f"incident:{incident.id}:feedback",
                    metadata={"incident_id": incident.id, "phase": "feedback", "helpful": was_helpful},
                )
            except HindsightError:
                pass

        return feedback

    def learning_stats(self) -> dict:
        """A quick numeric snapshot of the improve loop, for the dashboard."""
        return self.store.feedback_stats()
