import { useEffect, useState } from "react";
import { Button, Form, ListGroup } from "react-bootstrap";
import Switch from "react-bootstrap/esm/Switch";
import { Route, useHistory, useParams, useRouteMatch } from "react-router";
import { Item } from "./Home";
import { FlightProp } from "../../api/data";
import { getFlightByNumber } from "../../api/flight";
import { Link } from "react-router-dom";
import AlertMessage from "../AlertMessage";
import "../../assets/PurchaseTickets.css";

export function FlightInfo() {
  const { flightNumber } = useParams<{ flightNumber?: string }>();
  const [number, setNumber] = useState(
    isNaN(Number(flightNumber)) ? "" : flightNumber
  );
  const [flights, setFlights] = useState<FlightProp[] | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState("");
  let history = useHistory();

  useEffect(() => {
    async function fetchFlights() {
      const res = await getFlightByNumber(Number(flightNumber));
      if (res.result !== "error") {
        if (res.data.length > 0) {
          setFlights(res.data);
        } else {
          setFlights(undefined);
          setErrorMessage("There is no flight with this flight number");
        }
      } else {
        setErrorMessage(res.message ?? "Some unknown errors occurred!");
      }
    }

    if (flightNumber !== undefined) {
      setErrorMessage("");
      fetchFlights();
    } else {
      setFlights(undefined);
      setErrorMessage("Please specify a flight number");
    }
  }, [flightNumber, setErrorMessage]);

  return (
    <div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Form.Group>
          <Form.Label>
            Find a flight with the flight number or{" "}
            <Link to="/dashboard/search-flights">Search</Link>
          </Form.Label>
          <Form.Control
            value={number}
            placeholder="Flight number here"
            onChange={(e) => {
              setNumber(e.target.value);
            }}
          ></Form.Control>
        </Form.Group>
        <Form.Group>
          <Button
            onClick={() => {
              if (!isNaN(Number(number))) {
                history.push(`/dashboard/purchase/${number}`);
              } else {
                setErrorMessage("The number is invalid");
              }
            }}
          >
            Search
          </Button>
        </Form.Group>
      </Form>
      <div className="ticketContainer">
        {flights !== undefined &&
          flights.map((value, index) => {
            return (
              <ListGroup key={index}>
                <Item tag="Flight Number" value={value.flightNumber} />
                <Item tag="Departure Date" value={value.depDate} />
                <Item tag="Departure Time" value={value.depTime} />
                <Item tag="Departure Airport" value={value.depAirport} />
                <Item tag="Arrival Date" value={value.arrDate} />
                <Item tag="Arrival Time" value={value.arrTime} />
                <Item tag="Arrival Airport" value={value.arrAirport} />
                <Item tag="Airline Name" value={value.airlineName} />
                <Button variant="success">Purchase</Button>
              </ListGroup>
            );
          })}
      </div>
      <AlertMessage message={errorMessage} />
    </div>
  );
}

export default function PurchaseTickets() {
  const { path, url } = useRouteMatch();
  return (
    <div>
      <Switch>
        <Route path={`${path}/:flightNumber(\\d+)/`}>
          <FlightInfo />
        </Route>
        <Route exact path={`${path}/`}>
          <FlightInfo />
        </Route>
      </Switch>
    </div>
  );
}
