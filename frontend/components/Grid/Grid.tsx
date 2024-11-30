import React, { FunctionComponent } from "react";
import { Props } from "./Grid.interface";
import styles from "./Grid.module.css";
import clsx from "clsx";

const Grid: FunctionComponent<Props> = (props: Props) => {
  const { children, className } = props;

  return <div className={clsx(styles.container, className)}>{children}</div>;
};

export default Grid;
