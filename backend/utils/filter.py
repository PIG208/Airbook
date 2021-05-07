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

    def isEmpty(self) -> bool:
        return self._lower is None and self._upper is None

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


class FilterSet(Generic[V]):
    def __init__(self, filter_set: Optional[Iterable[V]] = None):
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
    TOP_CUSTOMERS = "top_customers"
    AIRLINE_PLANES = "airline_planes"
    TOP_AGENTS = "top_agents"
    FREQ_CUST = "frequent_cust"
    REVENUE = "revenue_compare"
    TOP_DEST = "top_destinations"
    # The following filters are advanced filters that require the filter generator.
    # We need to keep track of the advanced filters in the set ADVANCED_FILTERS.
    ADVANCED_FLIGHT = "advanced_flight"
    ADVANCED_SPENDINGS = "advanced_spendings"


SELECT_FLIGHT_COMMENTS = "SELECT flight_number, dep_date, dep_time, created_at, email, rating, comment \
    FROM Feedback NATURAL JOIN Flight NATURAL JOIN AirlineStaff \
        WHERE username=%(username)s;"
SELECT_ALL_FUTURE_FLIGHTS = "SELECT * FROM future_flights;"
SELECT_CUSTOMER_TICKETS = (
    "call customer_tickets(%(email)s);"  # "email" must matches the key name for session
)
SELECT_TOP_CUSTOMERS = '(SELECT * FROM \
    (SELECT email, sum(commission) as total_commission, count(*) as tickets_bought \
        FROM spendings where purchase_Date > UTC_TIMESTAMP() - INTERVAL 6 MONTH and booking_agent_id = %(agent_id)s \
            GROUP BY email ORDER BY total_commission DESC)as temp) \
                UNION ALL SELECT "divide" as email, "" as total_commission, "" as tickets_bought UNION ALL \
                    (SELECT email, sum(commission) as total_commission, count(*) as tickets_bought \
                        FROM spendings where purchase_Date > UTC_TIMESTAMP() - INTERVAL 6 MONTH and booking_agent_id = %(agent_id)s \
                            GROUP BY email ORDER BY tickets_bought DESC)'
SELECT_CUSTOMER_FLIGHTS = "call customer_flights(%(email)s);"
SELECT_AIRLINE_PLANES = "SELECT * FROM Airplane WHERE airline_name = %(airline_name)s"
# Note, do not pass user provided values to this query
SELECT_TOP_AGENTS = 'SELECT * FROM (SELECT * FROM agent_stats_last_year ORDER BY total_commission DESC LIMIT 5) as temp1 \
UNION ALL SELECT * FROM (SELECT "divide" as Booking_agent_ID, "" as total_commission, "" as tickets_total, "" as email) as temp2 \
UNION ALL SELECT * FROM (SELECT * FROM agent_stats_last_month ORDER BY total_commission DESC LIMIT 5) as temp3 \
UNION ALL SELECT * FROM (SELECT "divide" as booking_agent_id, "" as total_commission, "" as tickets_total, "" as email) as temp4 \
UNION ALL SELECT * FROM (SELECT * FROM agent_stats_last_year ORDER BY total_tickets DESC LIMIT 5) as temp5 \
UNION ALL SELECT * FROM (SELECT "divide" as booking_agent_id, "" as total_commission, "" as tickets_total, "" as email) as temp6 \
UNION ALL SELECT * FROM (SELECT * FROM agent_stats_last_month ORDER BY total_tickets DESC LIMIT 5) as temp7'
SELECT_MOST_FREQUENT_CUST = "SELECT temp.*, name FROM (SELECT email, COUNT(*) as total_visits FROM Ticket WHERE purchase_date > UTC_TIMESTAMP() - INTERVAL 1 YEAR AND dep_date < NOW() GROUP BY email ORDER BY total_visits DESC) AS temp NATURAL JOIN Customer;"
SELECT_REVENUE_COMPARE = "SELECT * FROM (SELECT * FROM (SELECT COUNT(*) as direct FROM Ticket WHERE airline_name=%(airline_name)s AND booking_agent_id IS NULL AND purchase_date > UTC_DATE() - INTERVAL 1 MONTH) as t1 \
    NATURAL JOIN (SELECT COUNT(*) as in_direct FROM Ticket WHERE airline_name=%(airline_name)s  AND booking_agent_id IS NOT NULL AND purchase_date > UTC_DATE() - INTERVAL 1 MONTH) as t2) as t3 \
         UNION ALL \
             SELECT * FROM (SELECT * FROM (SELECT COUNT(*) as direct FROM Ticket WHERE airline_name=%(airline_name)s AND booking_agent_id IS NULL AND purchase_date > UTC_DATE() - INTERVAL 1 YEAR) as t1 \
             NATURAL JOIN (SELECT COUNT(*) as in_direct FROM Ticket WHERE airline_name=%(airline_name)s  AND booking_agent_id IS NOT NULL AND purchase_date > UTC_DATE() - INTERVAL 1 YEAR) as t2) as t4"
SELECT_POPULAR_DESTINATIONS = 'SELECT * FROM (SELECT arr_city, count(*) as visits FROM (SELECT arr_city, Ticket.airline_name FROM Ticket INNER JOIN verbose_flights USING (flight_number, dep_date, dep_time) WHERE Ticket.airline_name=%(airline_name)s AND dep_date > UTC_DATE() - INTERVAL 3 MONTH) AS t GROUP BY arr_city ORDER BY visits LIMIT 5) as t1 \
UNION ALL SELECT "", "divide" \
UNION ALL SELECT * FROM (SELECT arr_city, count(*) as visits FROM (SELECT arr_city, Ticket.airline_name FROM Ticket INNER JOIN verbose_flights USING (flight_number, dep_date, dep_time) WHERE Ticket.airline_name=%(airline_name)s AND dep_date > UTC_DATE() - INTERVAL 1 YEAR) AS t GROUP BY arr_city ORDER BY visits LIMIT 5) as t2;'

FILTER_TO_QUERY_MAP = {
    FilterType.ALL_FUTURE_FLIGHTS: SELECT_ALL_FUTURE_FLIGHTS,
    FilterType.CUST_FUTURE_FLIGHTS: SELECT_CUSTOMER_FLIGHTS,
    FilterType.CUST_TICKETS: SELECT_CUSTOMER_TICKETS,
    FilterType.FLIGHT_COMMENTS: SELECT_FLIGHT_COMMENTS,
    FilterType.TOP_CUSTOMERS: SELECT_TOP_CUSTOMERS,
    FilterType.AIRLINE_PLANES: SELECT_AIRLINE_PLANES,
    FilterType.TOP_AGENTS: SELECT_TOP_AGENTS,
    FilterType.FREQ_CUST: SELECT_MOST_FREQUENT_CUST,
    FilterType.REVENUE: SELECT_REVENUE_COMPARE,
    FilterType.TOP_DEST: SELECT_POPULAR_DESTINATIONS,
}

ADVANCED_FILTERS = {
    FilterType.ADVANCED_FLIGHT,
    FilterType.ADVANCED_SPENDINGS,
}


def is_advanced_filter(filter: FilterType):
    return filter in ADVANCED_FILTERS


class Filter:
    def __init__(self, base_query: str, is_predicate: bool = False):
        self.base_query = base_query
        self.is_predicate = is_predicate
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

    def add_optional_constraint(
        self, column_name: str, constraint: Optional[T], not_equal: bool = False
    ):
        """
        Create a '=' constraint in the where clause if it's specified. The arguments still need to be
        passed to cursor.execute as we cannot trust user inputs of string values (like for airport name).
        """
        if constraint is None:
            return self
        else:
            if isinstance(constraint, int):
                self.where_clause.append(
                    "{}{}{}".format(
                        column_name, "<>" if not_equal else "=", str(constraint)
                    )
                )
            elif isinstance(constraint, str) and len(constraint.strip()) > 0:
                self.where_clause.append(
                    "{}{}%s".format(column_name, "<>" if not_equal else "=")
                )
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
        if sub_filter.get_formatted()[0] == "":
            return self
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

    def add_or(
        self, func_a: Callable, func_b: Callable, args_a: Any = (), args_b: Any = ()
    ):
        dummy_filter = Filter("{where}")
        try:
            func_a = getattr(dummy_filter, func_a.__name__)
            func_b = getattr(dummy_filter, func_b.__name__)
        except AttributeError:
            raise AssertionError("or expects to take an add function from filter!")
        func_a(*args_a)
        func_b(*args_b)
        if len(dummy_filter.where_clause) > 0:
            self.where_clause.append(
                "({})".format(" OR ".join(dummy_filter.where_clause))
            )
            for s in dummy_filter.string_values:
                self.string_values.append(s)
        return self

    def get_formatted(self) -> Tuple[str, list]:
        """
        Returns a query string, formatted, and the values left for string interpolation.
        """
        if self.is_predicate:
            return (
                " AND ".join(self.where_clause) if len(self.where_clause) > 0 else "",
                self.string_values,
            )
        else:
            return (
                self.base_query.format(
                    where="WHERE " + " AND ".join(self.where_clause)
                    if len(self.where_clause) > 0
                    else ""
                ),
                self.string_values,
            )


def get_filter_flight(
    dep_date_range: FilterRange[str],
    dep_time_range: FilterRange[str],
    arr_date_range: FilterRange[str],
    arr_time_range: FilterRange[str],
    flight_number: Optional[int] = None,
    dep_airport: Optional[str] = None,
    dep_city: Optional[str] = None,
    arr_airport: Optional[str] = None,
    arr_city: Optional[str] = None,
    emails: FilterSet[str] = None,
    airline_name: Optional[str] = None,
    filter_by_emails: Optional[bool] = False,
    filter_by_agent_id: Optional[bool] = False,
    agent_id: Optional[int] = None,
    is_customer: bool = False,
    is_staff: bool = False,
    round_trip: Optional[bool] = False,
) -> Tuple[str, list]:
    base_query = "SELECT * FROM verbose_flights {where}"
    flight_table = "verbose_flights"
    filter = Filter(base_query)
    if (
        emails is not None
        and emails.filter_set is not None
        and (is_customer or is_staff)
        and filter_by_emails
    ):
        sec_filter = Filter("EXISTS (SELECT * FROM Ticket {where})").add_filter_set(
            "email", emails
        )
    elif filter_by_agent_id and agent_id is not None:
        sec_filter = Filter(
            "EXISTS (SELECT * FROM Ticket JOIN BookingAgent ON(Ticket.booking_agent_ID=BookingAgent.booking_agent_ID) {where})"
        ).add_optional_constraint(
            "BookingAgent.booking_agent_ID",
            agent_id,
        )
    else:
        sec_filter = None

    if sec_filter is not None:
        sec_filter.add_static_filter(
            "(Ticket.dep_date, Ticket.dep_time, Ticket.flight_number)=({flight}.dep_date, {flight}.dep_time, {flight}.flight_number)".format(
                flight=flight_table
            )
        )
    filter.add_optional_constraint(
        "flight_number", flight_number
    ).add_optional_constraint("dep_airport", dep_airport).add_optional_constraint(
        "arr_airport", arr_airport
    ).add_optional_constraint(
        "dep_city", dep_city
    ).add_optional_constraint(
        "arr_city", arr_city
    ).add_sub_filter(
        sec_filter
    ).add_optional_constraint(
        "airline_name", airline_name
    )
    add_date_time_range(filter, dep_date_range, dep_time_range, "dep_date", "dep_time")
    add_date_time_range(filter, arr_date_range, arr_time_range, "arr_date", "arr_time")
    return filter.get_formatted()


def add_date_time_range(
    filter: Filter,
    date_range: FilterRange,
    time_range: FilterRange,
    date_column_name: str,
    time_column_name: str,
):
    if date_range.isEmpty() and time_range.isEmpty():
        return
    sub_lower = (
        Filter("", True)
        .add_optional_constraint(date_column_name, date_range.lower)
        .add_filter_range(date_column_name, FilterRange(upper=date_range.upper))
        .add_filter_range(time_column_name, FilterRange(lower=time_range.lower))
        if date_range.lower is not None
        else Filter("", True).add_static_filter("FALSE")
    )
    sub_upper = (
        Filter("", True)
        .add_optional_constraint(date_column_name, date_range.upper)
        .add_filter_range(date_column_name, FilterRange(lower=date_range.lower))
        .add_filter_range(time_column_name, FilterRange(upper=time_range.upper))
        if date_range.upper is not None
        else Filter("", True).add_static_filter("FALSE")
    )
    sub_same_day = (
        (
            Filter("", True)
            .add_optional_constraint(date_column_name, date_range.upper)
            .add_optional_constraint(date_column_name, date_range.lower)
            .add_filter_range(time_column_name, time_range)
        )
        if date_range.upper is not None and date_range.lower is not None
        else Filter("", True).add_static_filter("FALSE")
    )
    filter.add_or(
        filter.add_filter_range,
        filter.add_or,
        (date_column_name, date_range),
        (
            filter.add_sub_filter,
            filter.add_or,
            (sub_lower,),
            (
                filter.add_sub_filter,
                filter.add_sub_filter,
                (sub_upper,),
                (sub_same_day,),
            ),
        ),
    )
    return filter


def get_filter_spendings(
    emails: FilterSet[str],
    agent_id: Optional[int],
    purchase_date_range: FilterRange[str],
    purchase_time_range: FilterRange[str],
    airline_name: Optional[str] = None,
    group_by_month: Optional[bool] = False,
    take_count: Optional[bool] = False,
    is_customer: bool = False,
    is_staff: bool = False,
) -> Tuple[str, list]:
    assert isinstance(emails, FilterSet)
    if group_by_month or (take_count and is_staff):
        filter = Filter(
            "SELECT concat(year(purchase_date),'-', month(purchase_date)) as spendings_year_month, sum(actual_price){} from spendings {{where}} GROUP BY spendings_year_month ORDER BY purchase_date".format(
                ", count(*)" if take_count else ""
            )
        )
    else:
        filter = Filter("SELECT * FROM spendings {where}")
    add_date_time_range(
        filter,
        purchase_date_range,
        purchase_time_range,
        "purchase_date",
        "purchase_time",
    )
    filter.conditonally_add(
        is_customer or is_staff,
        filter.add_filter_set,
        "email",
        emails,
    ).add_optional_constraint("booking_agent_id", agent_id).add_optional_constraint(
        "airline_name", airline_name
    )
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
                emails=FilterSet(kwargs.get("emails")),
                agent_id=kwargs.get("agent_id"),
                purchase_date_range=FilterRange(
                    kwargs.get("purchase_date_lower"), kwargs.get("purchase_date_upper")
                ),
                purchase_time_range=FilterRange(
                    kwargs.get("purchase_time_lower"), kwargs.get("purchase_time_upper")
                ),
                airline_name=kwargs.get("airline_name"),
                group_by_month=kwargs.get("group_by_month"),
                take_count=kwargs.get("take_count"),
                is_customer=kwargs["is_customer"],
                is_staff=kwargs["is_staff"],
            )
        elif filter is FilterType.ADVANCED_FLIGHT:
            return get_filter_flight(
                flight_number=kwargs.get("flight_number"),
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
                airline_name=kwargs.get("airline_name"),
                emails=FilterSet(kwargs.get("emails")),
                filter_by_emails=kwargs.get("filter_by_emails"),
                filter_by_agent_id=kwargs.get("filter_by_agent_id"),
                agent_id=kwargs.get("agent_id"),
                is_customer=kwargs["is_customer"],
                is_staff=kwargs["is_staff"],
            )
        else:
            raise ValueError("The filter {filter} is invalid.".format(filter=filter))
    except KeyError as err:
        raise QueryKeyError(err.args[0])


def query_by_filter(conn: Connection, filter: FilterType, **kwargs):
    sql, values = get_filter_query(filter, **kwargs)
    print(sql, values)
    return query(conn, sql, args=values)
