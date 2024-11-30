import React, {FunctionComponent } from "react";
import { Props } from "./TableActions.interface";
import styles from './TableActions.module.css'

const TableActions: FunctionComponent<Props> = (props: Props) => {

    const {
        children
    } = props;

    return (
        <div className={styles.container}>{children}</div>
    );
};

export default TableActions;