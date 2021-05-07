import { useEffect, useState } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import { FlightProp } from "../../api/data";
import {
  FrequentCustomerProp,
  getCustomerFlights,
  getFrequentCustomers,
} from "../../api/staff";
import { useAuth } from "../../api/use-auth";
import useIncrement from "../../api/use-increment";
import { handleError } from "../../api/utils";
import AlertMessage from "../AlertMessage";
import FlightTable from "./FlightTable";

const keys = ["Email", "Name", "Total Visits", "Previous Flights"];

export default function FrequentCustomers() {
  const auth = useAuth();
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const { count, increment } = useIncrement();
  const [pending, setPending] = useState(false);
  const [flights, setFlights] = useState<FlightProp[]>([]);
  const [customersData, setCustomersData] = useState<FrequentCustomerProp[]>(
    []
  );

  useEffect(() => {
    getFrequentCustomers().then((res) => {
      if (res.result === "error") {
        setError(res.message ?? "Some unknown errors occurred!");
      } else {
        setCustomersData(res.data ?? []);
      }
    }, handleError);
  }, []);

  const fetchCustomerFlights = (email: string) => {
    increment();
    setShow(true);
    setPending(true);
    setFlights([]);
    const current = count;
    getCustomerFlights(email)
      .then((res) => {
        if (count !== current) {
          return;
        }
        if (res.result === "error") {
          setError(res.message ?? "Some unknown errors occurred!");
        } else {
          setFlights(res.data ?? []);
        }
      }, handleError)
      .finally(() => {
        if (count !== current) {
          return;
        }
        setPending(false);
      });
  };

  return (
    <div>
      <AlertMessage message={error} />
      <Table>
        <thead>
          <tr>
            {keys.map((value, index) => {
              return <th key={index}>{value}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {customersData.map((value, index) => {
            return (
              <tr key={index}>
                <td>{value.email}</td>
                <td>{value.name}</td>
                <td>{value.totalVisits}</td>
                <td>
                  <Button
                    onClick={() => {
                      setShow(true);
                      fetchCustomerFlights(value.email);
                    }}
                  >
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Modal size="xl" show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Previous Flights With {auth.userProp.airlineName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FlightTable pending={pending} flights={flights} />
        </Modal.Body>
      </Modal>
    </div>
  );
}
