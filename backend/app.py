from typing import Any, Dict
from os import urandom
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
conn = pymysql.connect(
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

    session["user_type"] = user_type.value

    if user_type is DataType.AGENT:
        return jsonify(result="success", user_data=dict(agent_id=agent_id))
    else:
        return jsonify(result="success")


@app.route("/search-public/<filter>", methods=["POST"])
@raise_error
def search_public(filter: str):
    data = request.get_json()
    result = json.dumps(
        do_search(conn, data, session, filter, True),
        indent=4,
        sort_keys=True,
        default=str,
    )
    return jsonify(
        result="success",
        data=result,
    )


@app.route("/search/<filter>", methods=["POST"])
@cross_origin(supports_credentials=True)
@require_session
@raise_error
def search(filter: str):
    data = request.get_json()
    result = json.dumps(
        do_search(conn, data, session, filter, False),
        indent=4,
        sort_keys=True,
        default=str,
    )
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
    # If no error is thrown in check_login, our user is OK
    user_data_raw = check_login(conn, user_type, **data)

    user_data = handle_login_data(user_type, user_data_raw)

    return jsonify(result="success", user_data=user_data)


@app.route("/session-fetch", methods=["POST"])
@cross_origin(supports_credentials=True)
@require_session
@raise_error
def session_fetch():
    data = request.get_json()
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
@require_session
@raise_error
def logout():
    session.clear()
    return jsonify(result="success")


@app.route("/ticket_price", methods=["POST"])
@raise_error
def ticket_price():
    data = request.get_json()
    result = get_ticket_price(conn, data)
    if result is not None and len(result) > 0:
        return jsonify(result="success", data=dict(price=float(str(result[0]))))
    else:
        raise JsonError("No ticket data is found")


@app.route("/ticket_purchase", methods=["POST"])
@cross_origin(supports_credentials=True)
@require_session
@raise_error
def ticket_purchase():
    data = request.get_json()
    if session["user_type"] in (DataType.CUST.value, DataType.AGENT.value):
        ticket_data = {}
        now = datetime.now()
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
            ticket_data["purchase_date"] = now.strftime("%Y-%m-%d")
            ticket_data["purchase_time"] = now.strftime("%H:%M:%S")
            ticket_data["sold_price"] = get_ticket_price(conn, data)
        except KeyError as err:
            raise MissingKeyError(err.args[0])
        except ValueError as err:
            raise JsonError("The flight number should be a number!")
        insert_into(conn, "Ticket", **ticket_data)
        return jsonify(result="success")
    else:
        raise JsonError("Only customers or booking agents can purchase tickets.")


@app.errorhandler(401)
def forbidden(error):
    return jsonify(
        result="error",
        message="Looks like you are trying to access something that requires login.",
    )
