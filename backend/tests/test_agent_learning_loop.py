import os
import tempfile
import unittest

from opsmind.agent import OpsMindAgent
from opsmind.hindsight_client import Hindsight
from opsmind.store import Store
from .fake_hindsight_server import FakeHindsightServer


class TestAgentLearningLoop(unittest.TestCase):
    def setUp(self):
        self.tmp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.tmp_db.close()
        self._agents: list[OpsMindAgent] = []

    def tearDown(self):
        for ag in self._agents:
            ag.close()
        try:
            os.unlink(self.tmp_db.name)
        except (PermissionError, FileNotFoundError):
            pass

    def _agent(self, base_url: str) -> OpsMindAgent:
        ag = OpsMindAgent(
            hindsight=Hindsight(base_url=base_url),
            store=Store(self.tmp_db.name),
        )
        self._agents.append(ag)
        return ag

    def test_full_remember_recall_apply_learn_improve_cycle(self):
        with FakeHindsightServer() as srv:
            agent = self._agent(srv.url)

            # --- Incident #1: no history yet, nothing to recall ---
            inc1 = agent.on_incident_opened(
                service="payments",
                title="Payments API 500s",
                description="Connection pool exhausted after the 2pm deploy",
                severity="SEV2",
            )
            self.assertEqual(inc1.status, "open")
            # REMEMBER retains this incident before RECALL runs, so the only
            # thing recall can possibly surface here is the incident's own
            # just-retained memory -- there is no *prior* incident yet.
            self.assertTrue(all(inc1.title in s.text for s in inc1.similar_past_incidents))

            # Resolve it -> REMEMBER the fix
            resolved1 = agent.on_incident_resolved(
                inc1.id,
                root_cause="Connection pool size was left at the default after a config refactor",
                resolution="Bumped pool size and added a pre-deploy pool-size check",
            )
            self.assertEqual(resolved1.status, "resolved")

            # --- Incident #2: same symptom -> RECALL should surface incident #1, APPLY suggests it ---
            inc2 = agent.on_incident_opened(
                service="payments",
                title="Payments API 500s again",
                description="Connection pool exhausted right after a deploy",
                severity="SEV2",
            )
            self.assertGreaterEqual(len(inc2.similar_past_incidents), 1)
            surfaced_text = " ".join(s.text for s in inc2.similar_past_incidents)
            self.assertIn("pool", surfaced_text.lower())

            # Bank isolation: an unrelated service must not see payments' memories
            inc_other = agent.on_incident_opened(
                service="notifications",
                title="Emails delayed",
                description="SMTP queue backing up",
            )
            self.assertTrue(all(inc_other.title in s.text for s in inc_other.similar_past_incidents))
            self.assertFalse(any("pool" in s.text.lower() for s in inc_other.similar_past_incidents))

            # --- LEARN: reflect synthesizes an insight across both payments incidents ---
            insight = agent.reflect("payments", "Why do payments outages keep happening?")
            self.assertIn("pool", insight.answer.lower())
            self.assertTrue(len(insight.based_on) >= 1)

            stored_insights = agent.store.list_insights(bank_id=agent.bank_id("payments"))
            self.assertEqual(len(stored_insights), 1)

            # --- IMPROVE: record whether the recalled suggestion actually helped ---
            agent.record_feedback(inc2.id, suggestion_text=surfaced_text, was_helpful=True)
            agent.record_feedback(inc2.id, suggestion_text="unrelated suggestion", was_helpful=False)

            stats = agent.learning_stats()
            self.assertEqual(stats["total_feedback"], 2)
            self.assertEqual(stats["helpful"], 1)
            self.assertAlmostEqual(stats["acceptance_rate"], 0.5)

            # Feedback is itself retained as memory, so a later reflect can
            # reason about what has actually helped responders.
            feedback_insight = agent.reflect("payments", "connection pool")
            self.assertTrue(len(feedback_insight.based_on) >= 1)

    def test_incident_resolution_survives_hindsight_outage(self):
        """Memory is best-effort: an unreachable Hindsight server must
        never prevent an incident from being opened or resolved."""
        unreachable = Hindsight(base_url="http://127.0.0.1:1")
        agent = OpsMindAgent(hindsight=unreachable, store=Store(self.tmp_db.name))

        inc = agent.on_incident_opened("payments", "Test", "Description")
        self.assertEqual(inc.status, "open")
        self.assertEqual(inc.similar_past_incidents, [])

        resolved = agent.on_incident_resolved(inc.id, root_cause="x", resolution="y")
        self.assertEqual(resolved.status, "resolved")


if __name__ == "__main__":
    unittest.main()
