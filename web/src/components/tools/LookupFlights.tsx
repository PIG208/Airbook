import { Card, Form, Col, Button } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import { forwardRef, useState } from "react";
import {
  FlightFilterProp,
  searchFlights,
  searchFlightsPublic,
} from "../../api/flight";
import { FlightProp } from "../../api/data";
import FlightTable from "./FlightTable";
import useIncrement from "../../api/use-increment";
import HintMessage from "../HintMessage";
import { useAuth } from "../../api/use-auth";
import { UserType } from "../../api/authentication";

export default function LookupFlights() {
  const {
    handleSubmit,
    control,
    formState: { errors, submitCount },
    clearErrors,
    getValues,
    watch,
  } = useForm<FlightFilterProp>();
  const [flights, setFlights] = useState<FlightProp[]>([]);
  const [pending, setPending] = useState(false);
  const { count, increment } = useIncrement();
  const auth = useAuth();

  const handleSearch = (props: FlightFilterProp) => {
    setPending(true);
    setFlights([]);
    increment();
    const currentCount = count;
    if (auth.userProp.userType === UserType.PUBLIC) {
      setTimeout(() => {
        searchFlightsPublic(props)
          .then((res) => {
            if (currentCount === count) {
              console.log("Aborted on stale search.");
            }
            if (res.result !== "error") {
              setFlights(res.data);
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
        searchFlights(props)
          .then((res) => {
            if (currentCount === count) {
              console.log("Aborted on stale search.");
            }
            if (res.result !== "error") {
              setFlights(res.data);
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

  const DateCustomInput = forwardRef((props: any, ref) => {
    return <Form.Control {...props} ref={ref} />;
  });

  return (
    <Card>
      <Card.Body>
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
          <Form.Row>
            <Form.Group as={Col} controlId="formDepTimeLower">
              <Form.Label>Departure Date Lower Bound</Form.Label>
              <Controller
                name="depTimeLower"
                control={control}
                defaultValue={""}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    selected={value}
                    onChange={onChange}
                    placeholderText="(Optional)"
                    wrapperClassName={"form-control"}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    customInput={
                      <DateCustomInput
                        isInvalid={errors.depTimeLower !== undefined}
                      />
                    }
                  />
                )}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="formDepTimeUpper">
              <Form.Label>Departure Date Upper Bound</Form.Label>
              <Controller
                name="depTimeUpper"
                control={control}
                defaultValue={""}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    selected={value}
                    onChange={onChange}
                    placeholderText="(Optional)"
                    wrapperClassName={"form-control"}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    customInput={
                      <DateCustomInput
                        isInvalid={errors.depTimeUpper !== undefined}
                      />
                    }
                  />
                )}
              />
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Form.Group as={Col} controlId="formArrDateLower">
              <Form.Label>Arrival Date Lower Bound</Form.Label>
              <Controller
                name="arrTimeLower"
                control={control}
                defaultValue={""}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    selected={value}
                    onChange={onChange}
                    placeholderText="(Optional)"
                    wrapperClassName={"form-control"}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    customInput={
                      <DateCustomInput
                        value={value}
                        isInvalid={errors.arrTimeLower !== undefined}
                      />
                    }
                  />
                )}
              />
            </Form.Group>
            <Form.Group as={Col} controlId="formArrDateUpper">
              <Form.Label>Arrival Date Upper Bound</Form.Label>
              <Controller
                name="arrTimeUpper"
                control={control}
                defaultValue={""}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    selected={value}
                    onChange={onChange}
                    placeholderText="(Optional)"
                    wrapperClassName={"form-control"}
                    showTimeSelect
                    dateFormat="MMMM d, yyyy h:mm aa"
                    customInput={
                      <DateCustomInput
                        isInvalid={errors.arrTimeUpper !== undefined}
                      />
                    }
                  />
                )}
              />
            </Form.Group>
          </Form.Row>
          <Form.Row>
            <Button type="submit">Search</Button>
          </Form.Row>
        </Form>
      </Card.Body>
      <FlightTable flights={flights} />
      <HintMessage control={pending} message="Loading..." />
    </Card>
  );
}
