import "./ThemeSelector.scss";
import { container } from "tsyringe";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";

import { throttle } from "utils";
import type IDEPort from "ide/IDEPort";

import { PRIMARY_COLOR_VARIABLE_NAME } from "../../constants/constants";

const ThemeSelector = () => {
  const [color, setColor] = useState<string>(window.primaryColor);

  useEffect(() => {
    document.documentElement.style.setProperty(
      PRIMARY_COLOR_VARIABLE_NAME,
      window.primaryColor
    );
  }, []);

  const storeColorHandler = throttle(() => {
    const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
    ideAdapter.setPrimaryColor(color);
  }, 3000);

  const handlePrimaryColor = (e: ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
    storeColorHandler();
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
          handlePrimaryColor(e);
        }}
      />
    </div>
  );
};

export default ThemeSelector;
