import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { ExclamationCircle } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { UserType } from "../../api/authentication";
import { useAuth } from "../../api/use-auth";
import HintMessage from "../HintMessage";

export default function AccessDenied() {
  const auth = useAuth();
  // Because auth.fetchSession will not be dispatched until a little
  // while after the dashboard is loaded, authPending will be false initially.
  // We don't want to render access denied page until then.
  const [firstLoaded, setFirstLoaded] = useState(true);
  useEffect(() => {
    setFirstLoaded(false);
  }, [auth]);
  return (
    <div>
      {!firstLoaded && !auth.authPending ? (
        <Card>
          <Card.Body>
            <ExclamationCircle color="red" size="4rem" />
            <h1>Access Denied</h1>
            <p>Sorry, but you don't have access to this page.</p>
            {auth.userProp.userType === UserType.PUBLIC && (
              <p>
                Please <Link to="/visitor">login</Link>.
              </p>
            )}
          </Card.Body>
        </Card>
      ) : (
        <HintMessage message="Validating..." control={true} />
      )}
    </div>
  );
}
