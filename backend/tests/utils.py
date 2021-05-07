import flask_unittest  # type: ignore


class AirbookTestCase(flask_unittest.ClientTestCase):
    def staff_login(self, client):
        response = client.post(
            "/login/staff", json=dict(username="staffnumberone", password="wendy")
        )
        assert response.json["result"] == "success"
