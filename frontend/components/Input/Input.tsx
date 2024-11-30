import React, { FunctionComponent, useState, useEffect } from "react";
import { Props, InputType } from "./Input.interface";

import styles from './Input.module.css';

const Input: FunctionComponent<Props> = ({ name, value, type = InputType.TEXT, onChange, onChangeTextArea }) => {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      alert("File is too large. Maximum size is 2MB.");
      return;
    }
    setFileName(e.target.files[0] ? e.target.files[0].name : '');
    if (onChange) {
      onChange(e);
    }
  };
  return <div className={styles.inputWrapper}>
    {type === InputType.PHOTO ? (
      <div className={styles.photoInputContainer} >
        <p style={{ paddingBottom: '1vh' }} >
          {"Choose Profile Picture"}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: 'auto' }}>
          <input
            id="file-upload"
            type="file"
            accept=".png"
            onChange={handleFileChange}
            className={styles.photoInputField}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload" className={styles.customFileUpload}>
            {fileName || "Choose a file"}
          </label>
        </div>
      </div>
    ) : type != InputType.TEXT_MULTI_LINE ? <input
      type={type}
      value={value}
      onChange={onChange}
      className={styles.inputField}
      placeholder={name}
    /> : <textarea
      value={value}
      onChange={onChangeTextArea}
      className={`${styles.inputField} ${styles.textarea}`}
      placeholder={name}
    />
    }
  </div>;
};

export default Input;