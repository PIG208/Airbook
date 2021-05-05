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

      <ConditionalFormGroup
        controlId="formEmail"
        condition={watchRegisterType !== UserType.STAFF}
      >
        <Form.Label>Email</Form.Label>
        <Controller
          name="email"
          control={control}
          defaultValue={""}
          rules={{
            validate: {
              required: (v) => {
                return (
                  getValues().registerType === UserType.STAFF ||
                  !!v ||
                  "The email is required!"
                );
              },
              pattern: (v) => {
                return (
                  getValues().registerType === UserType.STAFF ||
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
              autoComplete="username"
              isInvalid={errors.email !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.email?.message} />
      </ConditionalFormGroup>

      <ConditionalFormGroup
        controlId="formAirlineName"
        condition={watchRegisterType === UserType.STAFF}
      >
        <Form.Label>Airline Name</Form.Label>
        <Controller
          name="airlineName"
          control={control}
          defaultValue={""}
          rules={{
            validate: {
              required: (v) => {
                return (
                  getValues().registerType !== UserType.STAFF ||
                  !!v ||
                  "The airline name is required!"
                );
              },
            },
          }}
          render={({ field }) => (
            <Form.Control
              {...field}
              placeholder="Your airline name here"
              isInvalid={errors.airlineName !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.airlineName?.message} />
      </ConditionalFormGroup>

      <ConditionalFormGroup
        controlId="formUsername"
        condition={watchRegisterType === UserType.STAFF}
      >
        <Form.Label>Username</Form.Label>
        <Controller
          name="userName"
          control={control}
          defaultValue={""}
          rules={{
            validate: {
              required: (v) => {
                return (
                  getValues().registerType !== UserType.STAFF ||
                  !!v ||
                  "The username is required!"
                );
              },
            },
          }}
          render={({ field }) => (
            <Form.Control
              {...field}
              placeholder="Your username here"
              autoComplete="username"
              isInvalid={errors.userName !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.userName?.message} />
      </ConditionalFormGroup>
      <Form.Row>
        <Col>
          <ConditionalFormGroup
            controlId="formFirstName"
            condition={watchRegisterType === UserType.STAFF}
          >
            <Form.Label>First Name</Form.Label>
            <Controller
              name="firstName"
              control={control}
              defaultValue={""}
              rules={{
                validate: {
                  required: (v) => {
                    return (
                      getValues().registerType !== UserType.STAFF ||
                      !!v ||
                      "The first name is required!"
                    );
                  },
                },
              }}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  placeholder="Your first name here"
                  isInvalid={errors.firstName !== undefined}
                />
              )}
            />
            <FormErrorMessage message={errors.firstName?.message} />
          </ConditionalFormGroup>
        </Col>

        <Col>
          <ConditionalFormGroup
            controlId="formLastName"
            condition={watchRegisterType === UserType.STAFF}
          >
            <Form.Label>Last Name</Form.Label>
            <Controller
              name="lastName"
              control={control}
              defaultValue={""}
              rules={{
                validate: {
                  required: (v) => {
                    return (
                      getValues().registerType !== UserType.STAFF ||
                      !!v ||
                      "The last name is required!"
                    );
                  },
                },
              }}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  placeholder="Your last name here"
                  isInvalid={errors.lastName !== undefined}
                />
              )}
            />
            <FormErrorMessage message={errors.lastName?.message} />
          </ConditionalFormGroup>
        </Col>
      </Form.Row>

      <ConditionalFormGroup
        controlId="formName"
        condition={watchRegisterType === UserType.CUST}
      >
        <Form.Label>Name</Form.Label>
        <Controller
          name="name"
          control={control}
          defaultValue={""}
          rules={{
            validate: {
              required: (v) => {
                return (
                  getValues().registerType !== UserType.CUST ||
                  !!v ||
                  "The name is required!"
                );
              },
            },
          }}
          render={({ field }) => (
            <Form.Control
              {...field}
              placeholder="Your name here"
              isInvalid={errors.name !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.name?.message} />
      </ConditionalFormGroup>

      <ConditionalFormGroup
        controlId="formPhoneNumber"
        condition={watchRegisterType === UserType.CUST}
      >
        <Form.Label>Phone Number</Form.Label>
        <Controller
          name="phoneNumber"
          control={control}
          defaultValue={""}
          rules={{
            validate: {
              required: (v) => {
                return (
                  getValues().registerType !== UserType.CUST ||
                  !!v ||
                  "The phone number is required!"
                );
              },
              numeric: (v) => {
                return (
                  getValues().registerType !== UserType.CUST ||
                  (!isNaN(v) && Number(v) > 0) ||
                  "The phone number is invalid!"
                );
              },
            },
          }}
          render={({ field }) => (
            <Form.Control
              {...field}
              placeholder="Your phone number here"
              isInvalid={errors.phoneNumber !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.phoneNumber?.message} />
      </ConditionalFormGroup>

      <ConditionalFormGroup
        controlId="passportNumber"
        condition={watchRegisterType === UserType.CUST}
      >
        <Form.Label>Passport Number</Form.Label>
        <Controller
          name="passportNumber"
          control={control}
          defaultValue={""}
          rules={{
            validate: {
              required: (v) => {
                return (
                  getValues().registerType !== UserType.CUST ||
                  !!v ||
                  "The passport number is required!"
                );
              },
            },
          }}
          render={({ field }) => (
            <Form.Control
              {...field}
              placeholder="Your passport number here"
              isInvalid={errors.passportNumber !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.passportNumber?.message} />
      </ConditionalFormGroup>

      <ConditionalFormGroup
        controlId="formPassportExpiration"
        condition={watchRegisterType === UserType.CUST}
      >
        <Form.Label>Passport Expiration Date</Form.Label>
        <Controller
          name="passportExpiration"
          control={control}
          defaultValue={""}
          rules={{
            validate: {
              required: (v) => {
                return (
                  getValues().registerType !== UserType.CUST ||
                  !!v ||
                  "The date of birth is required!"
                );
              },
              pattern: (v) => {
                return (
                  getValues().registerType !== UserType.CUST ||
                  !/^(0?[1-9]|[1][0-2])\/(0?[1-9]|[1-2]\d|[3][0-1])\/(19|20)\d\d/.test(
                    v
                  ) ||
                  "The date of birth is invalid!"
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
              autoComplete="off"
              showYearDropdown
              customInput={
                <DateCustomInput
                  isInvalid={errors.passportExpiration !== undefined}
                />
              }
            />
          )}
        />
        <FormErrorMessage message={errors.passportExpiration?.message} />
      </ConditionalFormGroup>

      <ConditionalFormGroup
        controlId="passportCountry"
        condition={watchRegisterType === UserType.CUST}
      >
        <Form.Label>Passport Country</Form.Label>
        <Controller
          name="passportCountry"
          control={control}
          defaultValue={""}
          rules={{
            validate: {
              required: (v) => {
                return (
                  getValues().registerType !== UserType.CUST ||
                  !!v ||
                  "The passport country is required!"
                );
              },
            },
          }}
          render={({ field }) => (
            <Form.Control
              {...field}
              placeholder="Your passport country here"
              isInvalid={errors.passportCountry !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.passportCountry?.message} />
      </ConditionalFormGroup>

      <ConditionalFormGroup
        controlId="formBuildingNumber"
        condition={watchRegisterType === UserType.CUST}
      >
        <Form.Label>Building Number</Form.Label>
        <Controller
          name="buildingNumber"
          control={control}
          defaultValue={""}
          rules={{
            validate: {
              numeric: (v) => {
                return (
                  getValues().registerType !== UserType.CUST ||
                  v === "" ||
                  (!isNaN(v) && Number(v) > 0) ||
                  "The building number is invalid!"
                );
              },
            },
          }}
          render={({ field }) => (
            <Form.Control
              {...field}
              placeholder="Your building number here"
              isInvalid={errors.buildingNumber !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.buildingNumber?.message} />
      </ConditionalFormGroup>

      <ConditionalFormGroup
        controlId="formStreet"
        condition={watchRegisterType === UserType.CUST}
      >
        <Form.Label>Street</Form.Label>
        <Controller
          name="street"
          control={control}
          defaultValue={""}
          render={({ field }) => (
            <Form.Control
              {...field}
              placeholder="Your street here"
              isInvalid={errors.street !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.street?.message} />
      </ConditionalFormGroup>

      <ConditionalFormGroup
        controlId="formCity"
        condition={watchRegisterType === UserType.CUST}
      >
        <Form.Label>City</Form.Label>
        <Controller
          name="city"
          control={control}
          defaultValue={""}
          render={({ field }) => (
            <Form.Control
              {...field}
              placeholder="Your city here"
              isInvalid={errors.city !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.city?.message} />
      </ConditionalFormGroup>

      <ConditionalFormGroup
        controlId="formState"
        condition={watchRegisterType === UserType.CUST}
      >
        <Form.Label>State</Form.Label>
        <Controller
          name="state"
          control={control}
          defaultValue={""}
          render={({ field }) => (
            <Form.Control
              {...field}
              placeholder="Your state here (2-digit code)"
              isInvalid={errors.state !== undefined}
            />
          )}
        />
        <FormErrorMessage message={errors.state?.message} />
      </ConditionalFormGroup>

      <ConditionalFormGroup
        controlId="formDOB"
        condition={watchRegisterType !== UserType.AGENT}
      >
        <Form.Label>Date of birth</Form.Label>
        <Controller
          name="dateOfBirth"
          control={control}
          defaultValue={""}
          rules={{
            validate: {
              required: (v) => {
                return (
                  getValues().registerType === UserType.AGENT ||
                  !!v ||
                  "The date of birth is required!"
                );
              },
              pattern: (v) => {
                return (
                  getValues().registerType === UserType.AGENT ||
                  !/^(0?[1-9]|[1][0-2])\/(0?[1-9]|[1-2]\d|[3][0-1])\/(19|20)\d\d/.test(
                    v
                  ) ||
                  "The date of birth is invalid!"
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
              autoComplete="off"
              showYearDropdown
              customInput={
                <DateCustomInput isInvalid={errors.dateOfBirth !== undefined} />
              }
            />
          )}
        />
        <FormErrorMessage message={errors.dateOfBirth?.message} />
      </ConditionalFormGroup>

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
        <Button variant="primary" type="submit" disabled={pending}>
          Submit
        </Button>
      </Form.Group>
      <HintMessage message="Registering..." control={pending} />
    </Form>
  );
}
