export type WithChildren<Type = {}> = Type & { children?: React.ReactNode };
export type IFormProps<T> = { onSubmit: (data: T) => void };
