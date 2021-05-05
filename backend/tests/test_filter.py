import unittest

from datetime import date, time, datetime
from typing import Tuple, Any
from backend.utils.filter import (
    get_filter_flight,
    get_filter_spendings,
    FilterGroup,
    FilterRange,
    FilterSet,
    FilterRange,
)


class TestFilter(unittest.TestCase):
    def test_filter_spendings_one_or_empty(self):
        result = get_filter_spendings(
            FilterSet({"ny2311@nyu.edu"}), FilterRange(), FilterRange()
        )
        expected = (
            "SELECT purchase_date, actual_price FROM spendings WHERE email=%s",
            ["ny2311@nyu.edu"],
        )
        self.assertEqual(expected, result)

        result = get_filter_spendings(FilterSet({}), FilterRange(), FilterRange())
        expected: Tuple[Any, Any] = (
            "SELECT purchase_date, actual_price FROM spendings ",
            [],
        )
        self.assertEqual(expected, result)

    def test_filter_spendings_many(self):
        result = get_filter_spendings(
            FilterSet(["asd", "ddd"]), FilterRange(), FilterRange()
        )
        expected = (
            "SELECT purchase_date, actual_price FROM spendings WHERE email IN (%s,%s)",
            ["asd", "ddd"],
        )
        self.assertEqual(expected[0], result[0])
        self.assertCountEqual(expected[1], result[1])

    def test_filter_flight_empty(self):
        result = get_filter_flight(
            FilterRange(), FilterRange(), FilterRange(), FilterRange()
        )
        expected: Tuple[Any, Any] = ("SELECT * FROM verbose_flights ", list())
        self.assertEqual(expected, result)

    def test_filter_flight_email(self):
        result = get_filter_flight(
            FilterRange(),
            FilterRange(),
            FilterRange(),
            FilterRange(),
            emails=FilterSet(["ny123@nyu.edu"]),
            filter_by_emails=True,
        )
        expected = (
            "SELECT * FROM verbose_flights WHERE (EXISTS (SELECT * FROM Ticket WHERE email=%s AND (Ticket.dep_date, Ticket.dep_time, Ticket.flight_number)=(verbose_flights.dep_date, verbose_flights.dep_time, verbose_flights.flight_number)))",
            ["ny123@nyu.edu"],
        )
        self.assertEqual(expected, result)

        result = get_filter_flight(
            FilterRange(),
            FilterRange(),
            FilterRange(),
            FilterRange(),
            emails=FilterSet(["ny233@nyu.edu", "ny123@nyu.edu"]),
            filter_by_emails=True,
        )
        expected = (
            "SELECT * FROM verbose_flights WHERE (EXISTS (SELECT * FROM Ticket WHERE email IN (%s,%s) AND (Ticket.dep_date, Ticket.dep_time, Ticket.flight_number)=(verbose_flights.dep_date, verbose_flights.dep_time, verbose_flights.flight_number)))",
            ["ny123@nyu.edu", "ny233@nyu.edu"],
        )
        self.assertEqual(expected[0], result[0])
        self.assertCountEqual(expected[1], result[1])

    def test_filter_flight_airport_city(self):
        result = get_filter_flight(
            FilterRange(),
            FilterRange(),
            FilterRange(),
            FilterRange(),
            dep_airport="JFK",
            dep_city="New York City",
            arr_airport="ASD",
            arr_city="ASD City",
        )
        expected = (
            "SELECT * FROM verbose_flights WHERE dep_airport=%s AND arr_airport=%s AND dep_city=%s AND arr_city=%s",
            ["JFK", "ASD", "New York City", "ASD City"],
        )
        self.assertEqual(expected, result)

    def test_filter_flight_all(self):
        date_range = FilterRange("2020-11-22", "2020-11-23")
        time_range = FilterRange("06:15:44", "10:15:44")
        result = get_filter_flight(
            dep_date_range=date_range,
            dep_time_range=time_range,
            arr_date_range=date_range,
            arr_time_range=time_range,
            dep_airport="JFK",
            dep_city="New York City",
            arr_airport="ASD",
            arr_city="ASD City",
        )
        print(result)
        expected = (
            "SELECT * FROM verbose_flights WHERE dep_airport=%s \
                AND arr_airport=%s AND dep_city=%s AND arr_city=%s \
                    AND (dep_date > %s AND dep_date < %s OR ((dep_date=%s AND dep_time > %s) OR (dep_date=%s AND dep_time < %s))) \
                        AND (arr_date > %s AND arr_date < %s OR ((arr_date=%s AND arr_time > %s) OR (arr_date=%s AND arr_time < %s)))",
            [
                "JFK",
                "ASD",
                "New York City",
                "ASD City",
                "2020-11-22",
                "2020-11-23",
                "2020-11-22",
                "06:15:44",
                "2020-11-23",
                "10:15:44",
                "2020-11-22",
                "2020-11-23",
                "2020-11-22",
                "06:15:44",
                "2020-11-23",
                "10:15:44",
            ],
        )
        self.assertEqual(expected, result)
