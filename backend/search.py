from typing import Dict, Any
from backend.utils.query import DATA_TYPE, FILTER_TYPE, query_filter
from backend.utils.error import JsonError, MissingKeyError, QueryKeyError
from backend.utils.authentication import have_access_to_filter, PUBLIC_FILTERS
from pymysql import Connection
from traceback import print_exception

def do_search(conn: Connection, data: Dict[str, Any], session: Dict[str, Any], filter: str, use_public: bool):
    if data is None:
        data = {}
    try:
        filter = FILTER_TYPE(filter)
    except ValueError:
        raise JsonError('The requested filter \"{filter}\" does not exist!'.format(filter=filter))

    if (use_public and filter not in PUBLIC_FILTERS) or (not use_public and not have_access_to_filter(DATA_TYPE(session['user_type']), filter)):
        raise JsonError('You don\'t have the permission to use this filter!')

    try:
        result = query_filter(conn, filter, **data.get('filter_data', {}), **session)
    except TypeError as err:
        raise JsonError('Malformed request! Are you attempting to pass your email address?')
    except QueryKeyError as err:
        raise MissingKeyError(key=err.get_key())

    return result