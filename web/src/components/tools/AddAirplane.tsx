import { useEffect, useState } from "react";
import { Card, Form, ListGroup } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { ResponseProp } from "../../api/api";
import { AirplaneProp } from "../../api/data";
import { addAirplane, fetchAirplanes } from "../../api/flight";
import useIncrement from "../../api/use-increment";
import { handleError } from "../../api/utils";
import FormNumber from "../FormNumber";
import FormSubmit from "../FormSubmit";
import { useMessage } from "../SuccessMessage";
import { Item } from "./Home";

export default function AddAirplane() {
  const {
    handleSubmit,
    control,
    formState: { errors, submitCount },
  } = useForm<AirplaneProp>();
  const [error, setError] = useState("");
  const { count, increment } = useIncrement();
  const [pending, setPending] = useState(false);
  const { message, showTimeout } = useMessage("Success");
  const [airplanes, setAirplanes] = useState<AirplaneProp[]>([]);

  useEffect(() => {
    updateAirplanes();
  }, []);

  const updateAirplanes = () => {
    increment();
    const current = count;
    fetchAirplanes().then((data: ResponseProp<AirplaneProp[]>) => {
      if (current !== count) {
        return;
      }
      if (data.result === "error") {
        setError(data.message ?? "Some unknown errors occurred");
      }
      setAirplanes(data.data ?? []);
    });
  };

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
          updateAirplanes();
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
      <div className="card-flex-container">
        {airplanes.map((value, index) => {
          return (
            <Card key={index}>
              <Card.Header>Airplane</Card.Header>
              <ListGroup>
                <Item tag="Plane ID" value={value.planeID} />
                <Item tag="Seat Capacity" value={value.seatCapacity} />
                <Item tag="Airline Name" value={value.airlineName} />
              </ListGroup>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
