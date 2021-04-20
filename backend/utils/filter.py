from typing import Optional, TypeVar, Generic, Iterable, Any, Union
from enum import Enum, auto
from functools import partial
from datetime import date, time, datetime

"""
Generate SQL queries for certain filters.
Support specifying date/time range for dep/arr date/time;
specifying  dep airport/city and arr airport/city;
The range can be one bounded. All conditions are optional.
A miss match between airport and city will result in an empty query.
Returns multiple query results if round_trip is set to True.
"""
T = TypeVar('T', date, time, int)
V = TypeVar('V', int, str)
class FilterRange(Generic[T]):
    def __init__(self, lower: Optional[T]=None, upper: Optional[T]=None):
        self._lower = '\"{}\"'.format(lower)
        self._upper = '\"{}\"'.format(upper)
    
    @property
    def lower(self) -> str:
        return self._lower
    
    @property
    def upper(self) -> str:
        return self._upper
    
class FilterGroup(Enum):
    DAY = 'DAY'
    MONTH = 'MONTH'
    YEAR =  'YEAR'

class FilterSet(Generic[V]):
    def __init__(self, filter_set: Iterable[V]):
        # Note that the order doesn't matter here as the order of an iterable can be non-deterministic
        self._filter_set = {item for item in filter_set}
    
    @property
    def filter_set(self):
        return self._filter_set
    
    def get_one(self):
        if len(self._filter_set) == 0:
            return None
        try:
            return self._filter_set.pop()
        except TypeError:
            return None

class FilterType(Enum):
    ALL_FUTURE_FLIGHTS = 'all_future'
    CUST_FUTURE_FLIGHTS = 'customer_future'
    CUST_TICKETS = 'customer_tickets'
    # The following filters are advanced filters that require the filter generator.
    # We need to keep track of the advanced filters in the set ADVANCED_FILTERS.
    ADVANCED_FLIGHT = 'advanced_flight'
    ADVANCED_SPENDINGS = 'advanced_spendings'

SELECT_ALL_FUTURE_FLIGHTS = 'SELECT * FROM future_flights;'
SELECT_CUSTOMER_TICKETS = 'call customer_tickets(%(email)s);' # "email" must matches the key name for session
SELECT_CUSTOMER_FLIGHTS = 'call customer_flights(%(email)s);'

FILTER_TO_QUERY_MAP = {
    FilterType.ALL_FUTURE_FLIGHTS: SELECT_ALL_FUTURE_FLIGHTS,
    FilterType.CUST_FUTURE_FLIGHTS: SELECT_CUSTOMER_FLIGHTS,
    FilterType.CUST_TICKETS: SELECT_CUSTOMER_TICKETS,
}

ADVANCED_FILTERS = {
    FilterType.ADVANCED_FLIGHT,
    FilterType.ADVANCED_SPENDINGS,
}

def is_advanced_filter(filter: FilterType):
    return filter in ADVANCED_FILTERS

class Filter:
    def __init__(self, base_query: str):
        self.base_query = base_query
        self.where_clause = []
        self.string_values = []
        
    def add_filter_range(self, column_name: str, range: Optional[FilterRange[T]]):
        """
        Create a ranged constraint bounded by a specified range. (String formatting is safe as soon as the type is legal)
        """
        if range is None:
            return self
        
        result = []
        if range.lower is not None:
            result.append('{column_name} > {lower_bound}'.format(column_name=column_name, lower_bound=range.lower))

        if range.upper is not None:
            result.append('{column_name} < {upper_bound}'.format(column_name=column_name, upper_bound=range.upper))
        
        self.where_clause.append(' AND '.join(result))
        
        return self
    
    def add_filter_set(self, column_name: str, filter_set: Optional[FilterSet[Union[str, int]]]):
        if filter_set is None:
            return self 
        if len(filter_set.filter_set) <= 1:
            self.add_optional_constraint(column_name, filter_set.get_one())
            return self
        result = ['%s' for i in range(len(filter_set.filter_set))]
        for value in filter_set.filter_set:
            self.string_values.append(value)
        self.where_clause.append('{column_name} IN ({filter_set})'.format(column_name=column_name, filter_set=','.join(result)))
        return self

    def add_aggregated(self, column_name: str, func_name: str):
        pass
        
    def add_optional_constraint(self, column_name: str, constraint: Optional[str]):
        """
        Create a '=' constraint in the where clause if it's specified. The arguments still need to be 
        passed to cursor.execute as we cannot trust user inputs of string values (like for airport name).
        """
        if constraint is None:
            return self
        else:
            self.where_clause.append('{}=%s'.format(column_name))
            self.string_values.append(constraint)
            return self
    
    def get_formatted(self):
        """
        Returns a query string, formatted, and the values left for string interpolation.
        """
        return self.base_query.format(where='WHERE ' + ' AND '.join(self.where_clause) if len(self.where_clause) > 0 else ''), self.string_values

def get_filter_flight(
    dep_date_range: Optional[FilterRange[date]] = None,
    dep_time_range: Optional[FilterRange[time]] = None,
    arr_date_range: Optional[FilterRange[date]] = None,
    arr_time_range: Optional[FilterRange[time]] = None,
    dep_airport: Optional[str] = None,
    dep_city: Optional[str] = None,
    arr_airport: Optional[str] = None,
    arr_city: Optional[str] = None,
    customer_emails: Optional[FilterSet] = None,
    round_trip: bool = False,
):
    filter = Filter('SELECT * FROM Flight {where}')
    filter.add_filter_range('dep_date', dep_date_range)\
        .add_filter_range('dep_time', dep_time_range)\
        .add_filter_range('arr_date', arr_date_range)\
        .add_filter_range('arr_time', arr_time_range)\
        .add_optional_constraint('dep_airport', dep_airport)\
        .add_optional_constraint('arr_airport', arr_airport)\
        .add_optional_constraint('dep_city', dep_city)\
        .add_optional_constraint('arr_city', arr_city)\
        .add_filter_set('email', customer_emails)
    return filter.get_formatted()

def get_filter_spendings(
    emails: FilterSet[str],
    purchase_date_range: Optional[FilterRange[date]] = None,
    purchase_time_range: Optional[FilterRange[time]] = None,
    filter_group: Optional[FilterGroup] = None,
):
    if filter_group:
        filter = Filter('SELECT {Group}(purchase_date), sum(actual_price) FROM spendings \
            {{where}} GROUP BY {Group}(purchase_date)'.format(Group=group_by.value))
    else:
        filter = Filter('SELECT purchase_date, actual_price FROM spendings {where}')

    filter.add_filter_range('purchase_date', purchase_date_range)\
        .add_filter_range('purchase_time', purchase_time_range)\
        .add_filter_set('email', emails)
    return filter.get_formatted()