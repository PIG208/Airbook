import { Spinner } from "react-bootstrap";
import "../assets/HintMessage.css";
import "../assets/transitions.css";

const HintMessage = (props: { message: string; control?: boolean }) => {
  const hidden = (): boolean => {
    return (
      props.message === undefined ||
      props.message.length === 0 ||
      !props.control
    );
  };

  if (hidden()) {
    return <div></div>;
  }

  return (
    <div className={["hint-message", !hidden() ? "fadein" : ""].join(" ")}>
      <span>
        <Spinner animation="border" role="status" variant="primary" />
      </span>
      <span>{props.message}</span>
    </div>
  );
};

export default HintMessage;
