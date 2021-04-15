
import unittest
import pymysql.cursors

from backend.utils.query import (
    query,
    insert_into,
    DATA_TYPE,
    BASIC_SELECT,
    BASIC_DELETE,
    DATA_TYPE,
    FETCH_MODE,
)
from backend.utils.error import QueryError

class TestQuery(unittest.TestCase):
    def setUp(self):    
        self.hashed_password, self.salt = 'a4b615e9e91c8f444965e4fdefa62b88e3d69eab56323baa687d01f58266', 'e3c20862d1859ff9db1882882ffc99d4'
        self.conn = pymysql.connect(
            host='localhost', 
            user='airbook_admin', 
            password='Airbook_admin_x7fo1a', 
            database='airbook'
        )

    def test_select_all_tables(self):
        print(query(self.conn, "SELECT * FROM BookingAgent"))
        for data_type in DATA_TYPE:
            query(self.conn, BASIC_SELECT.format(table=data_type.get_table(), predicates=''))
    
    def test_insert(self):
        result = insert_into(self.conn, DATA_TYPE.AGENT.get_table(), email='asdasd@asd.com', password=self.hashed_password, salt=self.salt)
        self.assertEqual(self.conn.insert_id(), 2)

        result = insert_into(self.conn, DATA_TYPE.AGENT.get_table(), email='asdsasd@asd.com', password=self.hashed_password, salt=self.salt)
        self.assertEqual(self.conn.insert_id(), 3)

        insert_into(self.conn, DATA_TYPE.CUST.get_table(), email='asdsasd@asd.com', name='test', password=self.hashed_password, salt=self.salt)
        result = query(self.conn, BASIC_SELECT.format(table=DATA_TYPE.CUST.get_table(), predicates='WHERE email=\"asdsasd@asd.com\"'), FETCH_MODE.ONE)
        expected = ('asdsasd@asd.com', 'test', 'a4b615e9e91c8f444965e4fdefa62b88e3d69eab56323baa687d01f58266', 'e3c20862d1859ff9db1882882ffc99d4', None, None, None, None, None, None, None, None, None)
        self.assertEqual(result, expected)

    def test_insert_error(self):
        insert_into(self.conn, DATA_TYPE.CUST.get_table(), email='asdsasd@asdk.com', name='test', password=self.hashed_password, salt=self.salt)
        with self.assertRaises(QueryError) as err:
            insert_into(self.conn, DATA_TYPE.CUST.get_table(), email='asdsasd@asdk.com', name='test', password=self.hashed_password, salt=self.salt)
        expected = (1062, "Duplicate entry 'asdsasd@asdk.com' for key 'Customer.PRIMARY'")
        self.assertEqual(err.exception.args, expected)

