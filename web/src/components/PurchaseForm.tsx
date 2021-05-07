import React, { useEffect, useState, forwardRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { UserType } from "../api/authentication";
import { Button, Form } from "react-bootstrap";
import DatePicker from "react-datepicker";
import FormErrorMessage from "./FormErrorMessage";
import "../assets/Form.css";
import { IFormProps } from "../api/utils";
import { useAuth } from "../api/use-auth";
import { CardType, PurchaseProp } from "../api/data";
import ConditionalFormGroup from "./ConditionalFormGroup";
import { getFlightPrice, purchase } from "../api/purchase";
import SuccessMessage, { useMessage } from "./SuccessMessage";
import useIncrement from "../api/use-increment";
import FormSubmit from "./FormSubmit";
import MyDatePicker from "./MyDatePicker";

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
  } = useForm<UserPurchaseProp>();
  const [purchaseError, setPurchaseError] = useState("");
  const [pending, setPending] = useState(false);
  const [price, setPrice] = useState();
  const { count, increment } = useIncrement();
  const { message, showTimeout } = useMessage("success");
  const auth = useAuth();

  useEffect(() => {
    increment();
    const current = count;
    if (
      props.depDate &&
      props.depTime &&
      (props.flightNumber || props.flightNumber === 0)
    ) {
      getFlightPrice({
        flightNumber: props.flightNumber,
        depDate: props.depDate,
        depTime: props.depTime,
      }).then((res) => {
        if (current !== count) {
          return;
        }
        if (res.result !== "error") {
          setPrice(res.data.price);
        } else {
          setPurchaseError("Failed to fetch the price.");
        }
      });
    }
    return () => {
      setPurchaseError("");
    };
  }, [props, submitCount]);

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
        showTimeout();
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
      {price && (
        <div>
          Current Price: <strong style={{ color: "green" }}>${price}</strong>
        </div>
      )}

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

      <MyDatePicker
        control={control as any}
        name="expDate"
        displayName="Card Expiration Date"
        error={errors.expDate}
        errorMessage="The card expiration date is required!"
        placeholder="MM/DD/YYYY"
        dateFormat="MM/dd/yyyy"
        pickerProps={{ showYearDropdown: true, autoComplete: "off" }}
        required
        validate={{
          after: (v) => {
            return v > new Date() || "The card has expired!";
          },
        }}
      />

      <FormSubmit
        buttonMessage="Purchase"
        pending={pending}
        pendingMessage="Handling transaction..."
        successMessage={message}
        errorMessage={purchaseError}
      />
    </Form>
  );
}
