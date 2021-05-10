import { ResponseProp } from "./api";

export type WithChildren<Type = {}> = Type & { children?: React.ReactNode };
export type IFormProps<T> = { onSubmit: (data: T) => void };
export const parseISODate = (value: string) =>
  new Date(value).toLocaleDateString();
export const parseISOTime = (value: string) =>
  new Date(`2020-02-02T${value.padStart(8, "0")}Z`).toLocaleTimeString(); //handle special cases like 1:00:00
export const handleError = (err: any) => {
  console.log(err);
  return {
    result: "error",
    message: "Network error occurred while fetching data.",
  };
};
export const handleThen = (res: any): ResponseProp => {
  const data = res.data;
  if (data.result === "error" || data.result === undefined) {
    return {
      result: "error",
      message: data.message ?? "Some errors occurred from the serverside.",
    };
  } else {
    return data;
  }
};
