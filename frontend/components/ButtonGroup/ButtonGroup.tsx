import Link from "next/link";
import React, { FunctionComponent } from "react";
import { Props } from "./ButtonGroup.interface";
import styles from "./ButtonGroup.module.css";


const ButtonGroup: FunctionComponent<Props> = ({ children }) => {
  return (
    <div className={styles.buttonGroupContainer}>
      {children}
    </div>
  );
};

export default ButtonGroup;
