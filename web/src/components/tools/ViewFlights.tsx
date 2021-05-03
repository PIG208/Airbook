import FlightTable from "./FlightTable";
//import { useAuth } from "../../api/use-auth";
import { FlightProp } from "../../api/data";
import { custFutureFlights, futureFlights } from "../../api/flight";
import useIncrement from "../../api/use-increment";
import { useEffect, useState } from "react";
import AlertMessage from "../AlertMessage";
import HintMessage from "../HintMessage";
import SearchFlights from "./SearchFlights";
import { useAuth } from "../../api/use-auth";
import { ResponseProp } from "../../api/api";
import { UserType } from "../../api/authentication";

export default function ViewFlights() {
  const [flights, setFlights] = useState<FlightProp[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);
  const { count, increment } = useIncrement();
  const auth = useAuth();

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = () => {
    const currentCount = count;
    setPending(true);
    increment();
    setFlights([]);
    const handleResponse = (res: ResponseProp) => {
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
    };

    const handleFinally = () => {
      if (currentCount !== count) {
        console.log("Aborted stale finally.");
        return;
      }
      setPending(false);
    };
    if (auth.userProp.userType == UserType.CUST) {
      custFutureFlights().then(handleResponse).finally(handleFinally);
    } else {
      futureFlights().then(handleResponse).finally(handleFinally);
    }
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
