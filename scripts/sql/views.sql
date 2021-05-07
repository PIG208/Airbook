SELECT 'Setting up the views.' AS '';
USE airbook;

DROP VIEW IF EXISTS spendings;
CREATE VIEW spendings AS
    SELECT email, Book.booking_agent_id, Ticket.ticket_id, sold_price, sold_price + IFNULL(commission, 0) as actual_price, IFNULL(commission,0) as commission, purchase_date, purchase_time FROM Customer 
    NATURAL JOIN Ticket NATURAL LEFT OUTER JOIN Book
    ;

DROP VIEW IF EXISTS verbose_flights;
CREATE VIEW verbose_flights AS
    SELECT * FROM Flight NATURAL JOIN Airplane 
    NATURAL JOIN (SELECT airport_name AS dep_airport,city as dep_city FROM Airport) AS A1 
    NATURAL JOIN (SELECT airport_name AS arr_airport,city as arr_city FROM Airport) AS A2
    ;

DROP VIEW IF EXISTS future_flights;
CREATE VIEW future_flights AS 
    SELECT * FROM verbose_flights
    WHERE dep_date > CURDATE()
    OR (dep_date = CURDATE() AND dep_time > CURTIME())
    ;

DROP VIEW IF EXISTS agent_stats_last_month;
CREATE VIEW agent_stats_last_month AS
    SELECT temp.booking_agent_ID, total_commission, total_tickets, email
    FROM (SELECT booking_agent_ID, SUM(commission) as total_commission, COUNT(*) as total_tickets 
    FROM spendings WHERE purchase_date > UTC_TIMESTAMP() - INTERVAL 1 MONTH 
    AND booking_agent_id IS NOT NULL GROUP BY booking_agent_ID) as temp NATURAL JOIN BookingAgent
    ;

DROP VIEW IF EXISTS agent_stats_last_year;
CREATE VIEW agent_stats_last_year AS
    SELECT temp.booking_agent_ID, total_commission, total_tickets, email
    FROM (SELECT booking_agent_ID, SUM(commission) as total_commission, COUNT(*) as total_tickets 
    FROM spendings WHERE purchase_date > UTC_TIMESTAMP() - INTERVAL 1 MONTH 
    AND booking_agent_id IS NOT NULL GROUP BY booking_agent_ID) as temp NATURAL JOIN BookingAgent
    ;

DELIMITER [[
DROP PROCEDURE IF EXISTS customer_tickets [[
CREATE PROCEDURE 
customer_tickets (email VARCHAR(320))
BEGIN
    SELECT * FROM Ticket
    WHERE Ticket.email = email
    ;
END [[
DELIMITER ;

DELIMITER [[
DROP PROCEDURE IF EXISTS customer_flights [[
CREATE PROCEDURE 
customer_flights (email VARCHAR(320))
BEGIN
    SELECT * FROM verbose_flights
    WHERE EXISTS
        (SELECT flight_number, dep_date, dep_time
         FROM Ticket
         WHERE Ticket.email = email 
         AND (verbose_flights.flight_number, verbose_flights.dep_date, verbose_flights.dep_time) 
         = (Ticket.flight_number, Ticket.dep_date, Ticket.dep_time))
    ;
END [[
DELIMITER ;

DELIMITER [[
DROP PROCEDURE IF EXISTS city_airport [[
CREATE PROCEDURE 
city_airport (city VARCHAR(30))
BEGIN
    SELECT airport_name FROM Airport
    WHERE Airport.city = city
    ;
END [[
DELIMITER ;