import { useState } from "react";
import { Form } from "react-bootstrap";
import { Controller, useForm } from "react-hook-form";
import { FlightPrimaryProp } from "../api/data";
import useIncrement from "../api/use-increment";
import ReactStars from "react-rating-stars-component";
import { IFormProps } from "../api/utils";
import { addFeedbackForFlight } from "../api/feedback";
import FormSubmit from "./FormSubmit";
import { useMessage } from "./SuccessMessage";

export type FeedbackFormProp = { rating: string; comment: string };

export default function FeedbackForm(
  props: IFormProps<FeedbackFormProp> & FlightPrimaryProp
) {
  const { handleSubmit, control } = useForm<FeedbackFormProp>();
  const [feedbackError, setFeedbackError] = useState("");
  const [pending, setPending] = useState(false);
  const { count, increment } = useIncrement();
  const { message, showTimeout } = useMessage("Success");

  const handleComment = (data: FeedbackFormProp) => {
    increment();
    const current = count;
    setPending(true);
    addFeedbackForFlight({ ...data, ...props }).then((res) => {
      if (count !== current) {
        return;
      }
      if (res.result === "error") {
        setFeedbackError(
          res.message ?? "Some error occurred from the serverside."
        );
      } else {
        showTimeout();
        props.onSubmit(data);
        setFeedbackError("");
      }
      setPending(false);
    });
  };

  return (
    <Form onSubmit={handleSubmit(handleComment)}>
      <Form.Group>
        <Form.Label>Rating</Form.Label>
        <Controller
          name="rating"
          control={control}
          defaultValue={3}
          render={({ field: { onChange, value } }) => (
            <ReactStars count={5} size={24} onChange={onChange} value={value} />
          )}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>Comment</Form.Label>
        <Controller
          name="comment"
          control={control}
          defaultValue={""}
          render={({ field }) => <Form.Control as="textarea" {...field} />}
        />
      </Form.Group>
      <FormSubmit
        buttonMessage="Submit"
        pending={pending}
        pendingMessage="Sending your feedback..."
        successMessage={message}
        errorMessage={feedbackError}
      />
    </Form>
  );
}
