import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { login, LoginProp, UserType } from "../api/authentication";
import { Button, Form } from "react-bootstrap";
import AlertMessage from "./AlertMessage";
import HintMessage from "./HintMessage";
import SelectUserType from "./SelectUserType";
import FormErrorMessage from "./FormErrorMessage";
import "../assets/Form.css";
import { IFormProps } from "../api/utils";
import { ResponseProp } from "../api/api";

export default function LoginForm() {
  const {
    handleSubmit,
    control,
    formState: { errors, submitCount },
    clearErrors,
    getValues,
    watch,
  } = useForm<LoginProp>();
  const [loginError, setLoginError] = useState("");
  const [pending, setPending] = useState(false);
  const watchLoginType = watch("loginType", UserType.CUST);

  useEffect(() => {
    setLoginError("");
    clearErrors();
    setPending(false);
  }, [watchLoginType, clearErrors]);

  const handleLogin = (data: LoginProp) => {
    setPending(true);
    setLoginError("");
    const currentSubmitCount = submitCount;
    login(data)
      .then((loginResult) => {
        if (submitCount !== currentSubmitCount) {
          console.log("Cancel on stale submission");
          return;
        }
        if (loginResult.result === "success") {
          alert("success");
          setLoginError("");
        } else {
          setLoginError(loginResult.message ?? "");
        }
      })
      .finally(() => {
        if (submitCount !== currentSubmitCount) {
          console.log("Cancel on stale submission");
          return;
        }
        setPending(false);
      });
  };

  return (
    <Form
      onSubmit={handleSubmit(handleLogin)}
      id="login-form"
      className="app-form"
    >
      <AlertMessage message={loginError} />

      <Form.Group controlId="formLoginType">
        <Controller
          name="loginType"
          control={control}
          defaultValue={UserType.CUST}
          render={({ field: { onChange, value } }) => (
            <SelectUserType onChange={onChange} value={value} />
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
            rules={{
              validate: {
                required: (v) => {
                  return (
                    getValues().loginType === UserType.STAFF ||
                    !!v ||
                    "The email is required!"
                  );
                },
                pattern: (v) => {
                  return (
                    getValues().loginType === UserType.STAFF ||
                    v === undefined ||
                    /^\S+@\S+$/i.test(v) ||
                    "Please enter a valid email."
                  );
                },
              },
            }}
            render={({ field }) => (
              <Form.Control
                {...field}
                placeholder="Your email here"
                isInvalid={errors.email !== undefined}
              />
            )}
          />
          <FormErrorMessage message={errors.email?.message} />
        </Form.Group>
      )}

      {watchLoginType === UserType.STAFF && (
        <Form.Group controlId="formUsername">
          <Form.Label>Username</Form.Label>
          <Controller
            name="userName"
            control={control}
            defaultValue={""}
            rules={{
              validate: () => {
                return (
                  getValues().loginType !== UserType.STAFF ||
                  getValues().userName?.trim() !== "" ||
                  "The username is required!"
                );
              },
            }}
            render={({ field }) => (
              <Form.Control
                {...field}
                placeholder="Your username here"
                isInvalid={errors.userName !== undefined}
              />
            )}
          />
          <FormErrorMessage message={errors.userName?.message} />
        </Form.Group>
      )}

      {watchLoginType === UserType.AGENT && (
        <Form.Group controlId="formAgentId">
          <Form.Label>Booking Agent ID</Form.Label>
          <Controller
            name="agentId"
            control={control}
            defaultValue={""}
            rules={{
              validate: {
                required: (v) => {
                  return (
                    getValues().loginType !== UserType.AGENT ||
                    !!v ||
                    (v !== "" && v !== 0) ||
                    "Booking agent ID is required!"
                  );
                },
                positiveInt: (v) => {
                  const num = Number(v);
                  return (
                    (!isNaN(num) && num >= 0) ||
                    "The booking agent ID is invalid!"
                  );
                },
              },
            }}
            render={({ field }) => (
              <Form.Control
                {...field}
                type="number"
                placeholder="Your booking agent id here"
                isInvalid={errors.agentId !== undefined}
              />
            )}
          />
          <FormErrorMessage message={errors.agentId?.message} />
        </Form.Group>
      )}

      <Form.Group controlId="formPassword">
        <Form.Label>Password</Form.Label>
        <Controller
          name="password"
          control={control}
          rules={{ required: "The password is required!" }}
          defaultValue={""}
          render={({ field }) => (
            <Form.Control
              {...field}
              type="password"
              placeholder="Your password here"
              isInvalid={errors.password !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.password?.message} />
      </Form.Group>
      <Form.Group>
        <Button variant="primary" type="submit" disabled={pending}>
          Submit
        </Button>
      </Form.Group>
      <HintMessage message="Logging you in..." control={pending} />
    </Form>
  );
}
