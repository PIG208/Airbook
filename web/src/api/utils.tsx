export type WithChildren<Type = {}> = Type & { children?: React.ReactNode };
export type IFormProps<T> = { handleSubmit: (data: T) => void };
