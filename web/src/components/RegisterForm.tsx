import { forwardRef, useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import DatePicker from "react-datepicker";
import SelectUserType from "./SelectUserType";
import { useForm, Controller } from "react-hook-form";
import { RegisterProp, UserProp, UserType } from "../api/authentication";
import ConditionalFormGroup from "./ConditionalFormGroup";
import AlertMessage from "./AlertMessage";
import FormErrorMessage from "./FormErrorMessage";
import HintMessage from "./HintMessage";

import "../assets/Form.css";
import { Col } from "react-bootstrap";
import { IFormProps } from "../api/utils";
import { useAuth } from "../api/use-auth";
import MyDatePicker from "./MyDatePicker";
import FormNumber from "./FormNumber";
import MyFormInput from "./MyFormInput";

export default function RegisterForm(props: IFormProps<UserProp>) {
  const {
    handleSubmit,
    control,
    formState: { errors, submitCount },
    clearErrors,
    watch,
    getValues,
  } = useForm<RegisterProp>();
  const [registerError, setRegisterError] = useState("");
  const [pending, setPending] = useState(false);
  const auth = useAuth();
  const watchRegisterType = watch("registerType", UserType.CUST);

  useEffect(() => {
    setRegisterError("");
    clearErrors();
    setPending(false);
  }, [watchRegisterType, clearErrors]);

  const handleRegister = (data: RegisterProp) => {
    setPending(true);
    setRegisterError("");
    let currentSubmitCount = submitCount;
    auth
      .register(data)
      .then((resgisterResult) => {
        if (
          resgisterResult.result === "success" &&
          (data.registerType !== UserType.AGENT ||
            (resgisterResult.userData !== undefined &&
              resgisterResult.userData.agentId !== undefined))
        ) {
          if (submitCount !== currentSubmitCount) {
            console.log("Cancel on stale submission");
            return;
          }
          setRegisterError("");
          currentSubmitCount = -1; // Force cancel any other requests.
          props.onSubmit({
            ...data,
            userType: data.registerType,
            agentId: resgisterResult.userData?.agentId,
          });
        } else {
          setRegisterError(
            resgisterResult.message ?? "Some unknown errors occurred!"
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

  const DateCustomInput = forwardRef((props: any, ref) => {
    return <Form.Control {...props} ref={ref} />;
  });

  return (
    <Form onSubmit={handleSubmit(handleRegister)} className="app-form">
      <AlertMessage message={registerError} />
      <Form.Group controlId="formRegisterType">
        <Controller
          name="registerType"
          control={control}
          defaultValue={UserType.CUST}
          render={({ field: { onChange, value } }) => {
            return <SelectUserType onChange={onChange} value={value} />;
          }}
        />
      </Form.Group>

      <MyFormInput
        control={control as any}
        name="email"
        displayName="Email"
        error={errors.email}
        errorMessage="The email is required"
        placeholder="Your email here"
        controlProps={{ autoComplete: "username" }}
        required={true}
        validate={{
          pattern: (v) => {
            return (
              getValues().registerType === UserType.STAFF ||
              v === undefined ||
              /^\S+@\S+$/i.test(v) ||
              "Please enter a valid email."
            );
          },
        }}
        disabled={watchRegisterType === UserType.STAFF}
      />

      <MyFormInput
        control={control as any}
        name="airlineName"
        displayName="Airline Name"
        error={errors.airlineName}
        errorMessage="The airline name is required"
        placeholder="The airline you work for here"
        disabled={watchRegisterType !== UserType.STAFF}
        required={true}
      />

      <MyFormInput
        control={control as any}
        name="userName"
        displayName="Username"
        error={errors.userName}
        errorMessage="The username is required"
        placeholder="Your username here"
        disabled={watchRegisterType !== UserType.STAFF}
        required={true}
      />

      <Form.Row>
        <MyFormInput
          control={control as any}
          name="firstName"
          displayName="First Name"
          error={errors.firstName}
          errorMessage="The first name is required"
          placeholder="Your first name here"
          disabled={watchRegisterType !== UserType.STAFF}
          required={true}
          as={Col}
        />

        <MyFormInput
          control={control as any}
          name="lastName"
          displayName="Last Name"
          error={errors.lastName}
          errorMessage="The last name is required"
          placeholder="Your last name here"
          disabled={watchRegisterType !== UserType.STAFF}
          required={true}
          as={Col}
        />
      </Form.Row>

      <MyFormInput
        control={control as any}
        name="name"
        displayName="Name"
        error={errors.name}
        errorMessage="The name is required!"
        placeholder="Your name here"
        disabled={watchRegisterType !== UserType.CUST}
        required={true}
      />

      <FormNumber
        control={control as any}
        name="phoneNumber"
        displayName="Phone Number"
        error={errors.phoneNumber}
        errorMessage="The phone number is invalid!"
        placeholder="Your phone number here"
        disabled={watchRegisterType !== UserType.CUST}
        required={true}
      />

      <FormNumber
        control={control as any}
        name="passportNumber"
        displayName="Passport Number"
        error={errors.passportNumber}
        errorMessage="The passport number is invalid!"
        placeholder="Your passport number here"
        disabled={watchRegisterType !== UserType.CUST}
        required={true}
      />

      <MyDatePicker
        control={control as any}
        name="passportExpiration"
        displayName="Passport Expiration Date"
        placeholder="MM/DD/YYYY"
        dateFormat="MM/dd/yyyy"
        disabled={watchRegisterType !== UserType.CUST}
        required={true}
        error={errors.passportExpiration}
        errorMessage="The passport expiration is required"
        pickerProps={{ showYearDropdown: true, autoComplete: "off" }}
      />

      <MyFormInput
        control={control as any}
        name="passportCountry"
        displayName="Passport Country"
        error={errors.passportCountry}
        errorMessage="The passport country is required!"
        placeholder="Your passport country here"
        disabled={watchRegisterType !== UserType.CUST}
        required={true}
      />

      <FormNumber
        control={control as any}
        name="buildingNumber"
        displayName="Building Number"
        error={errors.buildingNumber}
        errorMessage="The building number is invalid!"
        placeholder="Your building number here"
        disabled={watchRegisterType !== UserType.CUST}
        required={true}
      />

      <MyFormInput
        control={control as any}
        name="street"
        displayName="Street"
        error={errors.street}
        errorMessage="The street is invalid!"
        placeholder="Your street here"
        validate={{
          maxLength: (v) => {
            return (
              watchRegisterType !== UserType.CUST ||
              v.length <= 30 ||
              "The street is too long (>30 characters)"
            );
          },
        }}
        disabled={watchRegisterType !== UserType.CUST}
        required={true}
      />

      <MyFormInput
        control={control as any}
        name="city"
        displayName="City"
        error={errors.city}
        errorMessage="The city is invalid!"
        placeholder="Your city here"
        disabled={watchRegisterType !== UserType.CUST}
        required={true}
      />

      <MyFormInput
        control={control as any}
        name="state"
        displayName="State"
        error={errors.state}
        errorMessage="The state is invalid!"
        placeholder="Your state here (2-digit code)"
        validate={{
          maxLength: (v) => {
            return (
              watchRegisterType !== UserType.CUST ||
              v.length <= 2 ||
              "The state needs to be a two-digit code!"
            );
          },
        }}
        disabled={watchRegisterType !== UserType.CUST}
        required={true}
      />

      <MyDatePicker
        control={control as any}
        name="dateOfBirth"
        displayName="Date of Birth"
        placeholder="MM/DD/YYYY"
        dateFormat="MM/dd/yyyy"
        disabled={watchRegisterType !== UserType.CUST}
        required={true}
        error={errors.dateOfBirth}
        errorMessage="The date of birth is required"
        pickerProps={{ showYearDropdown: true }}
      />

      <Form.Group controlId="formPassword">
        <Form.Label>Password</Form.Label>
        <Controller
          name="password"
          control={control}
          defaultValue={""}
          rules={{
            validate: {
              required: (v) => {
                return !!v || "The password is required!";
              },
            },
          }}
          render={({ field }) => (
            <Form.Control
              {...field}
              type="password"
              placeholder="Your password here"
              autoComplete="new-password"
              isInvalid={errors.password !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.password?.message} />
      </Form.Group>

      <Form.Group controlId="formPasswordConfirm">
        <Form.Label>Confirm Password</Form.Label>
        <Controller
          name="passwordConfirm"
          control={control}
          defaultValue={""}
          rules={{
            validate: {
              required: (v) => {
                return !!v || "Re-entering the password is reuquired!";
              },
              match: (v) => {
                return (
                  getValues().password === v || "The passwords should match!"
                );
              },
            },
          }}
          render={({ field }) => (
            <Form.Control
              {...field}
              type="password"
              placeholder="Re-enter your password here"
              autoComplete="new-password"
              isInvalid={errors.passwordConfirm !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.passwordConfirm?.message} />
      </Form.Group>

      <Form.Group>
        <Button
          variant="primary"
          type="submit"
          onClick={() => {
            console.log(errors);
          }}
          disabled={pending}
        >
          Submit
        </Button>
      </Form.Group>
      <HintMessage message="Registering..." control={pending} />
    </Form>
  );
}
