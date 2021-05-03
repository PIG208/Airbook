import FlightTable from "./FlightTable";
//import { useAuth } from "../../api/use-auth";
import { FlightProp } from "../../api/data";
import { futureFlights } from "../../api/flight";
import useIncrement from "../../api/use-increment";
import { useEffect, useState } from "react";
import AlertMessage from "../AlertMessage";
import HintMessage from "../HintMessage";
import SearchFlights from "./SearchFlights";

export default function ViewFlights() {
  const [flights, setFlights] = useState<FlightProp[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);
  const { count, increment } = useIncrement();

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = () => {
    const currentCount = count;
    setPending(true);
    increment();
    setFlights([]);
    futureFlights()
      .then((res) => {
        if (currentCount !== count) {
          console.log("Aborted stale request");
          return;
        }
        if (res.result === "error") {
          setErrorMessage(res.message ?? "Unknown errors occurred!");
        } else {
          setErrorMessage("");
          setFlights(res.data);
        }
        //const auth = useAuth();
      })
      .finally(() => {
        if (currentCount !== count) {
          console.log("Aborted stale finally.");
          return;
        }
        setPending(false);
      });
  };

  return (
    <div>
      <AlertMessage message={errorMessage} />
      <SearchFlights
        onClick={(e) => {
          loadFlights();
        }}
      />
      <FlightTable flights={flights} />
      <HintMessage control={pending} message="Loading..." />
    </div>
  );
}
