import flask_unittest  # type: ignore
from flask import request, Flask
from backend.app import app


class TestSession(flask_unittest.ClientTestCase):
    app = app

    def test_get_ticket_price(self, client):
        response = client.post(
            "/ticket_price",
            json=dict(flight_number=2323, dep_date="2021-5-28", dep_time="15:31:14"),
        )
        self.assertEqual(response.json["result"], "success")
        self.assertEqual(response.json["data"], dict(price=45))

    def test_purchase_ticket(self, client):
        response = client.post(
            "/login/cust", json=dict(email="speiaz123@nyu.edu", password="wendy")
        )
        assert response.json["result"] == "success"

        response = client.post(
            "/ticket_purchase",
            json=dict(
                flight_number=2323,
                dep_date="2021-5-28",
                dep_time="15:31:14",
                email="asd@asd.com",
                card_type="debt",
                card_number="1812938912",
                name_on_card="tesasd",
                exp_date="2024-04-23",
                airline_name="China Eastern",
            ),
        )
        self.assertEqual(response.json["result"], "success")
