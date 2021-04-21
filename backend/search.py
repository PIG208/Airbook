from typing import Dict, Any
from backend.utils.filter import FilterType, FilterSet
from backend.utils.query import DataType, query, FetchMode
from backend.utils.error import JsonError, MissingKeyError, QueryKeyError
from backend.utils.authentication import have_access_to_filter, PublicFilters
from backend.utils.filter import query_by_filter
from pymysql import Connection

def do_search(conn: Connection, data: Dict[str, Any], session: Dict[str, Any], filter: str, use_public: bool):
    if data is None:
        data = {}
    try:
        filter = FilterType(filter)
    except ValueError:
        raise JsonError('The requested filter \"{filter}\" does not exist!'.format(filter=filter))

    if 'user_type' in session:
        user_type = DataType(session['user_type'])
    else:
        user_type = None

    if not have_access_to_filter(user_type, filter):
        raise JsonError('You don\'t have the permission to use this filter!')
    
    filter_data = data.get('filter_data', {})

    if user_type is DataType.CUST:
        filter_data['emails'] = [session['email']]
    elif user_type is DataType.AGENT:
        filter_data['emails'] = [session['agent_email']]

    try:
        result = query_by_filter(conn, filter, **data.get('filter_data', {}), **session)
    except TypeError as err:
        raise JsonError('Malformed request! Are you attempting to pass your email address?')
    except QueryKeyError as err:
        raise MissingKeyError(key=err.get_key())

    return result