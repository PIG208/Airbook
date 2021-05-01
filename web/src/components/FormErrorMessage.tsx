import Form from "react-bootstrap/Form";
import "../assets/FormErrorMessage.css";

const FormErrorMessage = (props: { message?: string }) => {
  if (props.message === undefined || props.message.length === 0) {
    return <div></div>;
  }
  return (
    <Form.Control.Feedback
      type="invalid"
      className="form-error-message"
      style={{ display: "block" }}
    >
      {props.message}
    </Form.Control.Feedback>
  );
};

export default FormErrorMessage;
