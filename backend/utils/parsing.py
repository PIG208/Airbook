from typing import Sequence, Dict, Any
from flask import session
from backend.utils.authentication import DataType


def handle_login_data(user_type: DataType, user_data_raw: Sequence):
    """
    Modify the session with the user data and return a dictionary containing user data.
    """
    user_data: Dict[str, Any] = {}

    session.clear()
    user_data["user_type"] = user_type.value
    session["user_type"] = user_type.value
    if user_type == DataType.CUST:
        session["email"] = user_data_raw[0]

        user_data["email"] = user_data_raw[0]
        user_data["name"] = user_data_raw[1]
        user_data["phone_number"] = user_data_raw[4]
        user_data["date_of_birth"] = user_data_raw[5]
        user_data["passport_number"] = user_data_raw[6]
        user_data["passport_expiration"] = user_data_raw[7]
        user_data["passport_country"] = user_data_raw[8]
        user_data["building_number"] = user_data_raw[9]
        user_data["street"] = user_data_raw[10]
        user_data["city"] = user_data_raw[11]
        user_data["state"] = user_data_raw[12]
    elif user_type == DataType.AGENT:
        session["agent_id"] = user_data_raw[0]
        session["agent_email"] = user_data_raw[1]

        user_data["agent_id"] = user_data_raw[0]
        user_data["email"] = user_data_raw[1]
    elif user_type == DataType.STAFF:
        session["username"] = user_data_raw[0]

        user_data["username"] = user_data_raw[0]
        user_data["first_name"] = user_data_raw[3]
        user_data["last_name"] = user_data_raw[4]
        user_data["date_of_birth"] = user_data_raw[5]
        user_data["airline_name"] = user_data_raw[6]

    return user_data
