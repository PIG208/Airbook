import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FlightProp } from "../../api/data";
import { inUserTools, Tools } from "../../api/tool";
import { useAuth } from "../../api/use-auth";

const keys = [
  "Flight Number",
  "Dep Date",
  "Dep Time",
  "Dep Airport",
  "Arr Date",
  "Arr Time",
  "Arr Airport",
  "Base Price",
  "Status",
  "Plane ID",
  "Airline Name",
];

export const getFlightKeys = () => keys;

export default function FlightTable(props: { flights: FlightProp[] }) {
  let auth = useAuth();
  return (
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
              {Object.values(values).map((value, index) => {
                if (
                  index === 0 &&
                  inUserTools(Tools.PURCHASE, auth.userProp.userType)
                ) {
                  return (
                    <td key={index}>
                      <Link to={`/dashboard/purchase/${value}`}>{value}</Link>
                    </td>
                  );
                }
                return <td key={index}>{value}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
}
