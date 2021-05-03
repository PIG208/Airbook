from typing import (
    Any,
    Optional,
    TypeVar,
    Generic,
    Iterable,
    Union,
    Tuple,
    List,
    Set,
    Callable,
)
from enum import Enum, auto
from functools import partial
from datetime import date, time, datetime
from pymysql.connections import Connection
from backend.utils.error import QueryKeyError
from backend.utils.query import query

"""
Generate SQL queries for certain filters.
Support specifying date/time range for dep/arr date/time;
specifying  dep airport/city and arr airport/city;
The range can be one bounded. All conditions are optional.
A miss match between airport and city will result in an empty query.
Returns multiple query results if round_trip is set to True.
"""
T = TypeVar("T", int, str)
V = TypeVar("V", int, str)


class FilterRange(Generic[T]):
    def __init__(self, lower: Optional[T] = None, upper: Optional[T] = None):
        self._lower: Optional[T] = lower

        self._upper: Optional[T] = upper

    @property
    def lower(self) -> Optional[str]:
        if self._lower is not None:
            return str(self._lower)
        return None

    @property
    def upper(self) -> Optional[str]:
        if self._upper is not None:
            return str(self._upper)
        return None


class FilterGroup(Enum):
    DAY = "DAY"
    MONTH = "MONTH"
    YEAR = "YEAR"

    @classmethod
    def get_default(cls, value):
        try:
            return FilterGroup(value)
        except ValueError:
            return None


class FilterSet(Generic[V]):
    def __init__(self, filter_set: Optional[Iterable[V]]):
        # Note that the order doesn't matter here as the order of an iterable can be non-deterministic
        self._filter_set: Optional[Set[V]] = (
            {item for item in filter_set} if filter_set is not None else None
        )

    @property
    def filter_set(self):
        return self._filter_set

    def get_one(self):
        if self._filter_set is None or len(self._filter_set) == 0:
            return None
        try:
            return self._filter_set.pop()
        except TypeError:
            return None


class FilterType(Enum):
    ALL_FUTURE_FLIGHTS = "all_future"
    CUST_FUTURE_FLIGHTS = "customer_future"
    CUST_TICKETS = "customer_tickets"
    FLIGHT_COMMENTS = "flight_comments"
    # The following filters are advanced filters that require the filter generator.
    # We need to keep track of the advanced filters in the set ADVANCED_FILTERS.
    ADVANCED_FLIGHT = "advanced_flight"
    ADVANCED_SPENDINGS = "advanced_spendings"


SELECT_FLIGHT_COMMENTS = "SELECT * FROM Feedback WHERE flight_number={} AND dep_date=%(dep_date)s AND dep_time=%(dep_time)s"
SELECT_ALL_FUTURE_FLIGHTS = "SELECT * FROM future_flights;"
SELECT_CUSTOMER_TICKETS = (
    "call customer_tickets(%(email)s);"  # "email" must matches the key name for session
)
SELECT_CUSTOMER_FLIGHTS = "call customer_flights(%(email)s);"

FILTER_TO_QUERY_MAP = {
    FilterType.ALL_FUTURE_FLIGHTS: SELECT_ALL_FUTURE_FLIGHTS,
    FilterType.CUST_FUTURE_FLIGHTS: SELECT_CUSTOMER_FLIGHTS,
    FilterType.CUST_TICKETS: SELECT_CUSTOMER_TICKETS,
}

ADVANCED_FILTERS = {
    FilterType.ADVANCED_FLIGHT,
    FilterType.ADVANCED_SPENDINGS,
}


def is_advanced_filter(filter: FilterType):
    return filter in ADVANCED_FILTERS


class Filter:
    def __init__(self, base_query: str):
        self.base_query = base_query
        self.where_clause: List[str] = []
        self.string_values: List[str] = []

    def add_filter_range(self, column_name: str, range: Optional[FilterRange[T]]):
        """
        Create a ranged constraint bounded by a specified range. (String formatting is safe as soon as the type is legal)
        """
        if range is None:
            return self

        result = []
        if range.lower is not None:
            result.append("{column_name} > %s".format(column_name=column_name))
            self.string_values.append(range.lower)

        if range.upper is not None:
            result.append("{column_name} < %s".format(column_name=column_name))
            self.string_values.append(range.upper)

        if len(result) > 0:
            self.where_clause.append(" AND ".join(result))

        return self

    def add_filter_set(
        self,
        column_name: str,
        filter_set: Optional[Union[FilterSet[str], FilterSet[int]]],
    ):
        if filter_set is None or filter_set.filter_set is None:
            return self
        if len(filter_set.filter_set) <= 1:
            self.add_optional_constraint(column_name, filter_set.get_one())
            return self
        result = ["%s" for i in range(len(filter_set.filter_set))]
        for value in filter_set.filter_set:
            self.string_values.append(value)
        if len(result) > 0:
            self.where_clause.append(
                "{column_name} IN ({filter_set})".format(
                    column_name=column_name, filter_set=",".join(result)
                )
            )
        return self

    def add_aggregated(self, column_name: str, func_name: str):
        pass

    def add_optional_constraint(self, column_name: str, constraint: Optional[T]):
        """
        Create a '=' constraint in the where clause if it's specified. The arguments still need to be
        passed to cursor.execute as we cannot trust user inputs of string values (like for airport name).
        """
        if constraint is None:
            return self
        else:
            if isinstance(constraint, int):
                self.where_clause.append("{}={}".format(column_name, str(constraint)))
            elif isinstance(constraint, str) and len(constraint.strip()) > 0:
                self.where_clause.append("{}=%s".format(column_name))
                self.string_values.append(constraint)
            return self

    def add_sub_filter(self, sub_filter):
        """
        This allows you to add a sub-filter for this filter.
        By convention, the sub-filter should be a predicate and it will be connected with other constraints
        in the parent-filter using `AND`.
        The advantage of adding a sub-filter is that each sub-filter is considered a separate constraint,
        just like the other ones, and we can deal with the string values that needs to be inserted to the sub-filter.
        """
        if sub_filter is None:
            return self
        assert isinstance(sub_filter, Filter)
        sql, values = sub_filter.get_formatted()
        if sql.strip() != "":
            self.where_clause.append("({})".format(sql))
        for value in values:
            self.string_values.append(value)
        return self

    def add_static_filter(self, predicate: str, *values):
        self.where_clause.append(predicate)
        for value in values:
            self.string_values.append(value)
        return self

    def conditonally_add(self, condition: bool, func: Callable, *args: Any):
        # We use this to avoid calling functions from instances of filter.
        try:
            func_ = getattr(self, func.__name__)
        except AttributeError:
            raise AssertionError(
                "conditionally_add expects to take an add function from filter!"
            )
        if condition:
            func_(*args)

        return self

    def get_formatted(self) -> Tuple[str, list]:
        """
        Returns a query string, formatted, and the values left for string interpolation.
        """
        if len(self.where_clause) > 0 and "{where}" not in self.base_query:
            raise ValueError("Placeholder for the where clause is not found.")
        return (
            self.base_query.format(
                where="WHERE " + " AND ".join(self.where_clause)
                if len(self.where_clause) > 0
                else ""
            ),
            self.string_values,
        )


def get_filter_flight(
    flight_number: Optional[int] = None,
    filter_by_emails: Optional[bool] = False,
    dep_date_range: Optional[FilterRange[str]] = None,
    dep_time_range: Optional[FilterRange[str]] = None,
    arr_date_range: Optional[FilterRange[str]] = None,
    arr_time_range: Optional[FilterRange[str]] = None,
    dep_airport: Optional[str] = None,
    dep_city: Optional[str] = None,
    arr_airport: Optional[str] = None,
    arr_city: Optional[str] = None,
    emails: Optional[FilterSet] = None,
    is_customer: Optional[bool] = True,
    round_trip: bool = False,
) -> Tuple[str, list]:
    if arr_city or dep_city:
        base_query = "SELECT * FROM verbose_flights {where}"
        flight_table = "verbose_flights"
    else:
        base_query = "SELECT * FROM Flight {where}"
        flight_table = "Flight"
    filter = Filter(base_query)
    if emails is not None and emails.filter_set is not None:
        if is_customer:
            sec_filter = Filter("EXISTS (SELECT * FROM Ticket {where})").add_filter_set(
                "email", emails
            )
        else:
            sec_filter = Filter(
                "EXISTS (SELECT * FROM Ticket JOIN BookingAgent ON(Ticket.booking_agent_ID=BookingAgent.booking_agent_ID) {where})"
            ).add_filter_set("BookingAgent.email", emails)
        sec_filter.add_static_filter(
            "(Ticket.dep_date, Ticket.dep_time, Ticket.flight_number)=({flight}.dep_date, {flight}.dep_time, {flight}.flight_number)".format(
                flight=flight_table
            )
        )
    else:
        sec_filter = None
    filter.add_filter_range("dep_date", dep_date_range).add_filter_range(
        "dep_time", dep_time_range
    ).add_filter_range("arr_date", arr_date_range).add_filter_range(
        "arr_time", arr_time_range
    ).add_optional_constraint(
        "flight_number", flight_number
    ).add_optional_constraint(
        "dep_airport", dep_airport
    ).add_optional_constraint(
        "arr_airport", arr_airport
    ).add_optional_constraint(
        "dep_city", dep_city
    ).add_optional_constraint(
        "arr_city", arr_city
    ).conditonally_add(
        filter_by_emails, filter.add_sub_filter, sec_filter
    )
    return filter.get_formatted()


def get_filter_spendings(
    emails: FilterSet[str],
    purchase_date_range: Optional[FilterRange[str]] = None,
    purchase_time_range: Optional[FilterRange[str]] = None,
    filter_group: Optional[FilterGroup] = None,
) -> Tuple[str, list]:
    assert isinstance(emails, FilterSet)
    assert filter_group is None or isinstance(filter_group, FilterGroup)
    if filter_group:
        filter = Filter(
            "SELECT {Group}(purchase_date), sum(actual_price) FROM spendings \
            {{where}} GROUP BY {Group}(purchase_date)".format(
                Group=filter_group.value
            )
        )
    else:
        filter = Filter("SELECT purchase_date, actual_price FROM spendings {where}")

    filter.add_filter_range("purchase_date", purchase_date_range).add_filter_range(
        "purchase_time", purchase_time_range
    ).add_filter_set("email", emails)
    return filter.get_formatted()


def get_filter_query(filter: FilterType, **kwargs) -> Tuple[str, Union[list, dict]]:
    if not is_advanced_filter(filter):
        if filter not in FILTER_TO_QUERY_MAP:
            raise NotImplementedError(
                "The sql query for {filter} is not implemented. Please check FILTER_TO_QUERY_MAP".format(
                    filter=filter
                )
            )
        else:
            return FILTER_TO_QUERY_MAP[filter], kwargs

    try:
        if filter is FilterType.ADVANCED_SPENDINGS:
            return get_filter_spendings(
                emails=FilterSet(kwargs["emails"]),
                purchase_date_range=FilterRange(
                    kwargs.get("purchase_date_lower"), kwargs.get("purchase_date_upper")
                ),
                purchase_time_range=FilterRange(
                    kwargs.get("purchase_time_lower"), kwargs.get("purchase_time_upper")
                ),
                filter_group=FilterGroup.get_default(kwargs.get("group")),
            )
        elif filter is FilterType.ADVANCED_FLIGHT:
            return get_filter_flight(
                flight_number=kwargs.get("flight_number"),
                filter_by_emails=kwargs.get("filter_by_emails"),
                dep_date_range=FilterRange(
                    kwargs.get("dep_date_lower"), kwargs.get("dep_date_upper")
                ),
                dep_time_range=FilterRange(
                    kwargs.get("dep_time_lower"), kwargs.get("dep_time_upper")
                ),
                arr_date_range=FilterRange(
                    kwargs.get("arr_date_lower"), kwargs.get("arr_date_upper")
                ),
                arr_time_range=FilterRange(
                    kwargs.get("arr_time_lower"), kwargs.get("arr_time_upper")
                ),
                dep_airport=kwargs.get("dep_airport"),
                dep_city=kwargs.get("dep_city"),
                arr_airport=kwargs.get("arr_airport"),
                arr_city=kwargs.get("arr_city"),
                emails=FilterSet(kwargs.get("emails")),
                is_customer=kwargs.get("is_customer"),
            )
        else:
            raise ValueError("The filter {filter} is invalid.".format(filter=filter))
    except KeyError as err:
        raise QueryKeyError(err.args[0])


def query_by_filter(conn: Connection, filter: FilterType, **kwargs):
    sql, values = get_filter_query(filter, **kwargs)
    return query(conn, sql, args=values)
