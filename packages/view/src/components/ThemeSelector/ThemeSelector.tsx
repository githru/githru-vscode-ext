import "./ThemeSelector.scss";
import { container } from "tsyringe";
import type { ChangeEvent } from "react";
import { useState } from "react";

import { throttle } from "utils";
import type IDEPort from "ide/IDEPort";

import { PRIMARY_COLOR_VARIABLE_NAME } from "../../constants/constants";

const ThemeSelector = () => {
  const [color, setColor] = useState("#ff8272");
  const refreshHandler = throttle(() => {
    const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
    ideAdapter.setPrimaryColor(color);
  }, 3000);

  const handleGraphColor = (e: ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
    refreshHandler();
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
