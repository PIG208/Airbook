from typing import Dict, Any
from pymysql.connections import Connection
from pymysql.err import IntegrityError
from backend.utils.error import MissingKeyError, JsonError
from backend.utils.query import query, FetchMode, TICKET_PRICE


def get_ticket_price(conn: Connection, data: Dict[str, Any]):
    ticket_data = {}
    try:
        ticket_data["flight_number"] = int(data["flight_number"])
        ticket_data["dep_date"] = data["dep_date"]
        ticket_data["dep_time"] = data["dep_time"]
    except KeyError as err:
        raise MissingKeyError(err.args[0])
    except ValueError as err:
        raise JsonError("The flight number should be a number!")
    try:
        result = query(
            conn,
            TICKET_PRICE.format(flight_number=ticket_data["flight_number"]),
            FetchMode.ONE,
            args=ticket_data,
        )
    except IntegrityError:
        raise JsonError("The flight is invalid!")
    return result
