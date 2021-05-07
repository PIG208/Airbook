import { useEffect, useState } from "react";
import { Button, Form, ListGroup, Modal } from "react-bootstrap";
import Switch from "react-bootstrap/esm/Switch";
import { Route, useHistory, useParams, useRouteMatch } from "react-router";
import { Item } from "./Home";
import { FlightProp } from "../../api/data";
import { getFlightByNumber } from "../../api/flight";
import { Link } from "react-router-dom";
import AlertMessage from "../AlertMessage";
import "../../assets/PurchaseTickets.css";
import PurchaseForm from "../PurchaseForm";

export function FlightInfo() {
  const { flightNumber } = useParams<{ flightNumber?: string }>();
  const [number, setNumber] = useState(
    isNaN(Number(flightNumber)) ? "" : flightNumber
  );
  const [flights, setFlights] = useState<FlightProp[] | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState("");
  const [show, setShow] = useState(false);
  const [currentFlight, setCurrentFlight] = useState<FlightProp | undefined>(
    undefined
  );
  let history = useHistory();

  const handlePurchaseSubmit = () => {
    console.log("submitted");
  };

  useEffect(() => {
    async function fetchFlights() {
      const res = await getFlightByNumber(Number(flightNumber));
      if (res.result !== "error") {
        if (res.data !== undefined && res.data.length > 0) {
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
      <div className="card-flex-container">
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
                <Button
                  variant="success"
                  onClick={(e) => {
                    setCurrentFlight(value);
                    setShow(true);
                  }}
                >
                  Purchase
                </Button>
              </ListGroup>
            );
          })}
      </div>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Purchase Ticket</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PurchaseForm {...currentFlight} onSubmit={handlePurchaseSubmit} />
        </Modal.Body>
      </Modal>
      <AlertMessage message={errorMessage} />
    </div>
  );
}

export default function PurchaseTickets() {
  const { path } = useRouteMatch();
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
