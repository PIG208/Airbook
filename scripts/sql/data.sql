SELECT 'Inserting the test data.' AS '';
USE airbook;

INSERT INTO Airline VALUES (
    'China Eastern'
), (
    'Mars X134'
), (
    'Evergreen'
);

INSERT INTO Airport VALUES (
    'JFK',
    'New York City'
), (
    'PVG',
    'Shanghai'
), (
    'MSC',
    'Secchi'
);

INSERT INTO Airplane VALUES (
    'Evergreen',
    5,
    200
), (
    'Evergreen',
    322,
    16
), (
    'Mars X134',
    0,
    4
), (
    'China Eastern',
    20,
    60
), (
    'China Eastern',
    21,
    100
), (
    'China Eastern',
    22,
    120
);

INSERT INTO Flight VALUES (
    12345,
    '2021-3-28',
    '13:33:44',
    'PVG',
    '2021-3-28',
    '23:43:44',
    'JFK',
    40,
    'ontime',
    5,
    'Evergreen'
), (
    2323,
    '2021-5-28',
    '15:31:14',
    'JFK',
    '2021-5-29',
    '12:40:14',
    'MSC',
    45,
    'delayed',
    22,
    'China Eastern'
), (
    7777,
    '2022-5-28',
    '15:31:14',
    'MSC',
    '2022-5-29',
    '12:40:14',
    'JFK',
    1000,
    'ontime',
    20,
    'China Eastern'
), (
    7777,
    '2021-5-28',
    '15:31:14',
    'MSC',
    '2021-5-29',
    '12:40:14',
    'JFK',
    1000,
    'ontime',
    20,
    'China Eastern'
);
-- The passwords are "wendy", "goodman", "best123"
INSERT INTO Customer VALUES (
    'speiaz123@nyu.edu',
    'sepia H',
    'd4bb84d0fcf9537a6e5f58039238f248584c8a2a05c0383bc364f129111f',
    'd365516baf21080b547f744cffb7b6dd',
    '1234561',
    '2001-01-11',
    'YCZ22344',
    '2024-05-24',
    'Cambodia',
    123,
    'Book St.',
    'Warta City',
    ''
), (
    'goodman@gmail.com',
    'Saul Goodman',
    'eb12701818f4a84a437a7f173f0443b770b24939d139ee9c44c19644c61e',
    '1f358d092d0cfc85c133e9837cb15595',
    '5058425662',
    '1960-11-12',
    'C12345678',
    '2030-01-05',
    'United States',
    9800,
    'Montgomery Blvd',
    'Albuquerque',
    'NE'
), (
    'ny2311@nyu.edu',
    'Mary',
    'b96de32e0432443b6f4964db3670358cc79bcd707ea4e1518825af236ac9',
    '30447aaf20877f45f941c66366fa1425',
    '4240559312',
    '1999-05-15',
    'C20100551',
    '2030-01-05',
    'United States',
    12,
    'Houston Street',
    'New York City',
    'NY'
);

-- The password is best123 
INSERT INTO BookingAgent (email, password, salt) VALUES (
    'book3083@booking.com',
    'b96de32e0432443b6f4964db3670358cc79bcd707ea4e1518825af236ac9',
    '30447aaf20877f45f941c66366fa1425'
);

INSERT INTO Ticket (email,sold_price,card_type,card_number, name_on_card,exp_date,purchase_date,purchase_time,airline_name,flight_number,dep_date,dep_time,booking_agent_ID) VALUES (
    'speiaz123@nyu.edu',
    40,
    'credit',
    '2323555502015234',
    'Sepia Hi',
    '2027-04-23',
    '2021-03-22',
    '15:30:22',
    'Evergreen',
    12345,
    '2021-3-28',
    '13:33:44',
    NULL
), (
    'ny2311@nyu.edu',
    40,
    'credit',
    1234555500002220,
    'Mark',
    '2027-06-30',
    '2021-03-24',
   '19:20:15',
    'Evergreen',
    12345,
    '2021-3-28',
    '13:33:44',
    NULL
), (
    'ny2311@nyu.edu',
    100,
    'credit',
    1234555500002220,
    'Mark',
    '2027-06-30',
    '2021-04-24',
    '12:20:15',
    'Evergreen',
    12345,
    '2021-3-28',
    '13:33:44',
    1
), (
    'ny2311@nyu.edu',
    2000,
    'credit',
    1234555500002220,
    'Mark',
    '2027-06-30',
    '2021-12-24',
    '05:20:15',
    'Evergreen',
    12345,
    '2021-3-28',
    '13:33:44',
    1
), (
    'goodman@gmail.com',
    45,
    'debt',
    5424060612315555,
    'James Morgan McGill',
    '2027-06-30',
    '2021-03-20',
    '06:15:44',
    'Evergreen',
    12345,
    '2021-3-28',
    '13:33:44',
    1
);

INSERT INTO Book VALUES (
    3,
    1,
    4.5
), (
    4,
    1,
    25
), (
    5,
    1,
    200
);

INSERT INTO Feedback ( flight_number, dep_date, dep_time, email, rate, comment) VALUES (
    12345,
    '2021-3-28',
    '13:33:44',
    'goodman@gmail.com',
    5,
    'This is the best flight ever..'
);

-- The password is wendy
INSERT INTO AirlineStaff VALUES (
    'staffnumberone',
    'd4bb84d0fcf9537a6e5f58039238f248584c8a2a05c0383bc364f129111f',
    'd365516baf21080b547f744cffb7b6dd',
    'Jessie',
    'Pinkman',
    '1992-02-04',
    'China Eastern'
);

INSERT INTO PhoneNumber VALUES (
    'staffnumberone',
    '1231551551'
), (
     'staffnumberone',
     '2323556786'
);