from os import urandom
from flask import Flask, request, jsonify, make_response, session
from flask_cors import CORS, cross_origin  # type: ignore
from backend.utils.authentication import check_login, require_session
from backend.utils.query import insert_into, query
from backend.utils.authentication import PublicFilters, DataType, is_user
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
CORS(app)
app.secret_key = urandom(16)
conn = pymysql.connect(
    host="localhost",
    user="airbook_admin",
    password="Airbook_admin_x7fo1a",
    database="airbook",
)


@app.route("/", methods=["GET"])
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
        return jsonify(result="success", id=agent_id)
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
    user_data = check_login(conn, user_type, **data)

    session.clear()
    session["user_type"] = user_type.value
    if user_type == DataType.CUST:
        session["email"] = user_data[0]
    elif user_type == DataType.AGENT:
        session["agent_id"] = user_data[0]
        session["agent_email"] = user_data[1]
    elif user_type == DataType.STAFF:
        session["username"] = user_data[0]

    return jsonify(result="success")


@app.errorhandler(401)
def forbidden(error):
    return jsonify(
        result="error",
        message="Looks like you are trying to access something that requires login.",
    )
