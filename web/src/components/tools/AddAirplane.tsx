import { useState } from "react";
import { Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { AirplaneProp } from "../../api/data";
import { addAirplane } from "../../api/flight";
import { handleError } from "../../api/utils";
import FormNumber from "../FormNumber";
import FormSubmit from "../FormSubmit";
import { useMessage } from "../SuccessMessage";

export default function AddAirplane() {
  const {
    handleSubmit,
    control,
    formState: { errors, submitCount },
  } = useForm<AirplaneProp>();
  const [pending, setPending] = useState(false);
  const { message, showTimeout } = useMessage("Success");
  const [error, setError] = useState("");

  const handleAddAirplane = (data: AirplaneProp) => {
    setPending(true);
    setError("");
    const count = submitCount;
    addAirplane(data)
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
      <Form onSubmit={handleSubmit(handleAddAirplane)}>
        <FormNumber
          name="planeID"
          displayName="Plane ID"
          placeholder="The plane ID here"
          control={control as any}
          error={errors.planeID}
          errorMessage="The plane ID is required!"
          required
        />
        <FormNumber
          name="seatCapacity"
          displayName="Seat Capacity"
          placeholder="The seat capacity of the airplane"
          control={control as any}
          error={errors.seatCapacity}
          errorMessage="The seat capacity is required!"
          validate={{
            maximum: (v) => {
              return v <= 1000 || "The airplane is impossibly large!!! (>1000)";
            },
          }}
          required
        />
        <FormSubmit
          buttonMessage="Add Airplane"
          pending={pending}
          pendingMessage="Adding airplane..."
          successMessage={message}
          errorMessage={error}
        />
      </Form>
    </div>
  );
}
