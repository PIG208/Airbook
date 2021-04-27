from os import urandom
from hashlib import pbkdf2_hmac

HASH_NAME = 'sha256'
ITERATIONS = 10000
DKLEN = 30

def generate_hash(plain_text: str):
    salt = urandom(16)
    return pbkdf2_hmac(hash_name=HASH_NAME, password=plain_text.encode('utf-8'), salt=salt, iterations=ITERATIONS, dklen=DKLEN).hex(), salt.hex()

def check_hash(plain_text: str, hashed_text: str, salt: str):
    salt_bytes = bytes.fromhex(salt)
    return pbkdf2_hmac(hash_name=HASH_NAME, password=plain_text.encode('utf-8'), salt=salt_bytes, iterations=ITERATIONS, dklen=DKLEN).hex() == hashed_text