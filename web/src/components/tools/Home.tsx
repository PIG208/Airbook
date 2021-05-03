import {
  Card,
  Jumbotron,
  Accordion,
  Button,
  ListGroup,
  Badge,
  Alert,
} from "react-bootstrap";
import { ExclamationTriangleFill } from "react-bootstrap-icons";
import {
  UserProp,
  UserType,
  userTypeToDisplayName,
} from "../../api/authentication";
import { useAuth } from "../../api/use-auth";

const getUserName = (props: UserProp) => {
  switch (props.userType) {
    case UserType.CUST:
      return props.name ?? props.email;
    case UserType.AGENT:
      return props.email;
    case UserType.STAFF:
      return props.userName;
    case UserType.PUBLIC:
      return "our random guest";
  }
};

export const Item = ({
  tag,
  value,
}: {
  tag: string;
  value: string | number | undefined;
}) => {
  if (value !== 0 && !value) {
    return <div></div>;
  }
  return (
    <ListGroup.Item>
      <Badge variant="primary">{tag}</Badge> {value}
    </ListGroup.Item>
  );
};

const InfoDisplay = (props: UserProp) => {
  if (props.userType === UserType.CUST) {
    return (
      <ListGroup>
        <Item tag="Name" value={props.name} />
        <Item tag="Email" value={props.email} />
        <Item tag="Phone Number" value={props.phoneNumber} />
        <Item
          tag="Date of Birth"
          value={props.dateOfBirth?.toLocaleDateString() ?? ""}
        />
        <Item tag="Passport Number" value={props.passportNumber} />
        <Item tag="Passport Country" value={props.passportCountry} />
        <Item
          tag="Passport exp."
          value={props.passportExpiration?.toLocaleDateString() ?? ""}
        />
        <Item tag="Building NO." value={props.buildingNumber} />
        <Item tag="Street" value={props.street} />
        <Item tag="City" value={props.city} />
        <Item tag="State" value={props.state} />
      </ListGroup>
    );
  } else if (props.userType === UserType.AGENT) {
    return (
      <ListGroup>
        <Item tag="Booking Agent ID" value={props.agentId} />
        <Item tag="Email" value={props.email} />
        <Alert variant="warning">
          <ExclamationTriangleFill /> Important! Please record the Booking Agent
          ID, as it's required for login!
        </Alert>
      </ListGroup>
    );
  } else if (props.userType === UserType.STAFF) {
    return (
      <ListGroup>
        <Item tag="Username" value={props.userName} />
        <Item tag="First Name" value={props.firstName} />
        <Item tag="Last Name" value={props.lastName} />
        <Item
          tag="Date of Birth"
          value={props.dateOfBirth?.toLocaleDateString() ?? ""}
        />
        <Item tag="Airline Name" value={props.airlineName} />
      </ListGroup>
    );
  } else {
    return <div></div>;
  }
};

export default function Home() {
  const auth = useAuth();
  return (
    <Jumbotron>
      <h2>{userTypeToDisplayName(auth.userProp.userType)} Home</h2>
      <p>Welcome, {getUserName(auth.userProp)}!</p>
      {auth.userProp.userType !== UserType.PUBLIC && (
        <Accordion>
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant="secondary" eventKey="0">
                Click here to view your personal data.
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="0">
              <Card.Body>
                <InfoDisplay {...auth.userProp} />
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      )}
    </Jumbotron>
  );
}
