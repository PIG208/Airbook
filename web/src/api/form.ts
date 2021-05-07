import { ElementType } from "react";
import { Control, FieldError } from "react-hook-form";

export interface FormComponentProp {
  control: Control;
  name: string;
  displayName: string;
  placeholder: string;
  required: boolean;
  error?: FieldError;
  errorMessage?: string;
  disabled?: boolean;
  as?: ElementType;
}
