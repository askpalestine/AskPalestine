import React, { FunctionComponent, forwardRef } from "react";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "../../assets/svgs/search.svg"
import IconButton from "../IconButton/IconButton";
import { Props } from "./Search.interface";
import styles from "./Search.module.css";
import clsx from "clsx"

const Search: FunctionComponent<Props> = (props) => {
  const { className, inputRef, height, width, sendSearch, children } = props;
  const [searchTextLength, setSearchTextLength] = React.useState<number>(0);
  const [exceededTextLengthThreshold, setExceededTextLengthThreshold] = React.useState<boolean>(false);
  return (
    <div className={clsx(styles.container, className)} style={{ height: height, width: width }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', justifyContent: 'center', alignItems: 'center',  alignContent: 'center', width: '100%'}}>
          <div>
            <SearchIcon style={{ fill: "#000000", fontSize: "1.25em" }} />
          </div>

          <div style={{ color: 'black !important', }}>
            <InputBase
              onKeyPress={(e) => {
                if ((e.key) === "Enter") sendSearch()
              }}
              onChange={(e) => {
                if (exceededTextLengthThreshold || e.target.value.length < searchTextLength) {
                  // if the user is deleting, send the search
                  sendSearch()
                } else if (e.target.value.length >= 3) {
                  setExceededTextLengthThreshold(true)
                  sendSearch()
                }
                setSearchTextLength(e.target.value.length)
              }}
              placeholder="Search for a question..."
              inputRef={inputRef}
              classes={{
                root: styles.inputRoot,
                input: styles.inputInput
              }}
              className={styles.inputRoot}
              // size="small"
            />
          </div>
        </div>
        {children}

      </div>
    </div>

  );
};

Search.displayName = "Search";

export default Search;
