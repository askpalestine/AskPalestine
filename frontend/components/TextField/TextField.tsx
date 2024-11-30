import React, { FunctionComponent, useEffect, useState } from "react";
import InputBase from "@mui/material/InputBase";
import { Props } from "./TextField.interface";
import styles from "./TextField.module.css";
import clsx from "clsx"

const TextField: FunctionComponent<Props & { maxLength?: number }> = (props) => {
  const { className, inputRef, height, width, placeholder, multiline, onChange, maxLength, children, value } = props;

  const [inputLength, setInputLength] = useState(0);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputLength(event.target.value.length);
    onChange && onChange();
  }

  useEffect(() => {
    setInputLength(value.length);
  }, [value])
  return (
    <div className={clsx(styles.container, className)} style={{ height: height, width: width }}>
      <InputBase
        placeholder={placeholder}
        inputRef={inputRef}
        classes={{
          root: styles.inputRoot,
          input: styles.inputInput
        }}
        value={value}
        className={styles.inputRoot}
        multiline={multiline ? multiline : false}
        onChange={handleInputChange}
        fullWidth
      />
      {maxLength && (
        <div className={inputLength > maxLength ? styles.notAllowedInput : styles.allowedInput}>
          {inputLength}/{maxLength}
          <p style={{ width: "100%" }}></p>{inputLength < maxLength ? children : <p></p>}
        </div>
      )}
    </div>
  );
};

TextField.displayName = "TextField";

export default TextField;
