import { useEffect, useState } from "react";
import { Button, Form, ListGroup, Modal } from "react-bootstrap";
import Switch from "react-bootstrap/esm/Switch";
import { Route, useHistory, useParams, useRouteMatch } from "react-router";
import { Item } from "./Home";
import { FlightProp, FlightStatus } from "../../api/data";
import { changeFlightStatus, getFlightByNumber } from "../../api/flight";
import { Link } from "react-router-dom";
import AlertMessage from "../AlertMessage";
import "../../assets/PurchaseTickets.css";
import FormSelect from "../FormSelect";
import { useForm } from "react-hook-form";
import FormSubmit from "../FormSubmit";
import { useMessage } from "../SuccessMessage";

function FlightInfo() {
  const { flightNumber } = useParams<{ flightNumber?: string }>();
  const [number, setNumber] = useState(
    isNaN(Number(flightNumber)) ? "" : flightNumber
  );
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formError, setFormError] = useState("");
  const { message, showTimeout } = useMessage("Success");
  const {
    handleSubmit,
    control,
    formState: { submitCount },
  } = useForm<{ status: FlightStatus }>({});
  const [flights, setFlights] = useState<FlightProp[] | undefined>(undefined);
  const [currentFlight, setCurrentFlight] = useState<FlightProp | undefined>(
    undefined
  );
  let history = useHistory();

  const handleChangeStatusSubmit = ({ status }: { status: FlightStatus }) => {
    setPending(true);
    const count = submitCount;
    if (currentFlight !== undefined) {
      changeFlightStatus({
        status: status,
        flightNumber: currentFlight.flightNumber,
        depDate: currentFlight.depDate,
        depTime: currentFlight.depTime,
      })
        .then((data) => {
          if (count !== submitCount) {
            return;
          }
          if (data.result === "error") {
            setFormError(data.message ?? "Some unknown errors occurred!");
          } else {
            showTimeout();
            setCurrentFlight(
              Object.assign({}, currentFlight, { status: status })
            );
          }
        })
        .finally(() => {
          if (count !== submitCount) {
            return;
          }
          setPending(false);
        });
    }
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
  }, [flightNumber, setErrorMessage, currentFlight]);

  return (
    <div>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <Form.Group>
          <Form.Label>
            Find a flight with the flight number or find it in{" "}
            <Link to="/dashboard/view-flights">View Flights</Link>
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
                history.push(`/dashboard/edit-flights/${number}`);
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
                <Item tag="Status" value={value.status} />
                <Item tag="Seat Capcity" value={value.seatCapacity} />
                <Button
                  variant="success"
                  onClick={(e) => {
                    setCurrentFlight(value);
                    setShow(true);
                  }}
                >
                  Change Status
                </Button>
              </ListGroup>
            );
          })}
      </div>
      <Modal
        show={show}
        onHide={() => {
          setShow(false);
          setFormError("");
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit(handleChangeStatusSubmit)}>
            The current status of the flight is:{" "}
            <strong style={{ color: "green" }}>
              {currentFlight?.status ?? "unknown"}
            </strong>
            <FormSelect
              name="status"
              displayName="Flight Status"
              control={control as any}
              required
              defaultValue={currentFlight?.status ?? FlightStatus.ONTIME}
              options={[
                { value: FlightStatus.ONTIME, display: "On-time" },
                { value: FlightStatus.DELAYED, display: "Delayed" },
              ]}
            />
            <FormSubmit
              buttonMessage="Apply"
              errorMessage={formError}
              successMessage={message}
              pending={pending}
              pendingMessage="Updating..."
            />
          </Form>
        </Modal.Body>
      </Modal>
      <AlertMessage message={errorMessage} />
    </div>
  );
}

export default function FlightChangeStatus() {
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
