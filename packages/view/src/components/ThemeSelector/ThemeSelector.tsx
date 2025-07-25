import { useEffect, useRef, useState } from "react";
import "./ThemeSelector.scss";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";

import { sendUpdateThemeCommand } from "services";

import { THEME_INFO } from "./ThemeSelector.const";
import type { ThemeInfo } from "./ThemeSelector.type";
import { useThemeStore } from "store/theme";

type ThemeIconsProps = ThemeInfo[keyof ThemeInfo] & {
  theme: string;
  onClick: () => void;
};

const ThemeIcons = ({ title, value, colors, theme, onClick }: ThemeIconsProps) => {
  return (
    <div
      className={`theme-icon${theme === value ? "--selected" : ""}`}
      onClick={onClick}
      role="presentation"
    >
      <div className="theme-icon__container">
        {Object.values(colors).map((color, index) => (
          <div
            key={Number(index)}
            className="theme-icon__color"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <p className="theme-icon__title">{title}</p>
    </div>
  );
};

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeStore();

  const themeSelectorRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleTheme = (value: string) => {
    setTheme(value);
    sendUpdateThemeCommand(value);
    document.documentElement.setAttribute("theme", value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeSelectorRef.current && !themeSelectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("theme", theme);
  }, [theme]);

  return (
    <div
      className="theme-selector"
      ref={themeSelectorRef}
    >
      <AutoAwesomeIcon onClick={() => setIsOpen(true)} />
      {isOpen && (
        <div className="theme-selector__container">
          <div className="theme-selector__header">
            <p>Theme</p>
            <CloseIcon
              fontSize="small"
              onClick={() => setIsOpen(false)}
            />
          </div>
          <div className="theme-selector__list">
            {Object.entries(THEME_INFO).map(([_, themeInfo]) => (
              <ThemeIcons
                key={themeInfo.value}
                {...themeInfo}
                theme={theme}
                onClick={() => {
                  handleTheme(themeInfo.value);
                  setIsOpen(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
