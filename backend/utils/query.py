from pymysql import IntegrityError, ProgrammingError
from pymysql.connections import Connection
from typing import Dict, Any, Optional, Union
from enum import Enum, auto

from backend.utils.error import QueryError, QueryKeyError

INSERT_INTO = "INSERT INTO {} ({}) VALUES ({});"
SELECT_IDENTITY = "SELECT @@IDENTITY;"
BASIC_SELECT = "SELECT * FROM {table} {predicates}"
BASIC_DELETE = "DELETE FROM {table} WHERE {}"

CITY_AIRPORT = "call city_airport(%(city)s);"

DELAYED_FLIGHTS = "SELECT * FROM Flight\
    WHERE status='delayed';"
CUSTOMER_WHO_BOUGHT_TICKETS = "SELECT * FROM Customer\
    WHERE EXISTS(\
        SELECT * FROM Ticket\
        WHERE Customer.email=Ticket.email\
    );"

CHECK_CUST_LOGIN = "SELECT * FROM Customer\
    WHERE email=%(email)s;"
CHECK_AGENT_LOGIN = "SELECT * FROM BookingAgent\
    WHERE (booking_agent_ID, email) = (%(booking_agent_id)s, %(email)s);"
CHECK_STAFF_LOGIN = "SELECT * FROM AirlineStaff\
    WHERE username=%(username)s;"


class FetchMode(Enum):
    ONE = auto()
    MANY = auto()
    ALL = auto()


class DataType(Enum):
    """
    Provide aliases for the tables in the database, which can be referred to via the url.
    """

    CUST = "cust"
    STAFF = "staff"
    AGENT = "agent"
    AIRPORT = "airport"
    AIRLINE = "airline"
    AIRPLANE = "plane"
    FLIGHT = "flight"
    TICKET = "ticket"
    BOOK = "book"
    FEEDBACK = "feedback"
    PHONENUM = "phone"

    def get_table(self):
        return ENTITY_TO_TABLE_MAP[self]


ENTITY_TO_TABLE_MAP = {
    DataType.CUST: "Customer",
    DataType.STAFF: "AirlineStaff",
    DataType.AGENT: "BookingAgent",
    DataType.AIRPORT: "Airport",
    DataType.AIRLINE: "Airline",
    DataType.AIRPLANE: "Airplane",
    DataType.FLIGHT: "Flight",
    DataType.TICKET: "Ticket",
    DataType.BOOK: "Book",
    DataType.FEEDBACK: "Feedback",
    DataType.PHONENUM: "PhoneNumber",
}


def form_args_list(args, backticks=False):
    """
    Never use the result from form_args_list to format the string directly!
    It should be passed as a parameter in `cursor.execute` to ensure that the values are escaped.
    """
    res = []
    for arg in args:
        if isinstance(arg, str):
            res.append("`{}`".format(arg) if backticks else arg)
        else:
            res.append(arg)
    return res


def insert_into(conn: Connection, table_name: str, **kwargs: Any) -> Optional[int]:
    make_str = ",".join(["%s" for i in range(len(kwargs))])
    keys = form_args_list(kwargs.keys())
    values = form_args_list(kwargs.values())
    result = None
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                INSERT_INTO.format(table_name, ",".join(keys), make_str), (*values,)
            )
            result = cursor.lastrowid
    except IntegrityError as err:
        raise QueryError(*err.args)
    except ProgrammingError as err:
        raise QueryError(*err.args)
    if result is not None:
        return result


def query(
    conn: Connection,
    sql: str,
    fetch_mode: FetchMode = FetchMode.ALL,
    size: int = 1,
    args: Optional[Union[dict, tuple, list]] = None,
):
    # Throws QueryKeyError
    with conn.cursor() as cursor:
        try:
            cursor.execute(sql, args)
        except KeyError as err:
            raise QueryKeyError(key=err.args[0])
        except ProgrammingError as err:
            print(err, sql)

        if fetch_mode is FetchMode.ONE:
            return cursor.fetchone()
        elif fetch_mode is FetchMode.MANY:
            return cursor.fetchmany(size)
        elif fetch_mode is FetchMode.ALL:
            return cursor.fetchall()
