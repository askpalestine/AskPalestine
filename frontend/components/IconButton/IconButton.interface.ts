import React, { DOMAttributes, FunctionComponent, SVGProps } from "react";

export interface Props extends DOMAttributes<HTMLButtonElement> {
    children: React.ReactChild | React.ReactChildren,
    alt: string
    style?: React.CSSProperties
    className?: string
}