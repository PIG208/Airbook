import flask_unittest  # type: ignore
from flask import request, Flask
from backend.app import app


class TestSession(flask_unittest.ClientTestCase):
    app = app

    def test_session_fetch_denied(self, client):
        response = client.post("/session-fetch")
        self.assertEqual("error", response.json["result"])
        # self.assertEqual(dict(result="success"), response.json)

    def test_session_customer(self, client):
        response = client.post(
            "/login/cust", json=dict(email="speiaz123@nyu.edu", password="wendy")
        )
        assert response.json["result"] == "success"

        response = client.post("/session-fetch")
        expected = {
            "user_type": "cust",
            "building_number": 123,
            "city": "Warta City",
            "date_of_birth": "Thu, 11 Jan 2001 00:00:00 GMT",
            "email": "speiaz123@nyu.edu",
            "name": "sepia H",
            "passport_country": "Cambodia",
            "passport_expiration": "Fri, 24 May 2024 00:00:00 GMT",
            "passport_number": "YCZ22344",
            "phone_number": "1234561",
            "state": "",
            "street": "Book St.",
        }

        self.assertEqual(response.json["result"], "success")
        self.assertEqual(response.json["user_data"], expected)

    def test_session_staff(self, client):
        response = client.post(
            "/login/staff", json=dict(username="staffnumberone", password="wendy")
        )
        assert response.json["result"] == "success"

        response = client.post("/session-fetch")
        expected = {
            "user_type": "staff",
            "airline_name": "China Eastern",
            "date_of_birth": "Tue, 04 Feb 1992 00:00:00 GMT",
            "first_name": "Jessie",
            "last_name": "Pinkman",
            "username": "staffnumberone",
        }

        self.assertEqual(response.json["result"], "success")
        self.assertEqual(response.json["user_data"], expected)

    def test_session_agent(self, client):
        response = client.post(
            "/login/agent",
            json=dict(
                booking_agent_id=1, email="book3083@booking.com", password="best123"
            ),
        )
        assert response.json["result"] == "success"

        response = client.post("/session-fetch")
        expected = {
            "user_type": "agent",
            "agent_id": 1,
            "email": "book3083@booking.com",
        }

        self.assertEqual(response.json["result"], "success")
        self.assertEqual(response.json["user_data"], expected)
