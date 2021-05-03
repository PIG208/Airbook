import { Card } from "react-bootstrap";
import { ExclamationCircle } from "react-bootstrap-icons";

export default function ToolNotFound() {
  return (
    <div>
      <Card>
        <Card.Body>
          <ExclamationCircle color="red" size="4rem" />
          <h1>404 Not Found</h1>
          <p>Sorry, it appears that there is nothing here.</p>
          <p>Please check your URL.</p>
        </Card.Body>
      </Card>
    </div>
  );
}
