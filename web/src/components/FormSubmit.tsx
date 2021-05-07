import { Button, Form } from "react-bootstrap";
import AlertMessage from "./AlertMessage";
import HintMessage from "./HintMessage";
import SuccessMessage from "./SuccessMessage";

export default function FormSubmit(props: {
  pending?: boolean;
  buttonMessage: string;
  errorMessage?: string;
  pendingMessage?: string;
  successMessage?: string;
}) {
  return (
    <div>
      <Form.Group>
        <Button type="submit" variant="success">
          {props.buttonMessage}
        </Button>
      </Form.Group>
      {props.errorMessage !== undefined && (
        <AlertMessage message={props.errorMessage} />
      )}
      {props.pendingMessage !== undefined && props.pending !== undefined && (
        <HintMessage control={props.pending} message={props.pendingMessage} />
      )}
      {props.successMessage !== undefined && (
        <SuccessMessage message={props.successMessage} />
      )}
    </div>
  );
}
