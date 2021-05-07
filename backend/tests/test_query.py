import unittest
import pymysql.cursors

from backend.utils.query import (
    query,
    insert_into,
    DataType,
    BASIC_SELECT,
    BASIC_DELETE,
    FetchMode,
)
from backend.utils.error import QueryError


class TestQuery(unittest.TestCase):
    def setUp(self):
        self.hashed_password, self.salt = (
            "a4b615e9e91c8f444965e4fdefa62b88e3d69eab56323baa687d01f58266",
            "e3c20862d1859ff9db1882882ffc99d4",
        )
        self.conn = pymysql.connect(
            host="localhost",
            user="airbook_admin",
            password="Airbook_admin_x7fo1a",
            database="airbook",
        )

    def test_select_all_tables(self):
        for data_type in DataType:
            query(
                self.conn,
                BASIC_SELECT.format(table=data_type.get_table(), predicates=""),
            )

    def test_insert(self):
        result = insert_into(
            self.conn,
            DataType.AGENT.get_table(),
            email="asdasd@asd.com1",
            password=self.hashed_password,
            salt=self.salt,
        )
        self.assertEqual(result, 2)

        result = insert_into(
            self.conn,
            DataType.AGENT.get_table(),
            email="asdsasd@asd.com2",
            password=self.hashed_password,
            salt=self.salt,
        )
        self.assertEqual(result, 3)

        insert_into(
            self.conn,
            DataType.CUST.get_table(),
            email="asdsasd@asd.com3",
            name="test",
            password=self.hashed_password,
            salt=self.salt,
        )

        result = query(
            self.conn,
            BASIC_SELECT.format(
                table=DataType.CUST.get_table(),
                predicates="",
            ),
            FetchMode.ONE,
        )
        expected = (
            "asdsasd@asd.com3",
            "test",
            "a4b615e9e91c8f444965e4fdefa62b88e3d69eab56323baa687d01f58266",
            "e3c20862d1859ff9db1882882ffc99d4",
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
        )
        self.assertEqual(result, expected)

    def test_insert_error(self):
        insert_into(
            self.conn,
            DataType.CUST.get_table(),
            email="asdsasd@asdkas.com",
            name="test",
            password=self.hashed_password,
            salt=self.salt,
        )
        with self.assertRaises(QueryError) as err:
            insert_into(
                self.conn,
                DataType.CUST.get_table(),
                email="asdsasd@asdkas.com",
                name="test",
                password=self.hashed_password,
                salt=self.salt,
            )
        expected = ("PRIMARY", "asdsasd@asdkas.com")
        self.assertEqual(err.exception.args, expected)
