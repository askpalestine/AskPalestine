import React, {FunctionComponent } from "react";
import {Props} from './IconButton.interface'
import styles from './IconButton.module.css'
import Image from "next/image";
import clsx from "clsx";

const IconButton: FunctionComponent<Props> = (props: Props) => {

    const {children, className, style, onClick} = props;

    return (
        <button onClick={onClick} className={clsx(styles.iconButton, className)} style={style}>{children}</button>
    );
};

export default IconButton;