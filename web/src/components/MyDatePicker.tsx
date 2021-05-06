import { Form } from "react-bootstrap";
import DatePicker, { ReactDatePickerProps } from "react-datepicker";
import { Control, Controller, FieldError } from "react-hook-form";
import { ElementType, forwardRef } from "react";
import FormErrorMessage from "./FormErrorMessage";

export default function MyDatePicker(props: {
  control: Control;
  name: string;
  displayName: string;
  placeholder: string;
  dateFormat?: string;
  error?: FieldError;
  errorMessage?: string;
  required?: boolean;
  as?: ElementType;
  pickerProps?: Omit<
    ReactDatePickerProps,
    | "onChange"
    | "placeholderText"
    | "selected"
    | "wrapperClassName"
    | "customInput"
    | "dateFormat"
  >;
}) {
  const DateCustomInput = forwardRef((props: any, ref) => {
    return <Form.Control {...props} ref={ref} />;
  });
  return (
    <Form.Group as={props.as ?? "div"} controlId="formSpendingsDateLower">
      <Form.Label>{props.displayName}</Form.Label>
      <Controller
        name={props.name}
        control={props.control}
        defaultValue={""}
        rules={
          props.required
            ? { required: props.errorMessage ?? "The field is required!" }
            : {}
        }
        render={({ field: { onChange, value } }) => (
          <DatePicker
            {...props.pickerProps}
            selected={value}
            onChange={onChange}
            placeholderText={props.placeholder}
            wrapperClassName={"form-control"}
            dateFormat={props.dateFormat ?? "yyyy/MM/dd h:mm aa"}
            customInput={<DateCustomInput isInvalid={!!props.error} />}
          />
        )}
      />
      <FormErrorMessage message={props.error?.message} />
    </Form.Group>
  );
}
