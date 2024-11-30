import React, {FunctionComponent } from "react";
import { Props } from "./ActionButton.interface";
import clsx from "clsx";
import { TYPES_CLASSNAMES } from "./constants";

const ActionButton: FunctionComponent<Props> = ({children, className, style, type, disabled=false, onClick}) => {
    return (
        <button onClick={onClick} style={style} className={clsx(TYPES_CLASSNAMES[type], className)}>{children}</button>
    );
};

export default ActionButton;