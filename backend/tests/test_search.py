import flask_unittest
import json

from flask import request, Flask, session
from backend.app import app

class TestSearch(flask_unittest.ClientTestCase):
    app = app

    def test_public_search(self, client):
        response = client.post('/search-public/all_future')
        self.assertEqual('success', response.json['result'])
        expected = [
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
                'China Eastern'],
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
        self.assertEqual(expected, json.loads(response.json['data']))

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
