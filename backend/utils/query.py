from pymysql import Connection, IntegrityError, ProgrammingError
from typing import Dict, Any, Optional
from enum import Enum, auto

from backend.utils.error import QueryError, QueryKeyError

INSERT_INTO = 'INSERT INTO {} ({}) VALUES ({});'
SELECT_IDENTITY = 'SELECT @@IDENTITY;'
BASIC_SELECT = 'SELECT * FROM {table} {predicates}'
BASIC_DELETE = 'DELETE FROM {table} WHERE {}'

SELECT_ALL_FUTURE_FLIGHTS = 'SELECT * FROM future_flights;'
SELECT_CUSTOMER_TICKETS = 'call customer_tickets(%(email)s);' # "email" must matches the key name for session
SELECT_CUSTOMER_FLIGHTS = 'call customer_flights(%(email)s);'
CITY_AIRPORT = 'call city_airport(%(city)s);'

DELAYED_FLIGHTS = 'SELECT * FROM Flight\
    WHERE status=\'delayed\';'
CUSTOMER_WHO_BOUGHT_TICKETS = 'SELECT * FROM Customer\
    WHERE EXISTS(\
        SELECT * FROM Ticket\
        WHERE Customer.email=Ticket.email\
    );'

CHECK_CUST_LOGIN = 'SELECT * FROM Customer\
    WHERE email=%(email)s;'
CHECK_AGENT_LOGIN = 'SELECT * FROM BookingAgent\
    WHERE (booking_agent_ID, email) = (%(booking_agent_id)s, %(email)s);'
CHECK_STAFF_LOGIN = 'SELECT * FROM AirlineStaff\
    WHERE username=%(username)s;'

class FETCH_MODE(Enum):
    ONE = auto()
    MANY = auto()
    ALL = auto()

class FILTER_TYPE(Enum):
    ALL_FUTURE_FLIGHTS = 'all_future'
    CUST_FUTURE_FLIGHTS = 'customer_future'
    CUST_TICKETS = 'customer_tickets'

class DATA_TYPE(Enum):
    """
    Provide aliases for the tables in the database, which can be referred to via the url.
    """
    CUST = 'cust'
    STAFF = 'staff'
    AGENT = 'agent'
    AIRPORT = 'airport'
    AIRLINE = 'airline'
    AIRPLANE = 'plane'
    FLIGHT = 'flight'
    TICKET = 'ticket'
    BOOK = 'book'
    FEEDBACK = 'feedback'
    PHONENUM = 'phone'

    def get_table(self):
        return ENTITY_TO_TABLE_MAP[self]

FILTER_TO_QUERY_MAP = {
    FILTER_TYPE.ALL_FUTURE_FLIGHTS: SELECT_ALL_FUTURE_FLIGHTS,
    FILTER_TYPE.CUST_FUTURE_FLIGHTS: SELECT_CUSTOMER_FLIGHTS,
    FILTER_TYPE.CUST_TICKETS: SELECT_CUSTOMER_TICKETS,
}

ENTITY_TO_TABLE_MAP = {
    DATA_TYPE.CUST:'Customer',
    DATA_TYPE.STAFF:'AirlineStaff',
    DATA_TYPE.AGENT:'BookingAgent',
    DATA_TYPE.AIRPORT:'Airport',
    DATA_TYPE.AIRLINE:'Airline',
    DATA_TYPE.AIRPLANE:'Airplane',
    DATA_TYPE.FLIGHT:'Flight',
    DATA_TYPE.TICKET:'Ticket',
    DATA_TYPE.BOOK:'Book',
    DATA_TYPE.FEEDBACK:'Feedback',
    DATA_TYPE.PHONENUM:'PhoneNumber',
}

def form_args_list(args, backticks=False):
    """
    Never use the result from form_args_list to format the string directly!
    It should be passed as a parameter in `cursor.execute` to ensure that the values are escaped.
    """
    res = []
    for arg in args:
        if isinstance(arg, str):
            res.append('`{}`'.format(arg) if backticks else arg)
        else:
            res.append(arg)
    return res


def insert_into(conn: Connection, table_name: str, **kwargs: Dict[str, Any]) -> Optional[int]:
    make_str = ','.join(['%s' for i in range(len(kwargs))])
    keys = form_args_list(kwargs.keys())
    values = form_args_list(kwargs.values())
    result = None
    try:
        with conn.cursor() as cursor:
            cursor.execute(INSERT_INTO.format(table_name, ','.join(keys), make_str), (*values,))
            result = cursor.lastrowid
    except IntegrityError as err:
        raise QueryError(*err.args)
    except ProgrammingError as err:
        raise QueryError(*err.args)
    if result is not None:
        return result


def query(conn: Connection, sql: str, fetch_mode: FETCH_MODE = FETCH_MODE.ALL, size: int = 1, **kwargs):
    with conn.cursor() as cursor:
        cursor.execute(sql, kwargs)

        if fetch_mode is FETCH_MODE.ONE:
            return cursor.fetchone()
        elif fetch_mode is FETCH_MODE.MANY:
            return cursor.fetchmany(size)
        elif fetch_mode is FETCH_MODE.ALL:
            return cursor.fetchall()

def query_filter(conn: Connection, filter: FILTER_TYPE, **kwargs):
    if filter not in FILTER_TO_QUERY_MAP:
        raise NotImplementedError('The sql query for {filter} is not implemented. Please check FILTER_TO_QUERY_MAP'.format(filter=filter))
    else:
        try:
            return query(conn, FILTER_TO_QUERY_MAP[filter], fetch_mode=FETCH_MODE.ALL, size=1, **kwargs)
        except KeyError as err:
            raise QueryKeyError(err.args[0])