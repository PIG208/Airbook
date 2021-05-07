import { useEffect, useState } from "react";
import { Button, Card, ListGroup, ListGroupItem, Modal } from "react-bootstrap";
import { FeedbackProp, FlightPrimaryProp, FlightProp } from "../../api/data";
import { searchFlights } from "../../api/flight";
import { getFeedbacksByFlight } from "../../api/feedback";
import {
  handleError,
  handleThen,
  parseISODate,
  parseISOTime,
} from "../../api/utils";
import AlertMessage from "../AlertMessage";
import { HandThumbsDownFill, HandThumbsUpFill } from "react-bootstrap-icons";

export default function FeedbackDisplay() {
  const [show, setShow] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [flights, setFlights] = useState<FlightProp[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackProp[]>([]);
  const [totalRating, setTotalRating] = useState(0);

  const fetchFeedback = (props: FlightPrimaryProp) => {
    getFeedbacksByFlight({ ...props }).then((res) => {
      if (res.data !== undefined && res.data.length > 0) {
        setTotalRating(
          res.data.reduce((accumulator: number, current: FeedbackProp) => {
            accumulator += current.rate;
            return accumulator;
          }, 0)
        );
        setFeedbacks(res.data);
      } else {
        setShow(false);
        setErrorMessage("No feedback data for this flight!");
      }
    }, handleError);
  };

  useEffect(() => {
    searchFlights({ depTimeUpper: new Date() }).then((res) => {
      if (res.result === "error") {
        setErrorMessage(res.message ?? "Some unknown errors occurred");
        return;
      }
      if (res.data?.length === 0 || res.data === undefined) {
        setFlights([]);
        setErrorMessage("No ratings to show here.");
      } else {
        setFlights(res.data);
      }
    });
  }, []);

  return (
    <div>
      <AlertMessage message={errorMessage} />
      <div className="card-flex-container">
        {flights.map((value, index) => {
          return (
            <Card key={index}>
              <Card.Header>{value.flightNumber}</Card.Header>
              <ListGroup>
                <ListGroup.Item>
                  Flight Number: {value.flightNumber}
                </ListGroup.Item>
                <ListGroup.Item>
                  Departure Date: {parseISODate(value.depDate)}
                </ListGroup.Item>
                <ListGroup.Item>
                  Departure Time: {parseISOTime(value.depTime)}
                </ListGroup.Item>
                <ListGroup.Item>
                  <Button
                    onClick={() => {
                      setFeedbacks([]);
                      setShow(true);
                      fetchFeedback({ ...value });
                    }}
                  >
                    View Ratings & Comments
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          );
        })}
      </div>
      <Modal
        show={show}
        size="lg"
        onHide={() => {
          setShow(false);
        }}
      >
        <Modal.Header>
          Feedbacks for #
          {feedbacks.length > 0 ? feedbacks[0].flightNumber : "Loading"}
        </Modal.Header>
        <Modal.Body>
          {feedbacks.length > 0 && (
            <span>
              Average Rating:{" "}
              <strong style={{ color: "green" }}>
                {totalRating / feedbacks.length}
              </strong>
            </span>
          )}

          {feedbacks.map((value, index) => {
            return (
              <ListGroup key={index}>
                <ListGroupItem>
                  <p style={{ color: "grey" }}>
                    {value.email} created at {value.createdAt}
                  </p>
                  <p>
                    Rating:{" "}
                    <strong style={{ color: "green" }}>
                      {value.rate}{" "}
                      {value.rate >= 3 ? (
                        <HandThumbsUpFill />
                      ) : (
                        <HandThumbsDownFill />
                      )}
                    </strong>
                  </p>
                  {value.comment && (
                    <div>
                      <hr />
                      <strong style={{ color: "green" }}>Comment:</strong>
                      <p>{value.comment}</p>
                    </div>
                  )}
                </ListGroupItem>
              </ListGroup>
            );
          })}
        </Modal.Body>
      </Modal>
    </div>
  );
}
