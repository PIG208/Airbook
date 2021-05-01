import React, { useState } from "react";
import Portico from "../components/Portico";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";

enum Option {
  LOGIN = "Login",
  REGISTER = "Register",
}

export default function Visitor() {
  const [option, setOption] = useState<Option>(Option.LOGIN);

  const handleToggle = (val: Option) => {
    setOption(val);
  };

  return (
    <Portico title={option}>
      {option === Option.LOGIN && (
        <div>
          <LoginForm />
        </div>
      )}
      {option === Option.REGISTER && (
        <div>
          <RegisterForm />
        </div>
      )}
      <ToggleButtonGroup
        name="option"
        type="radio"
        value={option}
        onChange={handleToggle}
      >
        <ToggleButton variant="light" value={Option.LOGIN}>
          Login
        </ToggleButton>
        <ToggleButton variant="light" value={Option.REGISTER}>
          Register
        </ToggleButton>
      </ToggleButtonGroup>
    </Portico>
  );
}
