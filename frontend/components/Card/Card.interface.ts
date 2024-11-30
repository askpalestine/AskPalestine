export interface Props {
  children: JSX.Element | JSX.Element[];
  className?: string;
  height?: string | number | string & {};
  width?: string | number | string & {};
  style?: React.CSSProperties
}