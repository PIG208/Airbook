import Alert from "react-bootstrap/Alert";
import { ExclamationTriangleFill } from "react-bootstrap-icons";
import "../assets/AlertMessage.css";
import "../assets/transitions.css";

const AlertMessage = (props: { message: string }) => {
  if (props.message === undefined || String(props.message).trim() === "") {
    return <div></div>;
  }
  return (
    <Alert variant="warning" className="form-alert fadein">
      <ExclamationTriangleFill />
      &nbsp;
      <span>{props.message}</span>
    </Alert>
  );
};

export default AlertMessage;
