# All future flights:

SELECT * FROM Flight
WHERE dep_date > CURDATE()
OR (dep_date = CURDATE() AND dep_time > CURTIME());

# All delayed flights:

SELECT * FROM Flight
WHERE status='delayed';

# Customers who bought the tickets:

SELECT * FROM Customer
WHERE EXISTS(
    SELECT * FROM Ticket
    WHERE Customer.email=Ticket.email
);

# Customer who uses booking agents to buy the tickets:

SELECT * FROM Customer
WHERE EXISTS(
    SELECT * FROM Ticket
    WHERE Customer.email=Ticket.email AND booking_agent_ID IS NOT NULL
);

# Show all of the airplanes owned by the airline:

SELECT * FROM Airplane
WHERE airline_name='China Eastern';