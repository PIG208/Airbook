from pymysql import Connection
from functools import wraps
from backend.utils.error import JsonError, MissingKeyError
from backend.utils.encryption import check_hash
from backend.utils.query import (
    DATA_TYPE,
    FILTER_TYPE,
    query, 
    CHECK_AGENT_LOGIN, 
    CHECK_CUST_LOGIN, 
    CHECK_STAFF_LOGIN, 
    FETCH_MODE
)
from flask import request, abort, session

PUBLIC_FILTERS = {
    FILTER_TYPE.ALL_FUTURE_FLIGHTS
}

STAFF_FILTERS = {

}

AGENT_FILTERS = {
    
}

CUST_FILTERS = {
    FILTER_TYPE.CUST_FUTURE_FLIGHTS,
    FILTER_TYPE.CUST_TICKETS,
}

USER_TYPES = {
    DATA_TYPE.CUST,
    DATA_TYPE.STAFF,
    DATA_TYPE.AGENT,
}

USER_TYPE_TO_FILTERS_MAP = {
    DATA_TYPE.CUST: CUST_FILTERS,
    DATA_TYPE.STAFF: STAFF_FILTERS,
    DATA_TYPE.AGENT: AGENT_FILTERS,
}

def is_user(data_type: DATA_TYPE):
    return data_type in USER_TYPES

def have_access_to_filter(data_type: DATA_TYPE, filter: FILTER_TYPE):
    if is_user(data_type):
        return filter in PUBLIC_FILTERS or filter in USER_TYPE_TO_FILTERS_MAP.get(data_type, {})
    else:
        return False

def check_login(conn: Connection, login_type: DATA_TYPE, **kwargs: str) -> None:
    try:
        if "password" not in kwargs:
            raise KeyError('password')
        if login_type == DATA_TYPE.CUST:
            result = query(conn, CHECK_CUST_LOGIN, FETCH_MODE.ONE, 1, **kwargs)
        elif login_type == DATA_TYPE.STAFF:
            result = query(conn, CHECK_STAFF_LOGIN, FETCH_MODE.ONE, 1, **kwargs)
        elif login_type == DATA_TYPE.AGENT:
            result = query(conn, CHECK_AGENT_LOGIN, FETCH_MODE.ONE, 1, **kwargs)
        else:
            raise JsonError('Invalid login method!')
    except KeyError as err:
        raise MissingKeyError(err.args[0])

    if result is None:
        raise JsonError(
            'The input information doesn\'t match any existing users!'
        )
    
    if login_type == DATA_TYPE.CUST or login_type == DATA_TYPE.AGENT:
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