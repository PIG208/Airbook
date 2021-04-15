
import unittest
import pymysql.cursors

from backend.utils.query import (
    query,
    DATA_TYPE,
    BASIC_SELECT,
)

class TestQuery(unittest.TestCase):
    def setUp(self):    
        self.conn = pymysql.connect(
            host='localhost', 
            user='airbook_admin', 
            password='Airbook_admin_x7fo1a', 
            database='airbook'
        )

    def test_select_all_tables(self):
        query(self.conn, BASIC_SELECT.format(table=data_type.get_table()))