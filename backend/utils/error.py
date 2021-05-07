from flask import jsonify
from functools import wraps


class AirbookError(Exception):
    pass


class JsonError(AirbookError):
    def __init__(self, message: str, result: str = "error", **kwargs):
        self.json_data = jsonify(message=message, result="error", **kwargs)

    def get_json(self):
        return self.json_data


class MissingKeyError(JsonError):
    def __init__(self, key: str):
        super().__init__('Missing required key "{}"!'.format(key), key=key)


class ExistingRegisterError(JsonError):
    def __init__(self, key: str, value: str):
        super().__init__(
            "{} has already been used!".format(value),
            key=key,
            value=value,
        )


class QueryError(AirbookError):
    def get_error_code(self):
        return self.args[0]

    def get_error_message(self):
        return self.args[1]


class QueryDuplicateError(QueryError):
    def __init__(self, key: str, value: str):
        self.key = key
        self.value = value


class QueryKeyError(QueryError):
    def __init__(self, key: str):
        self.key = key

    def get_key(self):
        return self.key


def raise_error(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except JsonError as err:
            return err.get_json()

    return wrapper
