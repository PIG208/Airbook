SELECT 'Setting up the tables.' AS '';
USE airbook;

CREATE TABLE Airline(
    airline_name VARCHAR(20) NOT NULL,
    PRIMARY KEY(airline_name)
);

CREATE TABLE Airport(
    airport_name VARCHAR(20) NOT NULL,
    city VARCHAR(30),
    PRIMARY KEY(airport_name)
);

CREATE TABLE Airplane(
    airline_name VARCHAR(20) NOT NULL,
    plane_ID INT(5) NOT NULL,
    seat_capacity INT NOT NULL,
    PRIMARY KEY(airline_name, plane_ID),
    FOREIGN KEY (airline_name) REFERENCES Airline(airline_name)
);

CREATE TABLE Flight(
    flight_number INT(5) NOT NULL,
    dep_date DATE NOT NULL,
    dep_time TIME NOT NULL,
    dep_airport VARCHAR(20),
    arr_date DATE,
    arr_time TIME,
    arr_airport VARCHAR(20),
    base_price DECIMAL(15,2) NOT NULL,
    status ENUM('ontime','delayed'),
    plane_ID INT(5) NOT NULL,
    airline_name VARCHAR(20) NOT NULL,
    PRIMARY KEY(flight_number, dep_date, dep_time),
    FOREIGN KEY (dep_airport) REFERENCES Airport(airport_name), 
    FOREIGN KEY (arr_airport) REFERENCES Airport(airport_name), 
    FOREIGN KEY (airline_name) REFERENCES Airline(airline_name), 
    FOREIGN KEY (airline_name, plane_ID) REFERENCES Airplane(airline_name, plane_ID)
);

CREATE TABLE Customer(
    email VARCHAR(320),
    name VARCHAR(30),
    password CHAR(60) NOT NULL,
    salt CHAR(32) NOT NULL,
    phone_number VARCHAR(30),
    date_of_birth DATE,
    passport_number VARCHAR(30),
    passport_expiration DATE,
    passport_country VARCHAR(30),
    building_number INT,
    street VARCHAR(30),
    city VARCHAR(30),
    state CHAR(2),
    PRIMARY KEY(email)
);

CREATE TABLE BookingAgent(
    email VARCHAR(320),
    password CHAR(60) NOT NULL,
    salt CHAR(32) NOT NULL,
    booking_agent_ID VARCHAR(20) UNIQUE NOT NULL,
    PRIMARY KEY(email)
);

CREATE TABLE Ticket(
    ticket_ID INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(320),
    sold_price DECIMAL (15,2),
    card_type ENUM('credit','debt'),
    card_number VARCHAR(30),
    name_on_card VARCHAR(30),
    exp_date DATE,
    purchase_date DATE,
    purchase_time TIME,
    airline_name VARCHAR(20) NOT NULL,
    flight_number INT(5) NOT NULL,
    dep_date DATE NOT NULL,
    dep_time TIME NOT NULL,
    booking_agent_ID VARCHAR(20),
    PRIMARY KEY(ticket_ID),
    FOREIGN KEY (email) REFERENCES Customer(email),
    FOREIGN KEY (airline_name) REFERENCES Airline(airline_name),
    FOREIGN KEY (flight_number, dep_date, dep_time) REFERENCES Flight(flight_number, dep_date, dep_time),
    FOREIGN KEY (booking_agent_ID) REFERENCES BookingAgent(booking_agent_ID)
); 

CREATE TABLE Book(
    ticket_ID INT NOT NULL,
    email VARCHAR(320) NOT NULL,
    commission DECIMAL(15,2),
    PRIMARY KEY(ticket_ID, email),
    FOREIGN KEY (ticket_ID) REFERENCES Ticket(ticket_ID),
    FOREIGN KEY (email) REFERENCES BookingAgent(email)
);

CREATE TABLE Feedback(
    flight_number INT(5) NOT NULL,
    dep_date DATE NOT NULL,
    dep_time TIME NOT NULL,
    email VARCHAR(320),
    rate INT,
    comment TEXT,
    PRIMARY KEY(flight_number, dep_date, dep_time, email),
    FOREIGN KEY (flight_number, dep_date, dep_time) REFERENCES Flight(flight_number, dep_date, dep_time),
    FOREIGN KEY (email) REFERENCES Customer(email)
);

CREATE TABLE AirlineStaff(
    username VARCHAR(30),
    password CHAR(60) NOT NULL,
    salt CHAR(32) NOT NULL,
    first_name VARCHAR(20),
    last_name VARCHAR(20),
    date_of_birth DATE,
    airline_name VARCHAR(20),
    PRIMARY KEY(username),
    FOREIGN KEY (airline_name) REFERENCES Airline(airline_name)
);


CREATE TABLE PhoneNumber(
    username VARCHAR(30),
    phone_number VARCHAR(30),
    PRIMARY KEY(username, phone_number),
    FOREIGN KEY (username) REFERENCES AirlineStaff(username)
);