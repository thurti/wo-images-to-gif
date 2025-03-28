export type UIInputItem<T = any> = {
  id: string;
  label: string;
  value: T;
  disabled?: boolean;
  isInput?: boolean;
  isRemovable?: boolean;
  type?: "number" | "text" | "color" | "date";
};
