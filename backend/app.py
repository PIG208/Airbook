from os import urandom
from flask import Flask, request, jsonify, make_response, session
from backend.utils.authentication import check_login, require_session
from backend.utils.query import (
    insert_into, 
    query, 
    FUTURE_FLIGHTS, 
    DELAYED_FLIGHTS, 
    DATA_TYPE,
)
from backend.utils.encryption import check_hash, generate_hash
from backend.utils.error import raise_error, JsonError

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

@app.route('/register', methods=['GET','POST'])
@raise_error
def register():
    data = request.get_json()
    if data is None:
        raise JsonError('Empty data fields!')

    hashed_password, salt = generate_hash(data['password'])
    insert_into(
        conn, 
        "Customer", 
        email=data['email'],
        name=data['name'],
        password=hashed_password,
        phone_number=data['phone_number'],
        date_of_birth=data.get('date_of_birth', ''),
        passport_number=data.get(''),
        passport_expiration='2025-4-4',
        passport_country='China',
        street='Jay Street',
        city='New York',
        state='NY'
    )
    return jsonify(
        result="success"
    )

@app.route('/search/<category>')
@require_session
def serach():
    return jsonify(
        result="success"
    )

@app.route('/login/<login_type>', methods=['GET','POST'])
@raise_error
def login(login_type: str):
    data = request.get_json()
    login_type = DATA_TYPE(login_type)
    # If no error is thrown in check_login, our user is OK
    user_data = check_login(conn, login_type, **data)
    
    session['DATA_TYPE'] = login_type.value
    session['identifier'] = user_data[0]

    return jsonify(
        result="success"
    )
    

@app.errorhandler(403)
def forbidden(error):
    return jsonify(
        result="error",
        message="Looks like you are trying to access something forbidden.",
    )