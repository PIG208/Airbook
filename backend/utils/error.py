from flask import jsonify
from functools import wraps

class JsonError(Exception):
    def __init__(self, message: str, result: str="error"):
        self.json_data = jsonify(message=message, result="error")
    
    def get_json(self):
        return self.json_data


def raise_error(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except JsonError as err:
            return err.get_json()

    return wrapper

