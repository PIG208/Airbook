import FlightTable from "./FlightTable";
//import { useAuth } from "../../api/use-auth";
import { FlightProp } from "../../api/data";
import {
  custFutureFlights,
  FlightFilterProp,
  futureFlights,
  searchFlights,
  searchFlightsPublic,
} from "../../api/flight";
import useIncrement from "../../api/use-increment";
import { useEffect, useState } from "react";
import { useAuth } from "../../api/use-auth";
import { ResponseProp } from "../../api/api";
import { UserType } from "../../api/authentication";
import { Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import RangePicker from "../RangePicker";
import FormSubmit from "../FormSubmit";
import HintMessage from "../HintMessage";

export default function ViewFlights() {
  const [flights, setFlights] = useState<FlightProp[]>([]);
  const [pending, setPending] = useState(false);
  const [tipMessage, setTipMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { count, increment } = useIncrement();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FlightFilterProp>({});
  const auth = useAuth();
  const [firstLoaded, setFirstLoaded] = useState(true);

  useEffect(() => {
    setFirstLoaded(false);
    setTimeout(() => loadFlights({}), 200);
  }, [auth]);

  const loadFlights = (data: FlightFilterProp) => {
    const currentCount = count;
    setPending(true);
    setTipMessage("");
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

    if (currentCount > 0) {
      if (auth.userProp.userType === UserType.PUBLIC) {
        searchFlightsPublic(data).then(handleResponse).finally(handleFinally);
      } else if (auth.userProp.userType === UserType.CUST) {
        setTipMessage("Showing your flights within the specified range.");
        searchFlights({ ...data, filterByEmails: true })
          .then(handleResponse)
          .finally(handleFinally);
      } else if (auth.userProp.userType === UserType.AGENT) {
        setTipMessage("Showing your flights within the specified range.");
        searchFlights({ ...data, filterByAgentID: true })
          .then(handleResponse)
          .finally(handleFinally);
      } else {
        setTipMessage(
          `Flights operated by ${auth.userProp.airlineName} within the specified range.`
        );
        searchFlights(data).then(handleResponse).finally(handleFinally);
      }
      return;
    }

    if (auth.userProp.userType === UserType.CUST) {
      setTipMessage(`All your future flights.`);
      custFutureFlights().then(handleResponse).finally(handleFinally);
    } else if (auth.userProp.userType === UserType.STAFF) {
      setTipMessage(
        `Flights operated by ${auth.userProp.airlineName} in the next 30 days.`
      );
      // By default, we filter only the flights in the next 30 days
      let next = new Date();
      next.setUTCDate(next.getUTCDate() + 30);
      searchFlights({ depTimeLower: new Date(), depTimeUpper: next })
        .then(handleResponse)
        .finally(handleFinally);
    } else if (auth.userProp.userType === UserType.AGENT) {
      setTipMessage(`All the future flights purchased for customers.`);
      searchFlights({ depTimeLower: new Date(), filterByAgentID: true })
        .then(handleResponse)
        .finally(handleFinally);
    } else {
      setTipMessage(`Future flights on the system.`);
      futureFlights().then(handleResponse).finally(handleFinally);
    }
  };

  return (
    <div>
      <Form onSubmit={handleSubmit(loadFlights)}>
        <RangePicker
          control={control}
          lowerDisplay="Departure Date Lower Bound"
          lowerName="depTimeLower"
          upperDisplay="Departure Date Upper Bound"
          upperName="depTimeUpper"
          lowerError={errors.depTimeLower}
          upperError={errors.depTimeUpper}
        />
        <RangePicker
          control={control}
          lowerDisplay="Arrival Date Lower Bound"
          lowerName="arrTimeLower"
          upperDisplay="Arrival Date Upper Bound"
          upperName="arrTimeUpper"
          lowerError={errors.arrTimeLower}
          upperError={errors.arrTimeUpper}
        />
        <FormSubmit buttonMessage="Filter" errorMessage={errorMessage} />
      </Form>
      <h5>{tipMessage}</h5>
      {!firstLoaded && !auth.authPending ? (
        <FlightTable flights={flights} pending={pending} />
      ) : (
        <HintMessage message="Validating..." control={true} />
      )}
    </div>
  );
}
