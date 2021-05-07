import { useEffect, useState } from "react";
import { CheckCircle } from "react-bootstrap-icons";
import useIncrement from "../api/use-increment";
import "../assets/SuccessMessage.css";

export const useMessage = (displayMessage: string) => {
  const [message, setMessage] = useState("");

  const showTimeout = () => {
    setMessage("");
    setMessage(displayMessage);
  };

  return { message, showTimeout };
};

const SuccessMessage = ({ message }: { message?: string }) => {
  const [show, setShow] = useState(false);
  const { count, increment } = useIncrement();
  useEffect(() => {
    if (!message) {
      // If the message os empty, hide the success message directly.
      setShow(false);
      return;
    }
    increment();
    const current = count;
    setShow(true);
    setTimeout(() => {
      if (current === count) {
        setShow(false);
      }
    }, 2000);
  }, [message]);

  return (
    <div className={`success-message ${show ? "show" : "hide"}`}>
      <CheckCircle style={{ color: "green" }} />
      {!!message && <span>{message}</span>}
    </div>
  );
};

export default SuccessMessage;
