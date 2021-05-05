import { Table } from "react-bootstrap";
import { InfoCircleFill } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { FlightProp } from "../../api/data";
import { inUserTools, Tools } from "../../api/tool";
import { useAuth } from "../../api/use-auth";

import "../../assets/FlightTable.css";
import HintMessage from "../HintMessage";

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
  let auth = useAuth();
  return (
    <div className="flight-table-container">
      <Table>
        <thead>
          <tr>
            {keys.map((value, index) => {
              return <th key={index}>{value}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {props.flights.map((values, index) => {
            return (
              <tr key={index}>
                {Object.entries(values).map(([key, value]) => {
                  if (
                    key === "flightNumber" &&
                    inUserTools(Tools.PURCHASE, auth.userProp.userType)
                  ) {
                    return (
                      <td key={key}>
                        <Link to={`/dashboard/purchase/${value}`}>{value}</Link>
                      </td>
                    );
                  }
                  if (key === "depDate" || key === "arrDate") {
                    // Dates
                    return (
                      <td key={key}>{new Date(value).toLocaleDateString()}</td>
                    );
                  } else if (key === "depTime" || key === "arrTime") {
                    // Times
                    return (
                      <td key={key}>
                        {new Date(`2020-02-02T${value}Z`).toLocaleTimeString()}
                      </td>
                    );
                  } else {
                    return <td key={key}>{value}</td>;
                  }
                })}

                <td></td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <HintMessage control={props.pending} message="Loading..." />
      {!props.pending && props.flights.length === 0 && (
        <div className="nothing-here">
          <InfoCircleFill /> Nothing to show here.
        </div>
      )}
    </div>
  );
}
