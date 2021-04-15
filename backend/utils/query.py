from pymysql import Connection, IntegrityError, ProgrammingError
from typing import Dict, Any, Optional
from enum import Enum, auto

from backend.utils.error import QueryError

INSERT_INTO = 'INSERT INTO {} ({}) VALUES ({});'
SELECT_IDENTITY = 'SELECT @@IDENTITY;'
BASIC_SELECT = 'SELECT * FROM {table} {predicates}'
BASIC_DELETE = 'DELETE FROM {table} WHERE {}'
FUTURE_FLIGHTS = 'SELECT * FROM Flight\
    WHERE dep_date > CURDATE()\
    OR (dep_date = CURDATE() AND dep_time > CURTIME());'
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

class DATA_TYPE(Enum):
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

USER_TYPES = {
    DATA_TYPE.CUST,
    DATA_TYPE.STAFF,
    DATA_TYPE.AGENT,
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
