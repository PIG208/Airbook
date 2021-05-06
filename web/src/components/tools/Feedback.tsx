import { useEffect, useState } from "react";
import { Button, Card, ListGroup, Modal } from "react-bootstrap";
import { FlightProp } from "../../api/data";
import { previousFlights } from "../../api/flight";
import { parseISODate, parseISOTime } from "../../api/utils";
import AlertMessage from "../AlertMessage";
import FeedbackForm, { FeedbackFormProp } from "../FeedbackForm";

export default function Feekback() {
  const [flights, setFlights] = useState<FlightProp[]>([]);
  const [currentFlight, setCurrentFlight] = useState<FlightProp>();
  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    previousFlights().then((res) => {
      if (res.result === "error") {
        setErrorMessage(res.message ?? "A network error occurred");
        return;
      }
      setFlights(res.data ?? []);
    });
  }, []);

  const handleCommentSubmit = (data: FeedbackFormProp) => {
    setShow(false);
  };
  return (
    <div className="card-flex-container">
      {flights.map((value, index) => {
        return (
          <Card key={index}>
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
              <Button
                variant="success"
                onClick={() => {
                  setCurrentFlight(value);
                  setShow(true);
                }}
              >
                Rate & Comment
              </Button>
            </Card.Footer>
          </Card>
        );
      })}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Feedback{" "}
            {currentFlight && (
              <span>
                For <strong>#{currentFlight.flightNumber}</strong>
              </span>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentFlight && (
            <FeedbackForm {...currentFlight} onSubmit={handleCommentSubmit} />
          )}
        </Modal.Body>
      </Modal>
      <AlertMessage message={errorMessage} />
    </div>
  );
}
