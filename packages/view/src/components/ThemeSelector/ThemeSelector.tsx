import "./ThemeSelector.scss";
import { container } from "tsyringe";
import { useCallback, useEffect, useState } from "react";

import { debounce } from "utils";
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

  const storeColorHandler = debounce((colorCode: string) => {
    const ideAdapter = container.resolve<IDEPort>("IDEAdapter");
    ideAdapter.setPrimaryColor(colorCode);
  }, 3000);

  const handlePrimaryColor = useCallback(
    (colorCode: string) => storeColorHandler(colorCode),
    []
  );

  return (
    <div className="theme-selector">
      <input
        type="color"
        value={color}
        onChange={(e) => {
          setColor(e.target.value);
          handlePrimaryColor(e.target.value as string);
          document.documentElement.style.setProperty(
            PRIMARY_COLOR_VARIABLE_NAME,
            e.target.value
          );
        }}
      />
    </div>
  );
};

export default ThemeSelector;
