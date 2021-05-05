import { useEffect, useState } from "react";
import { Button, Card, ListGroup } from "react-bootstrap";
import { FlightProp } from "../../api/data";
import { previousFlights } from "../../api/flight";
import { parseISODate, parseISOTime } from "../../api/utils";
import AlertMessage from "../AlertMessage";
import "../../assets/Feedback.css";

export default function Feekback() {
  const [flights, setFlights] = useState<FlightProp[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    console.log("asd");
    previousFlights().then((res) => {
      console.log(res);
      if (res.result === "error") {
        setErrorMessage(res.message ?? "A network error occurred");
        return;
      }
      setFlights(res.data ?? []);
    });
  }, []);
  return (
    <div className="feedback-container">
      {flights.map((value, index) => {
        return (
          <Card>
            <Card.Header>Flight #{value.flightNumber}</Card.Header>
            <ListGroup>
              <ListGroup.Item>
                Departure Date: <strong>{parseISODate(value.depDate)}</strong>
              </ListGroup.Item>
              <ListGroup.Item>
                Departure Time: <strong>{parseISOTime(value.depTime)}</strong>
              </ListGroup.Item>
              <ListGroup.Item>
                Destination:{" "}
                <strong>
                  {value.arrCity} - {value.arrAirport}
                </strong>
              </ListGroup.Item>
            </ListGroup>
            <Card.Footer>
              <Button variant="success">Rate & Comment</Button>
            </Card.Footer>
          </Card>
        );
      })}
      <AlertMessage message={errorMessage} />
    </div>
  );
}
