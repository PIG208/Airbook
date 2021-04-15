import flask_unittest

from flask import request, Flask
from backend.app import app

class TestLogin(flask_unittest.ClientTestCase):
    app = app

    def test_customer_login(self, client):
        response = client.post('/login/cust', json=dict(email='speiaz123@nyu.edu', password='wendy'))
        self.assertEqual(dict(result='success'), response.json)

    def test_staff_login(self, client):
        response = client.post('/login/staff', json=dict(username='staffnumberone', password='wendy'))
        self.assertEqual(dict(result='success'), response.json)
    
    def test_agent_login(self, client):
        response = client.post('/login/agent', json=dict(booking_agent_id=1, email='book3083@booking.com', password='best123'))
        self.assertEqual(dict(result='success'), response.json)

    def test_login_missing_key(self, client):
        response = client.post('/login/agent', json=dict(booking_agent_id='1', password='best123'))
        self.assertEqual(dict(result='error', message='Missing required key "email"!', key='email'), response.json)

        response = client.post('/login/staff', json=dict(password='wendy'))
        self.assertEqual(dict(result='error', message='Missing required key "username"!', key='username'), response.json)

        response = client.post('/login/cust', json=dict(password='wendy'))
        self.assertEqual(dict(result='error', message='Missing required key "email"!', key='email'), response.json)

    def test_login_missing_password(self, client):
        response = client.post('/login/agent', json=dict(booking_agent_id='1'))
        self.assertEqual(dict(result='error', message='Missing required key "password"!', key='password'), response.json)

    def test_login_wrong_password(self, client):
        response = client.post('/login/staff', json=dict(username='staffnumberone', password='wendy2'))
        self.assertEqual(dict(result='error', message='The input information or the password does not match!'), response.json)

    def test_login_non_existence_user(self, client):
        response = client.post('/login/cust', json=dict(email='speiaz123@nyu2.edu', password='wendy'))
        self.assertEqual(dict(result='error', message='The input information doesn\'t match any existing users!'), response.json)