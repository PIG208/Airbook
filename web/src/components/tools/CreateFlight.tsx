import { useState } from "react";
import { Card, Col, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { FlightFormProp } from "../../api/data";
import { createFlight } from "../../api/flight";
import FormNumber from "../FormNumber";
import FormSelect from "../FormSelect";
import FormSubmit from "../FormSubmit";
import MyDatePicker from "../MyDatePicker";
import MyFormInput from "../MyFormInput";
import { useMessage } from "../SuccessMessage";
import ViewFlights from "./ViewFlights";

export default function CreateFlight() {
  const {
    handleSubmit,
    control,
    formState: { errors, submitCount },
    getValues,
  } = useForm<FlightFormProp>();
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);
  const { message, showTimeout } = useMessage(
    "Successfully created the flight!"
  );

  const handleCreateFlight = (props: FlightFormProp) => {
    const count = submitCount;
    setPending(true);
    createFlight(props)
      .then((data) => {
        if (count !== submitCount) {
          return;
        }
        if (data.result === "error") {
          setErrorMessage(data.message ?? "Some unknown errors have occurred");
        } else {
          setErrorMessage("");
          showTimeout();
        }
      })
      .finally(() => {
        if (count !== submitCount) {
          return;
        }
        setPending(false);
      });
  };
  return (
    <div>
      <ViewFlights />
      <Card>
        <Card.Header>Create Flight</Card.Header>
        <Form
          className="form-container"
          onSubmit={handleSubmit(handleCreateFlight)}
        >
          <FormNumber
            control={control as any}
            name="flightNumber"
            displayName="Flight Number"
            error={errors.flightNumber}
            placeholder="Flight number here"
            required
          />
          <Form.Row>
            <MyDatePicker
              control={control as any}
              name="depDatetime"
              displayName="Departure Datetime"
              placeholder="The departure datetime here"
              required={true}
              error={errors.depDatetime}
              errorMessage="The departure datetime is required"
              pickerProps={{ showTimeSelect: true }}
              as={Col}
            />
            <MyDatePicker
              control={control as any}
              name="arrDatetime"
              displayName="Arrival Datetime"
              placeholder="The arrival datetime here"
              required={true}
              error={errors.arrDatetime}
              errorMessage="The arrival datetime is required"
              pickerProps={{ showTimeSelect: true }}
              validate={{
                after: (v) => {
                  console.log(v, getValues().depDatetime);
                  return (
                    getValues().depDatetime < v ||
                    "The arrival datetime needs to be after departure datetime!"
                  );
                },
              }}
              as={Col}
            />
          </Form.Row>
          <MyFormInput
            control={control as any}
            name="arrAirport"
            displayName="Arrival Airport"
            error={errors.arrAirport}
            placeholder="Arrival airport here"
            required
          />
          <MyFormInput
            control={control as any}
            name="depAirport"
            displayName="Departure Airport"
            error={errors.depAirport}
            placeholder="Departure airport here"
            required
          />
          <FormNumber
            control={control as any}
            name="basePrice"
            displayName="Base Price"
            error={errors.basePrice}
            placeholder="Base price here (in $)"
            required
          />
          <FormSelect
            control={control as any}
            name="status"
            displayName="Flight Status"
            error={errors.status}
            defaultValue="ontime"
            placeholder=""
            options={[
              { value: "ontime", display: "On Time" },
              { value: "delayed", display: "Delayed" },
            ]}
            required
          />
          <FormNumber
            control={control as any}
            name="planeID"
            displayName="Plane ID"
            error={errors.planeID}
            placeholder="Plane ID here"
            required
          />

          <FormSubmit
            buttonMessage="Create Flight"
            pending={pending}
            pendingMessage="Creating the new flight..."
            successMessage={message}
            errorMessage={errorMessage}
          />
        </Form>
      </Card>
    </div>
  );
}
