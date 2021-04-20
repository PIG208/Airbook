from os import urandom
from flask import Flask, request, jsonify, make_response, session
from backend.utils.authentication import check_login, require_session
from backend.utils.query import insert_into, query
)
from backend.utils.authentication import PUBLIC_FILTERS, DATA_TYPE, is_user
from backend.utils.encryption import check_hash, generate_hash
from backend.utils.error import raise_error, JsonError, MissingKeyError
from backend.search import do_search

import json
import pymysql.cursors

app = Flask(__name__)
app.secret_key = urandom(16)
conn = pymysql.connect(
    host='localhost', 
    user='airbook_admin', 
    password='Airbook_admin_x7fo1a', 
    database='airbook'
)

@app.route('/')
def home():
    session['username'] = 'test'
    response = jsonify(
        result="success"
    )
    return response

@app.route('/pre')
@require_session
def asd():
    response = jsonify(
        result="success"
    )
    return response

@app.route('/register/<register_type>', methods=['GET','POST'])
@raise_error
def register(register_type: str):
    data = request.get_json()
    try:
        register_type = DATA_TYPE(register_type)
        if not is_user(register_type):
            raise ValueError()
    except ValueError:
        raise JsonError('Invalid registration method!')

    if data is None:
        raise JsonError('Empty data fields!')

    try:
        hashed_password, salt = generate_hash(data['password'])

        if register_type == DATA_TYPE.CUST:
            insert_into(
                conn, 
                register_type.get_table(), 
                email=data['email'],
                name=data['name'],
                password=hashed_password,
                salt=salt,
                phone_number=data['phone_number'],
                date_of_birth=data.get('date_of_birth', ''),
                passport_number=data.get('passport_number', ''),
                passport_expiration=data.get('passport_expiration', ''),
                passport_country=data.get('passport_country', 'China'),
                street=data.get('street', ''),
                city=data.get('city', ''),
                state=data.get('state', ''),
            )
            session['email'] = data['email']
        elif register_type == DATA_TYPE.STAFF:
            insert_into(
                conn,
                register_type.get_table(),
                username=data['username'],
                password=hashed_password,
                salt=salt,
                first_name=data['first_name'],
                last_name=data['last_name'],
                date_of_birth=data['date_of_birth'],
                airline_name=data['airline_name'],
            )
            session['username'] = data['username']
        elif register_type == DATA_TYPE.AGENT:
            agent_id = insert_into(
                conn,
                register_type.get_table(),
                email=data['email'],
                password=hashed_password,
                salt=salt,
            )
            session['agent_id'] = agent_id
            session['agent_email'] = data['email']
    except KeyError as err:
        raise MissingKeyError(err.args[0])

    session['user_type'] = login_type.value

    return jsonify(
        result="success"
    )

@app.route('/search-public/<filter>', methods=['POST'])
@raise_error
def search_public(filter: str):
    data = request.get_json()
    result = json.dumps(do_search(conn, data, session, filter, True), indent=4, sort_keys=True, default=str)
    return jsonify(
        result="success",
        data=result,
    )

@app.route('/search/<filter>', methods=['POST'])
@require_session
@raise_error
def search(filter: str):
    data = request.get_json()
    result = json.dumps(do_search(conn, data, session, filter, False), indent=4, sort_keys=True, default=str)
    return jsonify(
        result="success",
        data=result,
    )

@app.route('/login/<login_type>', methods=['GET','POST'])
@raise_error
def login(login_type: str):
    data = request.get_json()
    login_type = DATA_TYPE(login_type)
    # If no error is thrown in check_login, our user is OK
    user_data = check_login(conn, login_type, **data)
    
    session['user_type'] = login_type.value
    if login_type == DATA_TYPE.CUST:
        session['email'] = user_data[0]
    elif login_type == DATA_TYPE.AGENT:
        session['agent_id'] = user_data[0]
        session['agent_email'] = user_data[1]
    elif login_type == DATA_TYPE.STAFF:
        session['username'] = user_data[0]

    return jsonify(
        result="success"
    )
    

@app.errorhandler(401)
def forbidden(error):
    return jsonify(
        result="error",
        message="Looks like you are trying to access something that requires login.",
    )