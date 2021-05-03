import "../assets/visitor.css";
import logo from "../assets/logo.svg";
import React, { useEffect, useState } from "react";
import Portico from "../components/Portico";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { useHistory, Link, Redirect } from "react-router-dom";
import { useAuth } from "../api/use-auth";
import { UserType } from "../api/authentication";

enum Option {
  LOGIN = "Login",
  REGISTER = "Register",
}

export default function Visitor() {
  const [option, setOption] = useState<Option>(Option.LOGIN);
  let history = useHistory();
  let auth = useAuth();

  const handleToggle = (val: Option) => {
    setOption(val);
  };

  useEffect(() => {
    auth.fetchSession().then((data) => {
      if (
        data.result === "success" &&
        data.userData?.userType !== UserType.PUBLIC
      ) {
        history.replace("/dashboard");
      }
    });
  });

  const handleSubmit = () => {
    history.push("/dashboard/");
  };

  return (
    <header className="visitor">
      <img src={logo} className="App-logo" alt="logo" />
      <Portico title={option}>
        {option === Option.LOGIN && (
          <div>
            <LoginForm onSubmit={handleSubmit} />
          </div>
        )}
        {option === Option.REGISTER && (
          <div>
            <RegisterForm onSubmit={handleSubmit} />
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
        {auth.userProp.userType !== UserType.PUBLIC && (
          <Redirect to="/dashboard/Home" />
        )}
        <div>
          <Link to="/dashboard/Home">Visit the site as a visitor.</Link>
        </div>
      </Portico>
    </header>
  );
}
