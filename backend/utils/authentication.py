from pymysql import Connection
from functools import wraps
from backend.utils.error import JsonError, MissingKeyError, QueryKeyError
from backend.utils.encryption import check_hash
from backend.utils.query import (
    DataType,
    query, 
    CHECK_AGENT_LOGIN, 
    CHECK_CUST_LOGIN, 
    CHECK_STAFF_LOGIN, 
    FetchMode
)
from backend.utils.filter import FilterType
from flask import request, abort, session

PublicFilters = {
    FilterType.ALL_FUTURE_FLIGHTS
}

STAFF_FILTERS = {

}

AGENT_FILTERS = {
    
}

CUST_FILTERS = {
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

def is_user(data_type: DataType):
    return data_type in USER_TYPES

def have_access_to_filter(data_type: DataType, filter: FilterType):
    if is_user(data_type):
        return filter in PublicFilters or filter in USER_TYPE_TO_FILTERS_MAP.get(data_type, {})
    else:
        return False

def check_login(conn: Connection, login_type: DataType, **kwargs: str) -> None:
    try:
        if "password" not in kwargs:
            raise MissingKeyError('password')
        if login_type == DataType.CUST:
            result = query(conn, CHECK_CUST_LOGIN, FetchMode.ONE, 1, **kwargs)
        elif login_type == DataType.STAFF:
            result = query(conn, CHECK_STAFF_LOGIN, FetchMode.ONE, 1, **kwargs)
        elif login_type == DataType.AGENT:
            result = query(conn, CHECK_AGENT_LOGIN, FetchMode.ONE, 1, **kwargs)
        else:
            raise JsonError('Invalid login method!')
    except QueryKeyError as err:
        raise MissingKeyError(err.get_key())

    if result is None:
        raise JsonError(
            'The input information doesn\'t match any existing users!'
        )
    
    if login_type == DataType.CUST or login_type == DataType.AGENT:
        hashed_password, salt = result[2], result[3]
    else:
        hashed_password, salt = result[1], result[2]
        
    if not check_hash(kwargs['password'], hashed_password, salt):
        raise JsonError(
            'The input information or the password does not match!'
        )

    return result

def require_session(func):
    """
    With the decorator, the Flask view function only proceeds when the proper credential is provided
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        if 'user_type' not in session:
            abort(401)
        return func(*args, **kwargs)

    return wrapper