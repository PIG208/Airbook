import { useEffect, useState } from "react";
import { Card, ListGroup } from "react-bootstrap";
import { FeedbackProp } from "../../api/data";
import { getFeedbacksForStaff } from "../../api/feedback";
import { parseISODate, parseISOTime } from "../../api/utils";
import AlertMessage from "../AlertMessage";

export default function FeedbackDisplay() {
  const [feedbacks, setFeedbacks] = useState<FeedbackProp[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  useEffect(() => {
    getFeedbacksForStaff().then((res) => {
      if (res.result === "error") {
        setErrorMessage(res.message ?? "Some unknown errors occurred");
        return;
      }
      if (res.data?.length === 0) {
        setErrorMessage("No ratings to show here.");
      }
      setFeedbacks(res.data ?? []);
    });
  }, []);
  return (
    <div className="card-flex-container">
      <AlertMessage message={errorMessage} />
      {feedbacks.map((value, index) => {
        return (
          <Card key={index}>
            <Card.Header>{value.email}</Card.Header>
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
              <ListGroup.Item>Rate: {value.rate}</ListGroup.Item>
              <ListGroup.Item>Comment: {value.comment}</ListGroup.Item>
            </ListGroup>
          </Card>
        );
      })}
    </div>
  );
}
