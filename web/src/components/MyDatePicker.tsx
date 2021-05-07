import { Form } from "react-bootstrap";
import DatePicker, { ReactDatePickerProps } from "react-datepicker";
import { Controller } from "react-hook-form";
import { forwardRef } from "react";
import FormErrorMessage from "./FormErrorMessage";
import { FormComponentProp } from "../api/form";
import MyFormInput from "./MyFormInput";

export default function MyDatePicker(
  props: FormComponentProp & {
    dateFormat?: string;
    pickerProps?: Omit<
      ReactDatePickerProps,
      | "onChange"
      | "placeholderText"
      | "selected"
      | "wrapperClassName"
      | "customInput"
      | "dateFormat"
    >;
  }
) {
  const DateCustomInput = forwardRef((props: any, ref) => {
    return <Form.Control {...props} ref={ref} />;
  });
  return (
    <MyFormInput
      {...props}
      altRender={({ field: { onChange, value } }) => (
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
  );
}
