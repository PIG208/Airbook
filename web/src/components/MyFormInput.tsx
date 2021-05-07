import { Form } from "react-bootstrap";
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  UseFormStateReturn,
  Validate,
} from "react-hook-form";
import { FormComponentProp } from "../api/form";
import FormErrorMessage from "./FormErrorMessage";

export default function MyFormInput(
  props: FormComponentProp & {
    validate?: Validate<any> | Record<string, Validate<any>> | undefined;
  } & {
    controlProps?: any;
    altRender?: ({
      field,
    }: {
      field: ControllerRenderProps<FieldValues, string>;
      fieldState: ControllerFieldState;
      formState: UseFormStateReturn<FieldValues>;
    }) => JSX.Element;
  }
) {
  return (
    <Form.Group
      controlId={`form${props.name}`}
      className={props.disabled ? "hidden" : ""}
      as={props.as}
    >
      <Form.Label>{props.displayName}</Form.Label>
      <Controller
        name={props.name}
        control={props.control}
        defaultValue={""}
        rules={{
          validate: {
            ...props.validate,
            requiredll: (v) => {
              return (
                !props.required ||
                (props.disabled ?? false) ||
                (!!v && v !== 0) ||
                (props.errorMessage ?? "The field is invalid")
              );
            },
          },
        }}
        render={
          !props.altRender
            ? ({ field }) => (
                <Form.Control
                  {...props.controlProps}
                  {...field}
                  placeholder={props.placeholder}
                  isInvalid={props.error !== undefined}
                />
              )
            : props.altRender
        }
      />
      <FormErrorMessage message={props.error?.message} />
    </Form.Group>
  );
}
