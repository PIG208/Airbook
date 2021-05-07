import { useState } from "react";
import { Button, ListGroup, Modal, Table } from "react-bootstrap";
import { InfoCircleFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { UserType } from "../../api/authentication";
import { FlightPrimaryProp, FlightProp } from "../../api/data";
import { getFlightCustomers } from "../../api/flight";
import { inUserTools, StaffTools, Tools } from "../../api/tool";
import { useAuth } from "../../api/use-auth";
import { handleError, parseISODate, parseISOTime } from "../../api/utils";

import "../../assets/FlightTable.css";
import HintMessage from "../HintMessage";
import NothingHere from "../NothingHere";

const keys = [
  "Flight Number",
  "Airline Name",
  "Dep City",
  "Dep Airport",
  "Arr City",
  "Arr Airport",
  "Dep Date",
  "Dep Time",
  "Arr Date",
  "Arr Time",
  "Base Price",
  "Status",
  "Seat Capacity",
  "Plane ID",
];

export const getFlightKeys = () => keys;

export default function FlightTable(props: {
  flights: FlightProp[];
  pending: boolean;
}) {
  const [show, setShow] = useState(false);
  const [flight, setFlight] = useState<FlightProp>();
  const [customers, setCustomers] = useState<
    { email: string; name: string; tickets: number }[]
  >([]);
  let auth = useAuth();

  const fetchCustomerFlights = (props: FlightPrimaryProp) => {
    if (auth.userProp.userType !== UserType.STAFF) {
      return;
    }
    getFlightCustomers(props).then((res) => {
      if (res.data !== undefined && res.data.length > 0) {
        setCustomers(res.data);
      } else {
        setCustomers([]);
      }
    }, handleError);
  };

  return (
    <div className="flight-table-container">
      <Table>
        <thead>
          <tr>
            {keys.map((value, index) => {
              return <th key={index}>{value}</th>;
            })}
            {auth.userProp.userType === UserType.STAFF && <th>Customers</th>}
          </tr>
        </thead>
        <tbody>
          {props.flights.map((values, index) => {
            return (
              <tr key={index}>
                {Object.entries(values).map(([key, value]) => {
                  if (key === "flightNumber") {
                    if (inUserTools(Tools.PURCHASE, auth.userProp.userType)) {
                      return (
                        <td key={key}>
                          <Link to={`/dashboard/purchase/${value}`}>
                            {value}
                          </Link>
                        </td>
                      );
                    } else if (
                      inUserTools(
                        StaffTools.EDIT_FLIGHTS,
                        auth.userProp.userType
                      )
                    ) {
                      return (
                        <td key={key}>
                          <Link to={`/dashboard/edit-flights/${value}`}>
                            {value}
                          </Link>
                        </td>
                      );
                    }
                  }
                  if (key === "depDate" || key === "arrDate") {
                    // Dates
                    return <td key={key}>{parseISODate(value)}</td>;
                  } else if (key === "depTime" || key === "arrTime") {
                    // Times
                    return <td key={key}>{parseISOTime(value)}</td>;
                  } else {
                    return <td key={key}>{value}</td>;
                  }
                })}
                {auth.userProp.userType === UserType.STAFF && (
                  <td>
                    <Button
                      onClick={() => {
                        setShow(true);
                        setCustomers([]);
                        setFlight(values);
                        fetchCustomerFlights(values);
                      }}
                    >
                      View
                    </Button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Modal
        show={show}
        onHide={() => {
          setShow(false);
        }}
      >
        <Modal.Header>
          Customers for Flight #{flight?.flightNumber ?? "Loading"}
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {customers.length > 0 &&
              customers.map((value, index) => {
                return (
                  <ListGroup.Item key={index}>
                    {value.name}({value.email}):{" "}
                    <strong style={{ color: "green" }}>
                      {value.tickets} Tickets
                    </strong>
                  </ListGroup.Item>
                );
              })}
            <NothingHere control={customers.length == 0} />
          </ListGroup>
        </Modal.Body>
      </Modal>
      <HintMessage control={props.pending} message="Loading..." />
      <NothingHere control={!props.pending && props.flights.length === 0} />
    </div>
  );
}
