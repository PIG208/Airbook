from typing import Dict, Any
from backend.utils.filter import FilterType, FilterSet
from backend.utils.query import DataType, query, FetchMode, STAFF_AIRLINE
from backend.utils.error import JsonError, MissingKeyError, QueryKeyError
from backend.utils.authentication import have_access_to_filter, PublicFilters
from backend.utils.filter import query_by_filter
from pymysql.connections import Connection


def do_search(
    conn: Connection,
    data: Dict[str, Any],
    session: Dict[str, Any],
    filter: str,
    use_public: bool,
):
    if data is None:
        data = {}
    try:
        filter_type = FilterType(filter)
    except ValueError:
        raise JsonError(
            'The requested filter "{filter}" does not exist!'.format(filter=filter)
        )

    user_type = None

    if "user_type" in session:
        user_type = DataType(session["user_type"])

    if not have_access_to_filter(user_type, filter_type):
        raise JsonError("You don't have the permission to use this filter!")

    filter_data = data.get("filter_data", {})

    if user_type is DataType.CUST:
        filter_data["emails"] = [session["email"]]
        filter_data["is_customer"] = True
    elif user_type is DataType.AGENT:
        filter_data["emails"] = [session["agent_email"]]
        filter_data["is_customer"] = False
    elif user_type is DataType.STAFF:
        filter_data["airline_name"] = query(
            conn, STAFF_AIRLINE, FetchMode.ONE, args=dict(username=session["username"])
        )[0]

    try:
        result = query_by_filter(conn, filter_type, **filter_data, **session)
    except QueryKeyError as err:
        raise MissingKeyError(key=err.get_key())
    except TypeError as err:
        if (
            err.args[0]
            == "query_by_filter() got multiple values for keyword argument 'email'"
        ):
            raise JsonError(
                "Malformed request! Are you attempting to pass your email address?"
            )

    return result
