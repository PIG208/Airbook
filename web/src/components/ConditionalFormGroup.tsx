import { Form } from "react-bootstrap";
import { WithChildren } from "./Utils";

const ConditionalFormGroup = (
  props: WithChildren<{ controlId: string; condition: boolean }>
) => {
  if (!props.condition) {
    return <div></div>;
  }
  return <Form.Group controlId={props.controlId}>{props.children}</Form.Group>;
};

export default ConditionalFormGroup;
