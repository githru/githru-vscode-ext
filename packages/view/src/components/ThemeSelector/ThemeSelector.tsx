import { useEffect, useRef, useState } from "react";
import "./ThemeSelector.scss";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";

import { setCustomTheme } from "services";

import { THEME_INFO } from "./ThemeSelector.const";
import type { ThemeInfo } from "./ThemeSelector.type";

type ThemeIconsProps = ThemeInfo[keyof ThemeInfo] & {
  onClick: () => void;
};

const ThemeIcons = ({ title, value, colors, onClick }: ThemeIconsProps) => {
  const [selectedItem, setSelectedItem] = useState<string>("");

  useEffect(() => {
    const selectedTheme = document.documentElement.getAttribute("custom-type");
    if (selectedTheme) setSelectedItem(selectedTheme);
  }, []);

  return (
    <div
      className={`theme-icon${selectedItem === value ? "--selected" : ""}`}
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
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const themeSelectorRef = useRef<HTMLDivElement>(null);

  const handleTheme = (value: string) => {
    setCustomTheme(value);
    window.theme = value;
    document.documentElement.setAttribute("custom-type", value);
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
    document.documentElement.setAttribute("custom-type", window.theme);
  }, []);

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
            {Object.entries(THEME_INFO).map(([_, theme]) => (
              <ThemeIcons
                key={theme.value}
                {...theme}
                onClick={() => {
                  handleTheme(theme.value);
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
