import React, { FunctionComponent, forwardRef } from "react";
import { Props } from "./Table.interface";
import styles from "./Table.module.css";
import clsx from "clsx";

const Table: FunctionComponent<Props> = (props) => {
  const { children, className, height, width } = props;

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
    <table
      style={{ height: height, width: width }}
      className={clsx(styles.table, className)}
    >
      {children}
    </table>
    </div>
    </div>
  );
};

export default Table;
