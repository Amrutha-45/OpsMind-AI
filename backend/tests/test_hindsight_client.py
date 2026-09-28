import unittest

from opsmind.hindsight_client import Hindsight, HindsightError
from .fake_hindsight_server import FakeHindsightServer


class TestHindsightClient(unittest.TestCase):
    def test_health(self):
        with FakeHindsightServer() as srv:
            client = Hindsight(base_url=srv.url)
            self.assertEqual(client.health(), {"status": "ok"})

    def test_retain_then_recall_roundtrip(self):
        with FakeHindsightServer() as srv:
            client = Hindsight(base_url=srv.url)
            client.retain(bank_id="team-payments", content="Payments API returned 500s after the 2pm deploy")
            client.retain(bank_id="team-payments", content="Root cause was a stale feature flag")
            client.retain(bank_id="team-auth", content="Login rate limiter misconfigured causing lockouts")

            result = client.recall(bank_id="team-payments", query="payments 500 errors after deploy")
            self.assertGreaterEqual(len(result), 1)
            self.assertTrue(any("500" in m.text for m in result))

            # bank isolation: auth memories must never leak into payments recall
            self.assertFalse(any("lockout" in m.text.lower() for m in result))

    def test_recall_empty_bank_returns_no_results(self):
        with FakeHindsightServer() as srv:
            client = Hindsight(base_url=srv.url)
            result = client.recall(bank_id="brand-new-bank", query="anything")
            self.assertEqual(len(result), 0)

    def test_reflect_synthesizes_across_memories(self):
        with FakeHindsightServer() as srv:
            client = Hindsight(base_url=srv.url)
            client.retain(bank_id="team-payments", content="outage: connection pool exhausted after deploy")
            client.retain(bank_id="team-payments", content="outage: connection pool exhausted again, same fix")
            response = client.reflect(bank_id="team-payments", query="connection pool exhausted")
            self.assertIn("connection pool exhausted", response.text)
            self.assertEqual(len(response.based_on), 2)
            self.assertGreater(response.confidence, 0)

    def test_unreachable_server_raises_hindsight_error(self):
        client = Hindsight(base_url="http://127.0.0.1:1")  # nothing listens here
        with self.assertRaises(HindsightError):
            client.health()


if __name__ == "__main__":
    unittest.main()
