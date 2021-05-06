import { Col, Form } from "react-bootstrap";
import { Control } from "react-hook-form";
import MyDatePicker from "./MyDatePicker";

export default function RangePicker(props: {
  control: Control;
  lowerDisplay: string;
  upperDisplay: string;
  lowerName: string;
  upperName: string;
  lowerPlaceholder?: string;
  upperPlaceholder?: string;
}) {
  return (
    <Form.Row>
      <MyDatePicker
        control={props.control}
        displayName={props.lowerDisplay}
        name={props.lowerName}
        placeholder={props.lowerPlaceholder ?? "(Optional)"}
        as={Col}
        pickerProps={{ showTimeSelect: true }}
      />
      <MyDatePicker
        control={props.control}
        displayName={props.upperDisplay}
        name={props.upperName}
        placeholder={props.upperPlaceholder ?? "(Optional)"}
        as={Col}
        pickerProps={{ showTimeSelect: true }}
      />
    </Form.Row>
  );
}
