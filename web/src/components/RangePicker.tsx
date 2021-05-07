import { Col, Form } from "react-bootstrap";
import { Control, FieldError } from "react-hook-form";
import MyDatePicker from "./MyDatePicker";

export default function RangePicker(props: {
  control: Control;
  lowerDisplay: string;
  upperDisplay: string;
  lowerName: string;
  upperName: string;
  lowerError?: FieldError;
  upperError?: FieldError;
  lowerPlaceholder?: string;
  upperPlaceholder?: string;
  required?: boolean;
}) {
  return (
    <Form.Row>
      <MyDatePicker
        control={props.control}
        displayName={props.lowerDisplay}
        name={props.lowerName}
        placeholder={props.lowerPlaceholder ?? "(Optional)"}
        as={Col}
        error={props.lowerError}
        errorMessage="The lower bound is invalid!"
        required={props.required ?? false}
        pickerProps={{ showTimeSelect: true }}
      />
      <MyDatePicker
        control={props.control}
        displayName={props.upperDisplay}
        name={props.upperName}
        placeholder={props.upperPlaceholder ?? "(Optional)"}
        as={Col}
        error={props.upperError}
        errorMessage="The upper bound is invalid!"
        required={props.required ?? false}
        pickerProps={{ showTimeSelect: true }}
      />
    </Form.Row>
  );
}
