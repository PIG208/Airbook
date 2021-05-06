export type WithChildren<Type = {}> = Type & { children?: React.ReactNode };
export type IFormProps<T> = { onSubmit: (data: T) => void };
export const parseISODate = (value: string) =>
  new Date(value).toLocaleDateString();
export const parseISOTime = (value: string) =>
  new Date(`2020-02-02T${value}Z`).toLocaleTimeString();
export const handleError = (err: any) => {
  console.log(err);
  return {
    result: "error",
    message: "Network error occurred while fetching data.",
  };
};
