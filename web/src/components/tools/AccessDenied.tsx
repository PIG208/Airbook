import { Card } from "react-bootstrap";
import { ExclamationCircle } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { useAuth } from "../../api/use-auth";

export default function AccessDenied() {
  const auth = useAuth();
  if (auth.authPending) {
    return <div></div>;
  }
  return (
    <Card>
      <Card.Body>
        <ExclamationCircle color="red" size="4rem" />
        <h1>Access Denied</h1>
        <p>Sorry, but you don't have access to this page.</p>
        <p>
          Please <Link to="/visitor">login</Link>.
        </p>
      </Card.Body>
    </Card>
  );
}
