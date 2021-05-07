import { Form } from "react-bootstrap";
import { FormComponentProp } from "../api/form";
import MyFormInput from "./MyFormInput";

export default function FormSelect(
  props: FormComponentProp & { options: { value: string; display: string }[] }
) {
  return (
    <MyFormInput
      {...props}
      altRender={({ field: { onChange, value } }) => (
        <Form.Control
          onChange={onChange}
          value={value}
          as="select"
          isInvalid={props.error !== undefined}
        >
          {props.options.map((option, index) => {
            return (
              <option value={option.value} key={index}>
                {option.display}
              </option>
            );
          })}
        </Form.Control>
      )}
    />
  );
}
