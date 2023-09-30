import { useCallback, useEffect, useState } from "react";
import classNames from "classnames/bind";

import { debounce } from "utils";
import { setPrimaryColor } from "services";

import { PRIMARY_COLOR_VARIABLE_NAME } from "../../constants/constants";

import styles from "./ThemeSelector.module.scss";

const ThemeSelector = () => {
  const cx = classNames.bind(styles);
  const [color, setColor] = useState<string>(window.primaryColor);

  useEffect(() => {
    document.documentElement.style.setProperty(PRIMARY_COLOR_VARIABLE_NAME, window.primaryColor);
  }, []);

  const storeColorHandler = debounce((colorCode: string) => {
    setPrimaryColor(colorCode);
  }, 3000);

  const handlePrimaryColor = useCallback(
    (colorCode: string) => storeColorHandler(colorCode),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div className={cx("theme-selector")}>
      <input
        type="color"
        value={color}
        onChange={(e) => {
          setColor(e.target.value);
          handlePrimaryColor(e.target.value as string);
          document.documentElement.style.setProperty(PRIMARY_COLOR_VARIABLE_NAME, e.target.value);
        }}
      />
    </div>
  );
};

export default ThemeSelector;
