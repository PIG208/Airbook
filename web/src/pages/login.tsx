import React, { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Portico from "../components/Portico";
import { ExclamationTriangleFill } from "react-bootstrap-icons";
import { useForm, Controller } from "react-hook-form";
import { login, LoginProp, UserType } from "../api/authentication";
import "../assets/login.css";

export default function Login() {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<LoginProp>();

  const [loginError, setLoginError] = useState("");
  const watchLoginType = watch("loginType", UserType.CUST);

  useEffect(() => {
    setLoginError("");
  }, [watchLoginType]);

  const handleLogin = (data: LoginProp) => {
    login(data).then((loginResult) => {
      if (loginResult.result === "success") {
        alert("success");
        setLoginError("");
      } else {
        setLoginError(loginResult.message ?? "");
      }
    });
  };
  return (
    <Portico title="Login">
      <Form onSubmit={handleSubmit(handleLogin)} id="login-form">
        {loginError && (
          <Alert variant="warning" className="form-alert">
            <ExclamationTriangleFill />
            {loginError}
          </Alert>
        )}
        <Form.Group controlId="formLoginType">
          <Controller
            name="loginType"
            control={control}
            defaultValue={UserType.CUST}
            render={({ field }) => (
              <Form.Control {...field} as="select">
                <option value={UserType.CUST}>Customer</option>
                <option value={UserType.AGENT}>Booking Agent</option>
                <option value={UserType.STAFF}>Airline Staff</option>
              </Form.Control>
            )}
          />
        </Form.Group>
        {watchLoginType !== UserType.STAFF && (
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Controller
              name="email"
              control={control}
              defaultValue={""}
              rules={{ required: true, pattern: /^\S+@\S+$/i }}
              render={({ field }) =>
                errors.email ? (
                  <Form.Control
                    {...field}
                    placeholder="Your email here"
                    isInvalid
                  />
                ) : (
                  <Form.Control {...field} placeholder="Your email here" />
                )
              }
            />
            {errors.email && (
              <Form.Control.Feedback type="invalid">
                {errors.email.type === "required"
                  ? "Email is required"
                  : "Email is invalid"}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        )}

        {watchLoginType === UserType.STAFF && (
          <Form.Group controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Controller
              name="userName"
              control={control}
              defaultValue={""}
              rules={{ required: true }}
              render={({ field }) => (
                <Form.Control {...field} placeholder="Your username here" />
              )}
            />
          </Form.Group>
        )}

        {watchLoginType === UserType.AGENT && (
          <Form.Group controlId="formAgentId">
            <Form.Label>Booking Agent ID</Form.Label>
            <Controller
              name="agentId"
              control={control}
              defaultValue={0}
              rules={{ required: true }}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  type="number"
                  placeholder="Your booking agent id here"
                />
              )}
            />
          </Form.Group>
        )}

        <Form.Group controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Controller
            name="password"
            control={control}
            rules={{ required: true }}
            defaultValue={""}
            render={({ field }) => (
              <Form.Control
                {...field}
                type="password"
                placeholder="Your password here"
              />
            )}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Portico>
  );
}
