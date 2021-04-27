import flask_unittest # type: ignore
import json

from flask import request, Flask, session
from backend.app import app

class TestSearch(flask_unittest.ClientTestCase):
    app = app
    def setUp(self, client):
        self.future_flights = [
            [
                2323,
                "2021-05-28",
                "15:31:14",
                "JFK",
                "2021-05-29",
                "12:40:14",
                "MSC",
                "45.00",
                "delayed",
                22,
                'China Eastern'
            ],
            [
                7777,
                '2022-05-28',
                '15:31:14',
                'MSC',
                '2022-05-29',
                '12:40:14',
                'JFK',
                '1000.00',
                'ontime',
                20,
                "China Eastern"
            ]
        ]

    def test_public_search(self, client):
        response = client.post('/search-public/all_future')
        self.assertEqual('success', response.json['result'])
        self.assertEqual(self.future_flights, json.loads(response.json['data']))

    def test_search(self, client):
        response = client.post('/login/cust', json=dict(email='speiaz123@nyu.edu', password='wendy'))
        assert dict(result='success') == response.json 

        response = client.post('/search/customer_future')
        self.assertEqual('success', response.json['result'])
        
        response = client.post('/search/customer_tickets')
        self.assertEqual('success', response.json['result'])
        expected = [
            [
                1,
                "speiaz123@nyu.edu",
                "40.00",
                "credit",
                "2323555502015234",
                "Sepia Hi",
                "2027-04-23",
                "2021-03-22",
                "15:30:22",
                "Evergreen",
                12345,
                "2021-03-28",
                "13:33:44",
                None
            ]
        ]
        self.assertEqual(expected, json.loads(response.json['data']))

    def test_search_errors(self, client):
        response = client.post('/search-public/asd')
        self.assertEqual(dict(result='error', message='The requested filter \"asd\" does not exist!'), response.json)
        
        response = client.post('/login/cust', json=dict(email='speiaz123@nyu.edu', password='wendy'))
        assert dict(result='success') == response.json 

        response = client.post('/search/customer_future', json=dict(filter_data=dict(email='someoneelse@nyu.edu')))
        self.assertEqual(dict(result='error', message='Malformed request! Are you attempting to pass your email address?'), response.json)

        response = client.post('/login/staff', json=dict(username='staffnumberone', password='wendy'))
        assert dict(result='success') == response.json

        response = client.post('/search/advanced_spendings', json=dict(filter_data={}))
        self.assertEqual(dict(result='error', message='Missing required key "emails"!', key='emails'), response.json)
    
    def test_search_access_control(self, client):
        response = client.post('/search/customer_future')
        self.assertEqual(dict(result='error', message='Looks like you are trying to access something that requires login.'), response.json)
        
        response = client.post('/search-public/customer_future')
        self.assertEqual(dict(result='error', message='You don\'t have the permission to use this filter!'), response.json)

        # Login with agent and tries to get future flights
        response = client.post('/login/agent', json=dict(booking_agent_id=1, email='book3083@booking.com', password='best123'))
        assert dict(result='success') == response.json 

        response = client.post('/search/customer_future')
        self.assertEqual(dict(result='error', message='You don\'t have the permission to use this filter!'), response.json)
    
    def test_search_advanced_flight(self, client):
        response = client.post('/login/agent', json=dict(booking_agent_id=1, email='book3083@booking.com', password='best123'))
        assert dict(result='success') == response.json 

        response = client.post('/search/advanced_flight', json=dict(filter_data=dict(dep_date_lower='2021-05-27', dep_date_upper='2022-05-29')))
        self.assertEqual('success', response.json['result'])
        self.assertEqual(self.future_flights, json.loads(response.json['data']))
        
        filter_data = dict(
            dep_date_lower='2022-01-01',
            dep_date_upper='2023-01-01',
            dep_time_lower='00:15:44',
            dep_time_upper='23:15:44',
            arr_date_lower='2022-01-01',
            arr_date_upper='2023-01-01',
            arr_time_lower='00:15:44',
            arr_time_upper='23:15:44',
            arr_airport='JFK',
            arr_city='New York City',
            dep_airport='MSC',
            dep_city='Secchi',
        )
        expected = [
            [
                'JFK',
                'MSC',
                20,
                "China Eastern",
                7777,
                '2022-05-28',
                '15:31:14',
                '2022-05-29',
                '12:40:14',
                '1000.00',
                'ontime',
                60,
                'Secchi',
                'New York City',
            ]
        ]
        
        response = client.post('/search/advanced_flight', json=dict(filter_data=filter_data))
        self.assertEqual('success', response.json['result'])
        self.assertEqual(expected, json.loads(response.json['data']))

    def test_search_advanced_spendings(self, client):
        response = client.post('/login/cust', json=dict(email='ny2311@nyu.edu', password='best123'))
        assert dict(result='success') == response.json

        response = client.post('/search/advanced_spendings', json=dict(filter_data={}))
        expected = [
            ['2021-03-24', '40.00'], 
            ['2021-04-24', '104.50'], 
            ['2021-12-24', '2025.00']
        ]
        self.assertEqual('success', response.json['result'])
        self.assertEqual(expected, json.loads(response.json['data']))
        
        response = client.post('/search/advanced_spendings', json=dict(filter_data=dict(group='YEAR')))
        expected = [
            [2021, '2169.50']
        ]
        self.assertEqual('success', response.json['result'])
        self.assertEqual(expected, json.loads(response.json['data']))
