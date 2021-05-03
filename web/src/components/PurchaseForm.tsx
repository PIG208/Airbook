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
import ConditionalFormGroup from "./ConditionalFormGroup";
import { purchase } from "../api/purchase";

type UserPurchaseProp = Omit<
  PurchaseProp,
  "airlineName" | "flightNumber" | "depDate" | "depTime"
>;

export default function PurchaseForm(
  props: IFormProps<UserPurchaseProp> & {
    airlineName?: string;
    flightNumber?: number;
    depDate?: string;
    depTime?: string;
  }
) {
  const {
    handleSubmit,
    control,
    formState: { errors, submitCount },
    clearErrors,
  } = useForm<UserPurchaseProp>();
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

  const handlePurchase = (data: UserPurchaseProp) => {
    setPending(true);
    setPurchaseError("");
    let currentSubmitCount = submitCount;
    purchase(Object.assign({}, data, props))
      .then((res) => {
        if (currentSubmitCount !== submitCount) {
          console.log("Aborted stale purchase.");
          return;
        }
        if (res.result === "error") {
          setPurchaseError(res.message ?? "An unknown error occurred.");
          return data;
        }
        props.onSubmit(data);
      })
      .finally(() => {
        if (currentSubmitCount !== submitCount) {
          console.log("Aborted stale purchase.");
          return;
        }
        setPending(false);
      });
  };

  return (
    <Form
      onSubmit={handleSubmit(handlePurchase)}
      id="purchase-form"
      className="app-form"
    >
      <AlertMessage message={purchaseError} />

      <ConditionalFormGroup
        controlId="formEmail"
        condition={auth.userProp.userType === UserType.AGENT}
      >
        <Form.Label>Email to purchase for</Form.Label>
        <Controller
          name="email"
          control={control}
          defaultValue={""}
          rules={{
            validate: {
              required: (v) => {
                return (
                  auth.userProp.userType !== UserType.AGENT ||
                  !!v ||
                  "The email is required!"
                );
              },
              pattern: (v) => {
                return (
                  auth.userProp.userType !== UserType.AGENT ||
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
              placeholder="The customer email here"
              isInvalid={errors.email !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.email?.message} />
      </ConditionalFormGroup>

      <Form.Group controlId="formCardType">
        <Form.Label>Card Type</Form.Label>
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
      <HintMessage message="Handling transaction..." control={pending} />
    </Form>
  );
}
