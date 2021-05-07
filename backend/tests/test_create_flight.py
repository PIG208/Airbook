from backend.tests.utils import AirbookTestCase
from flask import request, Flask
from backend.app import app


class TestLogin(AirbookTestCase):
    app = app

    def test_create_flight_success(self, client):
        self.staff_login(client)

        response = client.post(
            "/create_flight",
            json=dict(
                arr_airport="JFK",
                arr_date="2021-05-03",
                arr_time="16:00:00",
                base_price="123",
                dep_airport="JFK",
                dep_date="2001-01-09",
                dep_time="16:00:00",
                flight_number="123",
                status="ontime",
                plane_ID=22,
            ),
        )

        self.assertEqual(
            response.get_json(),
            dict(
                result="success",
            ),
        )

    def test_create_invalid_plane_ID(self, client):
        self.staff_login(client)

        response = client.post(
            "/create_flight",
            json=dict(
                arr_airport="JFK",
                arr_date="2023-05-03",
                arr_time="16:00:00",
                base_price="123",
                dep_airport="JFK",
                dep_date="2002-01-09",
                dep_time="16:00:00",
                flight_number="123",
                status="ontime",
                plane_ID="23231",
            ),
        )

        self.assertEqual(
            response.get_json(),
            dict(result="error", message="The plane ID is invalid!"),
        )

    def test_arrival_before_departure(self, client):
        self.staff_login(client)

        response = client.post(
            "/create_flight",
            json=dict(
                arr_airport="JFK",
                arr_date="2021-05-03",
                arr_time="2021-05-03",
                base_price="123",
                dep_airport="JFK",
                dep_date="2022-01-09",
                dep_time="16:00:00",
                flight_number="123",
                status="ontime",
                plane_ID="1",
            ),
        )

        self.assertEqual(
            response.get_json(),
            dict(
                result="error",
                message="The arrival time needs to be after the arrival time!",
            ),
        )
