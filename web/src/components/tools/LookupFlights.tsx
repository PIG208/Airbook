import { Form, Col, Button } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { forwardRef, useState } from "react";
import {
  FlightFilterProp,
  searchFlights,
  searchFlightsPublic,
  searchFlightsReturn,
  searchFlightsReturnPublic,
} from "../../api/flight";
import { FlightProp } from "../../api/data";
import FlightTable from "./FlightTable";
import useIncrement from "../../api/use-increment";
import { useAuth } from "../../api/use-auth";
import { UserType } from "../../api/authentication";
import RangePicker from "../RangePicker";
import FormSubmit from "../FormSubmit";

export default function LookupFlights() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FlightFilterProp>();
  const [flights, setFlights] = useState<FlightProp[]>([]);
  const [returns, setReturns] = useState<FlightProp[]>([]);
  const [pending, setPending] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const { count, increment } = useIncrement();
  const auth = useAuth();

  const handleSearch = (props: FlightFilterProp) => {
    setPending(true);
    setFlights([]);
    setReturns([]);
    increment();
    const currentCount = count;
    if (auth.userProp.userType === UserType.PUBLIC) {
      setTimeout(() => {
        if (!!props.returnTimeLower || !!props.returnTimeUpper) {
          searchFlightsReturnPublic(props).then((res) => {
            if (currentCount === count) {
              console.log("Aborted on stale search.");
            }
            if (res.data !== undefined && res.result !== "error") {
              setReturns(res.data);
              setLookupError("");
            } else {
              setLookupError(res.message ?? "Some errors occurred!");
            }
          });
        }
        searchFlightsPublic(props)
          .then((res) => {
            if (currentCount === count) {
              console.log("Aborted on stale search.");
            }
            if (res.data !== undefined && res.result !== "error") {
              setFlights(res.data);
              setLookupError("");
            } else {
              setLookupError(res.message ?? "Some errors occurred!");
            }
          })
          .finally(() => {
            if (currentCount !== count) {
              console.log("Aborted on stale search.");
            }
            setPending(false);
          });
      }, 200);
    } else {
      setTimeout(() => {
        if (!!props.returnTimeLower || !!props.returnTimeUpper) {
          searchFlightsReturn(props).then((res) => {
            if (currentCount === count) {
              console.log("Aborted on stale search.");
            }
            if (res.data !== undefined && res.result !== "error") {
              setReturns(res.data);
              setLookupError("");
            } else {
              setLookupError(res.message ?? "Some errors occurred!");
            }
          });
        }
        searchFlights(props)
          .then((res) => {
            if (currentCount === count) {
              console.log("Aborted on stale search.");
            }
            if (res.data !== undefined && res.result !== "error") {
              setFlights(res.data);
              setLookupError("");
            } else {
              setLookupError(res.message ?? "Some errors occurred!");
            }
          })
          .finally(() => {
            if (currentCount !== count) {
              console.log("Aborted on stale search.");
            }
            setPending(false);
          });
      }, 200);
    }
    return;
  };

  return (
    <div>
      <Form onSubmit={handleSubmit(handleSearch)}>
        <Form.Row>
          <Form.Group as={Col} controlId="formFlightNumber">
            <Form.Label>Flight Number</Form.Label>
            <Controller
              name="flightNumber"
              control={control}
              defaultValue={""}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  placeholder="Flight Number (Optional)"
                  isInvalid={errors.flightNumber !== undefined}
                />
              )}
            />
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} controlId="formDepCity">
            <Form.Label>Departure City</Form.Label>
            <Controller
              name="depCity"
              control={control}
              defaultValue={""}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  placeholder="Departure city (Optional)"
                  isInvalid={errors.depCity !== undefined}
                />
              )}
            />
          </Form.Group>
          <Form.Group as={Col} controlId="formArrCity">
            <Form.Label>Arrival City</Form.Label>
            <Controller
              name="arrCity"
              control={control}
              defaultValue={""}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  placeholder="Arrival city (Optional)"
                  isInvalid={errors.arrCity !== undefined}
                />
              )}
            />
          </Form.Group>
        </Form.Row>
        <Form.Row>
          <Form.Group as={Col} controlId="formDepAirport">
            <Form.Label>Departure Airport</Form.Label>
            <Controller
              name="depAirport"
              control={control}
              defaultValue={""}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  placeholder="Departure airport (Optional)"
                  isInvalid={errors.depAirport !== undefined}
                />
              )}
            />
          </Form.Group>
          <Form.Group as={Col} controlId="formArrAirport">
            <Form.Label>Arrival Airport</Form.Label>
            <Controller
              name="depAirport"
              control={control}
              defaultValue={""}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  placeholder="Arrival airport (Optional)"
                  isInvalid={errors.depAirport !== undefined}
                />
              )}
            />
          </Form.Group>
        </Form.Row>
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
        <RangePicker
          control={control}
          lowerDisplay="Return Date Lower Bound"
          lowerName="returnTimeLower"
          upperDisplay="Return Date Upper Bound"
          upperName="returnTimeUpper"
          lowerError={errors.returnTimeLower}
          upperError={errors.returnTimeUpper}
        />
        <FormSubmit buttonMessage="Search" errorMessage={lookupError} />
      </Form>
      <h5 style={{ color: "green" }}>One-way</h5>
      <FlightTable flights={flights} pending={pending} />
      <h5 style={{ color: "green" }}>Round Trips</h5>
      <FlightTable flights={returns} pending={pending} />
    </div>
  );
}
