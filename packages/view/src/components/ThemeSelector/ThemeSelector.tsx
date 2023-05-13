import type { ChangeEvent } from "react";
import { useState } from "react";

import "./ThemeSelector.scss";
import { PRIMARY_COLOR_VARIABLE_NAME } from "constants/constants";

const ThemeSelector = () => {
  const [color, setColor] = useState("#ff8272");
  const handleGraphColor = (e: ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
    document.documentElement.style.setProperty(
      PRIMARY_COLOR_VARIABLE_NAME,
      e.target.value
    );
  };
  return (
    <div className="theme-selector">
      <input
        type="color"
        value={color}
        onChange={(e) => {
          handleGraphColor(e);
        }}
      />
    </div>
  );
};

export default ThemeSelector;
