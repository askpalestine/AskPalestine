import { Dispatch, ReactChildren, ReactNode } from "react";
export interface Props {
  children: ReactChildren | ReactNode
  className?: string;
  style?: React.CSSProperties;
  type?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}