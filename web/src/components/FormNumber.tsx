import { Validate } from "react-hook-form";
import { FormComponentProp } from "../api/form";
import MyFormInput from "./MyFormInput";

export default function FormNumber(props: FormComponentProp) {
  return (
    <MyFormInput
      {...props}
      validate={{
        ...props.validate,
        numeric: (v) => {
          return (
            (props.disabled ?? false) ||
            v === "" ||
            (!isNaN(v) && Number(v) > 0) ||
            (props.errorMessage ?? "The field is invalid")
          );
        },
      }}
    />
  );
}
