import { Ref } from "react";
import { ReactElement } from "react";

export interface Props {
  className?: string;
  height?: string | number | string & {};
  width?: string | number | string & {};
  inputRef: Ref<any>
  sendSearch: CallableFunction
  children?: ReactElement;
}