import React, { FunctionComponent, forwardRef } from "react";
import { Props } from "./Card.interface";
import styles from "./Card.module.css";
import clsx from "clsx";

const Card: FunctionComponent<Props> = (props) => {
  const { children, className, height, width, style } = props;

  return (
    <div
      style={{...{ height: height, width: width}, ...style}}
      className={clsx(styles.container, className)}
    >
      {children}
    </div>
  );
};

Card.displayName = "Card";

export default Card;
