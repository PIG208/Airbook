import { useState } from "react";
import { Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { AirportProp } from "../../api/data";
import { addAirport } from "../../api/flight";
import { handleError } from "../../api/utils";
import FormSubmit from "../FormSubmit";
import MyFormInput from "../MyFormInput";
import { useMessage } from "../SuccessMessage";

export default function AddAirport() {
  const {
    handleSubmit,
    control,
    formState: { errors, submitCount },
  } = useForm<AirportProp>();
  const [pending, setPending] = useState(false);
  const { message, showTimeout } = useMessage("Success");
  const [error, setError] = useState("");

  const handleAddAirport = (data: AirportProp) => {
    setPending(true);
    setError("");
    const count = submitCount;
    addAirport(data)
      .then((res) => {
        if (count !== submitCount) {
          return;
        }
        if (res.result === "error") {
          setError(res.message ?? "Some unknown errors occurred!");
        } else {
          setError("");
          showTimeout();
        }
      }, handleError)
      .finally(() => {
        if (count !== submitCount) {
          return;
        }
        setPending(false);
      });
    return data;
  };

  return (
    <div className="form-container">
      <Form onSubmit={handleSubmit(handleAddAirport)}>
        <MyFormInput
          name="airportName"
          displayName="Airport Name"
          placeholder="The airport name here"
          control={control as any}
          error={errors.airportName}
          errorMessage="The airport name is required!"
          validate={{
            maxLength: (v) => {
              return (
                v.length <= 20 ||
                "The airport name is too long (>20 characters)"
              );
            },
          }}
          required
        />
        <MyFormInput
          name="city"
          displayName="City"
          placeholder="The city of the airport"
          control={control as any}
          error={errors.city}
          errorMessage="The city is required!"
          validate={{
            maxLength: (v) => {
              return (
                v.length <= 30 || "The city name is too long (>30 characters)"
              );
            },
          }}
          required
        />
        <FormSubmit
          buttonMessage="Add Airport"
          pending={pending}
          pendingMessage="Adding airport..."
          successMessage={message}
          errorMessage={error}
        />
      </Form>
    </div>
  );
}
