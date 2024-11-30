import { Ref } from "react";
import { Dispatch, ReactChildren, ReactNode } from "react";

export interface Props {
  className?: string;
  height?: string | number | string & {};
  width?: string | number | string & {};
  inputRef: Ref<HTMLInputElement>
  placeholder?: string
  multiline?: boolean
  onSubmit?: () => void;
  children?: ReactChildren | ReactNode
  onChange?: () => void
  value: string
}