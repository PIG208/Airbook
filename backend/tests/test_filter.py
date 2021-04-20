import unittest

from datetime import date, time, datetime
from backend.utils.filter import get_filter_flight, get_filter_spendings, FilterGroup, FilterRange, FilterSet, FilterRange

class TestFilter(unittest.TestCase):
    def test_filter_spendings_one_or_empty(self):
        result = get_filter_spendings(FilterSet({'ny2311@nyu.edu'}))
        expected = ('SELECT purchase_date, actual_price FROM spendings WHERE email=%s', ['ny2311@nyu.edu'])
        self.assertEqual(expected, result)

        result = get_filter_spendings(FilterSet({}))
        expected = ('SELECT purchase_date, actual_price FROM spendings ', [])
        self.assertEqual(expected, result)
    
    def test_filter_spendings_many(self):
        result = get_filter_spendings(FilterSet(['asd','ddd']))
        expected = ('SELECT purchase_date, actual_price FROM spendings WHERE email IN (%s,%s)', ['ddd', 'asd'])
        self.assertEqual(expected, result)
    
    def test_filter_flight_empty(self):
        result = get_filter_flight()
        expected = ('SELECT * FROM Flight ', [])
        self.assertEqual(expected, result)
    
    def test_filter_flight_email(self):
        result = get_filter_flight(customer_emails=FilterSet(["ny123@nyu.edu"]))
        expected = ('SELECT * FROM Flight WHERE email=%s', ["ny123@nyu.edu"])
        self.assertEqual(expected, result)
        
        result = get_filter_flight(customer_emails=FilterSet(["ny233@nyu.edu", "ny123@nyu.edu"]))
        expected = ('SELECT * FROM Flight WHERE email IN (%s,%s)', ["ny123@nyu.edu", "ny233@nyu.edu"])
        self.assertEqual(expected, result)
    
    def test_filter_flight_airport_city(self):
        result = get_filter_flight(
            dep_airport='JFK',
            dep_city='New York City',
            arr_airport='ASD',
            arr_city='ASD City',
        )
        expected = ('SELECT * FROM Flight WHERE dep_airport=%s AND arr_airport=%s AND dep_city=%s AND arr_city=%s', ['JFK', 'ASD', 'New York City', 'ASD City'])
        self.assertEqual(expected, result)
    
    def test_filter_flight_all(self):
        date_range = FilterRange('2020-11-22', '2020-11-23')
        time_range = FilterRange('06:15:44', '10:15:44')
        result = get_filter_flight(
            dep_date_range=date_range,
            dep_time_range=time_range,
            arr_date_range=date_range,
            arr_time_range=time_range,
            dep_airport='JFK',
            dep_city='New York City',
            arr_airport='ASD',
            arr_city='ASD City',
        )
        expected = ('SELECT * FROM Flight WHERE dep_date > "2020-11-22" AND dep_date < "2020-11-23" AND dep_time > "06:15:44" AND dep_time < "10:15:44" AND arr_date > "2020-11-22" AND arr_date < "2020-11-23" AND arr_time > "06:15:44" AND arr_time < "10:15:44" AND dep_airport=%s AND arr_airport=%s AND dep_city=%s AND arr_city=%s', ['JFK', 'ASD', 'New York City', 'ASD City'])
        self.assertEqual(expected, result)