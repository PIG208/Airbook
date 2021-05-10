from typing import Any, Dict
from os import urandom
import re
from datetime import datetime
from flask import Flask, request, jsonify, make_response, session, send_file
from flask_cors import CORS, cross_origin  # type: ignore
from backend.utils.authentication import check_login, require_session
from backend.utils.query import (
    insert_into,
    query,
    CHECK_AGENT_LOGIN,
    CHECK_CUST_LOGIN,
    CHECK_STAFF_LOGIN,
    UPDATE_STATUS,
    STAFF_AIRLINE,
    TICKET_PRICE,
    FetchMode,
)
from backend.utils.authentication import PublicFilters, DataType, is_user
from backend.utils.flight import get_ticket_price
from backend.utils.parsing import handle_login_data
from backend.utils.encryption import check_hash, generate_hash
from backend.utils.error import (
    raise_error,
    JsonError,
    MissingKeyError,
    QueryError,
    QueryKeyError,
    QueryDuplicateError,
    ExistingRegisterError,
)
from backend.search import do_search

import json
import pymysql.cursors

app = Flask(__name__, static_url_path="", static_folder="../web/build")
CORS(app, with_credentials=True)
app.secret_key = urandom(16)


def connect():
    return pymysql.connect(
        host="localhost",
        user="airbook_admin",
        password="Airbook_admin_x7fo1a",
        database="airbook",
    )


# @app.route("/", defaults={"path": ""})
# @app.route("/<path:path>", methods=["GET"])
@app.route("/")
def home():
    return app.send_static_file("index.html")


@app.route("/register/<register_type>", methods=["POST"])
@cross_origin(supports_credentials=True)
@raise_error
def register(register_type: str):
    conn = connect()
    data = request.get_json()
    try:
        user_type = DataType(register_type)
        if not is_user(user_type):
            raise ValueError()
    except ValueError:
        raise JsonError("Invalid registration method!")

    if data is None:
        raise JsonError("Empty data fields!")

    try:
        hashed_password, salt = generate_hash(data["password"])

        if user_type is DataType.CUST:
            insert_into(
                conn,
                user_type.get_table(),
                email=data["email"],
                name=data["name"],
                password=hashed_password,
                salt=salt,
                phone_number=data["phone_number"],
                date_of_birth=data.get("date_of_birth", ""),
                passport_number=data.get("passport_number", ""),
                passport_expiration=data.get("passport_expiration", ""),
                passport_country=data.get("passport_country", "China"),
                street=data.get("street", ""),
                city=data.get("city", ""),
                state=data.get("state", ""),
            )
            session["email"] = data["email"]
        elif user_type is DataType.STAFF:
            insert_into(
                conn,
                user_type.get_table(),
                username=data["username"],
                password=hashed_password,
                salt=salt,
                first_name=data["first_name"],
                last_name=data["last_name"],
                date_of_birth=data["date_of_birth"],
                airline_name=data["airline_name"],
            )
            session["username"] = data["username"]
        elif user_type is DataType.AGENT:
            agent_id = insert_into(
                conn,
                user_type.get_table(),
                email=data["email"],
                password=hashed_password,
                salt=salt,
            )
            session["agent_id"] = agent_id
            session["agent_email"] = data["email"]
    except KeyError as err:
        raise MissingKeyError(err.args[0])
    except QueryKeyError as err:
        raise MissingKeyError(err.get_key())
    except QueryDuplicateError as err:
        raise ExistingRegisterError(err.key, err.value)
    finally:
        conn.close()

    session["user_type"] = user_type.value

    if user_type is DataType.AGENT:
        return jsonify(result="success", user_data=dict(agent_id=agent_id))
    else:
        return jsonify(result="success")


@app.route("/search-public/<filter>", methods=["POST"])
@raise_error
def search_public(filter: str):
    data = request.get_json()
    conn = connect()
    result = json.dumps(
        do_search(conn, data, session, filter, True),
        indent=4,
        sort_keys=True,
        default=str,
    )
    conn.close()
    return jsonify(
        result="success",
        data=result,
    )


@app.route("/search/<filter>", methods=["POST"])
@cross_origin(supports_credentials=True)
@raise_error
@require_session()
def search(filter: str):
    data = request.get_json()
    conn = connect()
    result = json.dumps(
        do_search(conn, data, session, filter, False),
        indent=4,
        sort_keys=True,
        default=str,
    )
    conn.close()
    return jsonify(
        result="success",
        data=result,
    )


@app.route("/login/<login_type>", methods=["POST"])
@cross_origin(supports_credentials=True)
@raise_error
def login(login_type: str):
    data = request.get_json()
    try:
        user_type = DataType(login_type)
        if not is_user(user_type):
            raise ValueError()
    except ValueError:
        raise JsonError("Invalid login method!")
    conn = connect()
    # If no error is thrown in check_login, our user is OK
    user_data_raw = check_login(conn, user_type, **data)

    user_data = handle_login_data(user_type, user_data_raw)
    conn.close()

    return jsonify(result="success", user_data=user_data)


@app.route("/add_feedback", methods=["POST"])
@cross_origin(supports_credentials=True)
@raise_error
@require_session()
def add_feedback():
    data = request.get_json()
    if "email" not in session or session["user_type"] != DataType.CUST.value:
        raise JsonError("Only customers are allowed to add feedbacks!")
    try:
        feedback_data = dict(
            flight_number=data["flight_number"],
            dep_date=data["dep_date"],
            dep_time=data["dep_time"],
            comment=data.get("comment", ""),
            email=session["email"],
            rating=data["rating"],
        )
    except KeyError as err:
        raise MissingKeyError(err.args[0])
    conn = connect()
    result = query(
        conn,
        "SELECT * FROM Ticket WHERE (flight_number, dep_date, dep_time, email)=(%(flight_number)s, %(dep_date)s, %(dep_time)s, %(email)s) AND dep_date < UTC_DATE() OR (dep_date = UTC_DATE() AND dep_time < UTC_TIME())",
        args=feedback_data,
    )
    if result == 0:
        raise JsonError("You need to take the flight first before giving feedbacks!")
    try:
        insert_into(conn, "Feedback", **feedback_data)
    except QueryDuplicateError:
        raise JsonError("You have already given feedback for this flight!")
    finally:
        conn.close()
    return jsonify(result="success")


@app.route("/session-fetch", methods=["POST"])
@cross_origin(supports_credentials=True)
@raise_error
@require_session()
def session_fetch():
    data = request.get_json()
    conn = connect()
    user_data_raw = None
    user_type = DataType(session["user_type"])
    try:
        if user_type is DataType.CUST:
            user_data_raw = query(
                conn,
                CHECK_CUST_LOGIN,
                fetch_mode=FetchMode.ONE,
                args=dict(email=session["email"]),
            )
        elif user_type is DataType.STAFF:
            user_data_raw = query(
                conn,
                CHECK_STAFF_LOGIN,
                fetch_mode=FetchMode.ONE,
                args=dict(username=session["username"]),
            )
        elif user_type is DataType.AGENT:
            user_data_raw = query(
                conn,
                CHECK_AGENT_LOGIN,
                fetch_mode=FetchMode.ONE,
                args=dict(
                    email=session["agent_email"], booking_agent_id=session["agent_id"]
                ),
            )
    except KeyError as err:
        raise JsonError("The user session is invalid! Please login.")
    finally:
        conn.close()

    if user_data_raw is not None:
        try:
            return jsonify(
                result="success",
                user_data=handle_login_data(user_type, user_data_raw),
            )
        except IndexError as err:
            raise JsonError("The user might have been removed!")
    else:
        raise JsonError("There is no session associated with this user!")


@app.route("/logout", methods=["POST"])
@cross_origin(supports_credentials=True)
@raise_error
@require_session()
def logout():
    session.clear()
    return jsonify(result="success")


@app.route("/ticket_price", methods=["POST"])
@raise_error
def ticket_price():
    data = request.get_json()
    conn = connect()
    result = get_ticket_price(conn, data)
    conn.close()
    if result is not None and len(result) > 0:
        return jsonify(result="success", data=dict(price=float(str(result[0]))))
    else:
        raise JsonError("No ticket data is found")


convert = lambda date_str, time_str: datetime.fromisoformat(
    "{}T{}".format(date_str, time_str)
)


time_value_err_pattern = re.compile(
    r"Incorrect time value: '(.+)' for column '(.+)' at row 1"
)


@app.route("/create_flight", methods=["POST"])
@cross_origin(supports_credentials=True)
@raise_error
@require_session(DataType.STAFF)
def create_flight():
    data = request.get_json()
    flight_data: Dict[str, Any] = {}
    result = None
    conn = connect()
    try:
        flight_data["flight_number"] = data["flight_number"]
        flight_data["dep_date"] = data["dep_date"]
        flight_data["dep_time"] = data["dep_time"]
        flight_data["arr_date"] = data["arr_date"]
        flight_data["arr_time"] = data["arr_time"]
        flight_data["dep_airport"] = data["dep_airport"]
        flight_data["arr_airport"] = data["arr_airport"]
        flight_data["plane_ID"] = data["plane_ID"]
        flight_data["status"] = data["status"]
        flight_data["base_price"] = data["base_price"]
    except KeyError as err:
        conn.close()
        raise MissingKeyError(err.args[0])
    try:
        if convert(flight_data["dep_date"], flight_data["dep_time"]) >= convert(
            flight_data["arr_date"], flight_data["arr_time"]
        ):
            conn.close()
            raise JsonError("The arrival time needs to be after the arrival time!")
    except ValueError as err:
        conn.close()
        raise JsonError("The date format is in valid: {}".format(err.args[0]))
    try:
        flight_data["airline_name"] = query(
            conn, STAFF_AIRLINE, FetchMode.ONE, args=dict(username=session["username"])
        )[0]
    except QueryError:
        conn.close()
        raise JsonError("An unknown error occurs when finding your airline name.")

    try:
        result = insert_into(conn, "Flight", **flight_data)
    except QueryDuplicateError as err:
        raise JsonError(
            "The flight with the same flight number and departure datetime already exists!"
        )
    except QueryError as err:
        if err.get_error_code() == 1452:
            # Foreign key constraint
            if "plane_ID" in err.get_error_message():
                raise JsonError("The plane ID is invalid!")
        if err.get_error_code() == 1292:
            match = time_value_err_pattern.match(err.get_error_message())
            if match is not None:
                raise JsonError(
                    "The time value {} for {} is invalid!".format(
                        match.group(1), match.group(2)
                    )
                )
        print(err)
        raise JsonError(
            "Failed to create the new flight! Please contact the maintainer."
        )
    finally:
        conn.close()
    if result is not None:
        return jsonify(result="success")
    else:
        raise JsonError("Failed due to an unknown error.")


@app.route("/ticket_purchase", methods=["POST"])
@cross_origin(supports_credentials=True)
@raise_error
@require_session()
def ticket_purchase():
    data = request.get_json()
    if session["user_type"] in (DataType.CUST.value, DataType.AGENT.value):
        ticket_data = {}
        now = datetime.now()
        conn = connect()
        try:
            # only the booking agent can set the email
            ticket_data["email"] = (
                session["email"]
                if session["user_type"] == DataType.CUST.value
                else data["email"]
            )
            ticket_data["card_type"] = data["card_type"]
            ticket_data["card_number"] = data["card_number"]
            ticket_data["name_on_card"] = data["name_on_card"]
            ticket_data["exp_date"] = data["exp_date"]
            ticket_data["airline_name"] = data["airline_name"]
            ticket_data["flight_number"] = int(data["flight_number"])
            ticket_data["dep_date"] = data["dep_date"]
            ticket_data["dep_time"] = data["dep_time"]
            if "agent_id" in session:
                ticket_data["booking_agent_id"] = session["agent_id"]
            # ticket_data["purchase_date"] = now.strftime("%Y-%m-%d")
            # ticket_data["purchase_time"] = now.strftime("%H:%M:%S")
            ticket_data["sold_price"] = get_ticket_price(conn, data)
        except KeyError as err:
            conn.close()
            raise MissingKeyError(err.args[0])
        except ValueError as err:
            conn.close()
            raise JsonError("The flight number should be a number!")
        result = query(
            conn,
            "SELECT * FROM Flight WHERE (flight_number, dep_date, dep_time)=(%(flight_number)s, %(dep_date)s, %(dep_time)s) AND dep_date > UTC_DATE() OR (dep_date = UTC_DATE() AND dep_time > UTC_TIME())",
            args=ticket_data,
        )
        if len(result) == 0:
            conn.close()
            raise JsonError("Cannot purchase a ticket for a flight in the past!")

        result = insert_into(conn, "Ticket", **ticket_data)
        if "booking_agent_id" in ticket_data:
            insert_into(
                conn,
                "Book",
                ticket_ID=result,
                booking_agent_id=ticket_data["booking_agent_id"],
                commission=float(
                    query(
                        conn,
                        "SELECT sold_price FROM Ticket WHERE ticket_id={}".format(
                            result
                        ),
                        FetchMode.ONE,
                    )[0]
                )
                * 0.1,
            )
        conn.close()
        return jsonify(result="success")
    else:
        raise JsonError("Only customers or booking agents can purchase tickets.")


@app.route("/change_status", methods=["POST"])
@cross_origin(supports_credentials=True)
@raise_error
@require_session(DataType.STAFF)
def change_status():
    data = request.get_json()
    flight_data = {}
    try:
        flight_data["flight_number"] = data["flight_number"]
        flight_data["dep_date"] = data["dep_date"]
        flight_data["dep_time"] = data["dep_time"]
        flight_data["status"] = data["status"]
    except KeyError as err:
        raise MissingKeyError(err.args[0])
    conn = connect()
    try:
        flight_data["airline_name"] = query(
            conn, STAFF_AIRLINE, FetchMode.ONE, args=dict(username=session["username"])
        )[0]
    except QueryError:
        conn.close()
        raise JsonError("An unknown error occurs when finding your airline name.")
    result = query(conn, UPDATE_STATUS, args=flight_data)
    conn.close()
    return jsonify(result="success")


@app.route("/add_airport", methods=["POST"])
@cross_origin(supports_credentials=True)
@raise_error
@require_session(DataType.STAFF)
def add_airport():
    data = request.get_json()
    airport_data = {}
    try:
        airport_data["airport_name"] = data["airport_name"]
        airport_data["city"] = data["city"]
    except KeyError as err:
        raise MissingKeyError(err.args[0])
    conn = connect()
    try:
        insert_into(conn, "Airport", **airport_data)
    except QueryDuplicateError as err:
        conn.close()
        raise JsonError("The airport already exists!")
    conn.close()
    return jsonify(result="success")


@app.route("/add_airplane", methods=["POST"])
@cross_origin(supports_credentials=True)
@raise_error
@require_session(DataType.STAFF)
def add_airplane():
    data = request.get_json()
    airplane_data = {}
    try:
        airplane_data["plane_ID"] = data["plane_ID"]
        airplane_data["seat_capacity"] = data["seat_capacity"]
    except KeyError as err:
        raise MissingKeyError(err.args[0])
    conn = connect()
    try:
        airplane_data["airline_name"] = query(
            conn, STAFF_AIRLINE, FetchMode.ONE, args=dict(username=session["username"])
        )[0]
    except QueryError:
        conn.close()
        raise JsonError("An unknown error occurs when finding your airline name.")
    try:
        insert_into(conn, "Airplane", **airplane_data)
    except QueryDuplicateError as err:
        raise JsonError("The airplane already exists!")
    finally:
        conn.close()
    return jsonify(result="success")


@app.errorhandler(401)
def forbidden(error):
    return jsonify(
        result="error",
        message="Looks like you are trying to access something that requires login.",
    )
