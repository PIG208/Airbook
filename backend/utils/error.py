from flask import jsonify
from functools import wraps

class JsonError(AirbookError):
    def __init__(self, message: str, result: str="error", **kwargs):
        self.json_data = jsonify(message=message, result="error", **kwargs)
    
    def get_json(self):
        return self.json_data

class MissingKeyError(JsonError):
    def __init__(self, key: str):
        super().__init__('Missing required key "{}"!'.format(key), key=key)


def raise_error(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except JsonError as err:
            return err.get_json()

    return wrapper

