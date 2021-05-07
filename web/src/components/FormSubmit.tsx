import { Button, Form } from "react-bootstrap";
import AlertMessage from "./AlertMessage";
import HintMessage from "./HintMessage";
import SuccessMessage from "./SuccessMessage";

export default function FormSubmit(props: {
  pending: boolean;
  buttonMessage: string;
  errorMessage: string;
  pendingMessage: string;
  successMessage: string;
}) {
  return (
    <div>
      <Form.Row>
        <Button type="submit" variant="success">
          {props.buttonMessage}
        </Button>
      </Form.Row>
      <AlertMessage message={props.errorMessage} />
      <HintMessage control={props.pending} message={props.pendingMessage} />
      <SuccessMessage message={props.successMessage} />
    </div>
  );
}
