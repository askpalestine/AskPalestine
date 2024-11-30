import React, { FunctionComponent, forwardRef } from "react";
import { Props } from "./Loading.interface";
import styles from "./Loading.module.css";
import clsx from "clsx";
import { CircularProgress } from "@mui/material";

const Loading: FunctionComponent<Props> = (props) => {
  const { className } = props;

  return (
    <div
      className={clsx(styles.container, className)}
    >
      <CircularProgress className={styles.circularProgress} />
    </div>
  );
};

Loading.displayName = "Loading";

export default Loading;
