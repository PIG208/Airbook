from pymysql.connections import Connection
from functools import wraps
from typing import Optional, Tuple, Set
from backend.utils.error import JsonError, MissingKeyError, QueryKeyError
from backend.utils.encryption import check_hash
from backend.utils.query import (
    DataType,
    query,
    CHECK_AGENT_LOGIN,
    CHECK_CUST_LOGIN,
    CHECK_STAFF_LOGIN,
    FetchMode,
)
from backend.utils.filter import FilterType
from flask import request, abort, session

PublicFilters = {
    FilterType.ALL_FUTURE_FLIGHTS,
    FilterType.ADVANCED_FLIGHT,
}

# These are the filters that can be accessed by any logged in users.
ProtectedFilters = {
    FilterType.ADVANCED_SPENDINGS,
}

STAFF_FILTERS: Set[FilterType] = {
    FilterType.FLIGHT_COMMENTS,
    FilterType.AIRLINE_PLANES,
    FilterType.TOP_AGENTS,
}

AGENT_FILTERS: Set[FilterType] = {FilterType.TOP_CUSTOMERS}

CUST_FILTERS: Set[FilterType] = {
    FilterType.CUST_FUTURE_FLIGHTS,
    FilterType.CUST_TICKETS,
}

USER_TYPES = {
    DataType.CUST,
    DataType.STAFF,
    DataType.AGENT,
}

USER_TYPE_TO_FILTERS_MAP = {
    DataType.CUST: CUST_FILTERS,
    DataType.STAFF: STAFF_FILTERS,
    DataType.AGENT: AGENT_FILTERS,
}


def is_user(data_type: Optional[DataType]):
    return data_type in USER_TYPES


def have_access_to_filter(data_type: Optional[DataType], filter: FilterType):
    if data_type is not None and is_user(data_type):
        return (
            filter in PublicFilters
            or filter in ProtectedFilters
            or filter in USER_TYPE_TO_FILTERS_MAP.get(data_type, {})
        )
    else:
        return filter in PublicFilters


def check_login(conn: Connection, login_type: DataType, **kwargs: str):
    try:
        data = {}
        try:
            if login_type is DataType.STAFF:
                data["username"] = kwargs["username"]
            else:
                data["email"] = kwargs["email"]
            if login_type is DataType.AGENT:
                data["booking_agent_id"] = kwargs["booking_agent_id"]
            data["password"] = kwargs["password"]
        except KeyError as err:
            raise MissingKeyError(key=err.args[0])

        if login_type is DataType.CUST:
            result = query(conn, CHECK_CUST_LOGIN, FetchMode.ONE, 1, data)
        elif login_type is DataType.STAFF:
            result = query(conn, CHECK_STAFF_LOGIN, FetchMode.ONE, 1, data)
        elif login_type is DataType.AGENT:
            result = query(conn, CHECK_AGENT_LOGIN, FetchMode.ONE, 1, data)
        else:
            raise JsonError("Invalid login method!")
    except QueryKeyError as err:
        raise MissingKeyError(err.get_key())

    if result is None:
        raise JsonError("The input information doesn't match any existing users!")

    if login_type == DataType.CUST or login_type == DataType.AGENT:
        hashed_password, salt = result[2], result[3]
    else:
        hashed_password, salt = result[1], result[2]

    if not check_hash(kwargs["password"], hashed_password, salt):
        raise JsonError("The input information or the password does not match!")

    return result


def require_session(user_type: Optional[DataType] = None):
    def decorator(func):
        """
        With the decorator, the Flask view function only proceeds when the proper credential is provided
        """

        @wraps(func)
        def wrapper(*args, **kwargs):
            if (
                "user_type" not in session
                or session["user_type"] == "public"
                or (user_type is not None and session["user_type"] != user_type.value)
            ):
                raise JsonError("Please login to access this page!")
                # abort(401)
            return func(*args, **kwargs)

        return wrapper

    return decorator
