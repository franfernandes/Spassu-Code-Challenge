from django.test import SimpleTestCase


class VerificarSaudeTests(SimpleTestCase):
    def test_retorna_status_ok(self):
        response = self.client.get("/api/saude/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})
