from unittest import TestCase, main
from backend.utils.encryption import (
    generate_hash,
    check_hash,
)


class TestEncryption(TestCase):
    def test_encrypt_decrypt(self):
        password = "12345"
        hashed_password, salt = generate_hash("12345")
        self.assertTrue(check_hash(password, hashed_password, salt))


if __name__ == "__main__":
    main()
