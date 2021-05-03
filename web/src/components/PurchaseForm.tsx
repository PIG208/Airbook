import React, { useEffect, useState, forwardRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { LoginProp, UserProp, UserType } from "../api/authentication";
import { Button, Form } from "react-bootstrap";
import AlertMessage from "./AlertMessage";
import HintMessage from "./HintMessage";
import DatePicker from "react-datepicker";
import FormErrorMessage from "./FormErrorMessage";
import "../assets/Form.css";
import { IFormProps } from "../api/utils";
import { useAuth } from "../api/use-auth";
import { CardType, PurchaseProp } from "../api/data";

export default function PurchaseForm(props: IFormProps<UserProp>) {
  const {
    handleSubmit,
    control,
    formState: { errors, submitCount },
    clearErrors,
    getValues,
  } = useForm<PurchaseProp>();
  const [purchaseError, setPurchaseError] = useState("");
  const [pending, setPending] = useState(false);
  const auth = useAuth();

  useEffect(() => {
    return () => {
      setPurchaseError("");
      clearErrors();
      setPending(false);
    };
  }, []);

  const DateCustomInput = forwardRef((props: any, ref) => {
    return <Form.Control {...props} ref={ref} />;
  });

  const handlePurchase = (data: LoginProp) => {
    setPending(true);
    setPurchaseError("");
    let currentSubmitCount = submitCount;
    auth
      .login(data)
      .then((loginResult) => {
        if (submitCount !== currentSubmitCount) {
          console.log("Cancel on stale submission");
          return;
        }
        if (
          loginResult.result === "success" &&
          loginResult.userData !== undefined
        ) {
          setPurchaseError("");
          currentSubmitCount = -1; // Force cancel any other requests.
          props.onSubmit(loginResult.userData);
        } else {
          setPurchaseError(
            loginResult.message ?? "Some unknown errors occurred!"
          );
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
      onSubmit={handleSubmit(handlePurchase)}
      id="login-form"
      className="app-form"
    >
      <AlertMessage message={purchaseError} />

      <Form.Group controlId="formCardType">
        <Controller
          name="cardType"
          control={control}
          defaultValue={CardType.CREDIT}
          render={({ field: { onChange, value } }) => (
            <Form.Control onChange={onChange} value={value} as="select">
              <option value={CardType.CREDIT}>Credit</option>
              <option value={CardType.DEBT}>Debt</option>
            </Form.Control>
          )}
        />
      </Form.Group>

      <Form.Group controlId="formCardNumber">
        <Form.Label>Card Number</Form.Label>
        <Controller
          name="cardNumber"
          control={control}
          defaultValue={""}
          rules={{
            required: "The card number is required!",
            maxLength: 30,
            validate: {
              numeric: (v) => {
                return !isNaN(Number(v)) || "Please enter a valid card number.";
              },
            },
          }}
          render={({ field }) => (
            <Form.Control
              {...field}
              placeholder="Your card number here"
              isInvalid={errors.cardNumber !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.cardNumber?.message} />
      </Form.Group>

      <Form.Group controlId="formNameOnCard">
        <Form.Label>Name on Card</Form.Label>
        <Controller
          name="nameOnCard"
          control={control}
          defaultValue={""}
          rules={{
            required: "The name on card is required!",
            maxLength: 30,
          }}
          render={({ field }) => (
            <Form.Control
              {...field}
              placeholder="Your name on card here"
              isInvalid={errors.nameOnCard !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.nameOnCard?.message} />
      </Form.Group>

      <Form.Group>
        <Form.Label>Card Expiration Date</Form.Label>
        <Controller
          name="expDate"
          control={control}
          defaultValue={""}
          rules={{
            required: "The card expiration date is required",
            validate: {
              pattern: (v) => {
                return (
                  !/^(0?[1-9]|[1][0-2])\/(0?[1-9]|[1-2]\d|[3][0-1])\/(19|20)\d\d/.test(
                    v
                  ) || "The card expiration date is invalid!"
                );
              },
            },
          }}
          render={({ field: { onChange, value } }) => (
            <DatePicker
              selected={value}
              onChange={onChange}
              placeholderText="MM/DD/YYYY"
              wrapperClassName={"form-control"}
              showYearDropdown
              customInput={
                <DateCustomInput isInvalid={errors.expDate !== undefined} />
              }
            />
          )}
        />
        <FormErrorMessage message={errors.expDate?.message} />
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
