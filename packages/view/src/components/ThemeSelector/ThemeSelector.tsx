import { useEffect, useRef, useState } from "react";
import "./ThemeSelector.scss";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

import { sendUpdateThemeCommand } from "services";
import { useThemeStore } from "store";
import type { ThemeColors, ThemeList, ThemeName } from "theme";
import { THEME_CONFIG } from "theme";

type ThemeIconsProps = {
  title: ThemeName;
  colors: ThemeColors;
  theme: ThemeName;
  onClick: () => void;
};

const ThemeIcons = ({ title, colors, theme, onClick }: ThemeIconsProps) => {
  const formatThemeName = (name: string) => name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div
      className={`theme-icon${theme === title ? "--selected" : ""}`}
      onClick={onClick}
      role="presentation"
    >
      <div className="theme-icon__container">
        <div
          className="theme-icon__color"
          style={{ backgroundColor: colors.primary.main }}
        />
        <div
          className="theme-icon__color"
          style={{ backgroundColor: colors.secondary.main }}
        />
      </div>
      <p className="theme-icon__title">{formatThemeName(title)}</p>
    </div>
  );
};

const ThemeSelector = () => {
  const [isOpen, setIsOpen] = useState(false);

  const themeSelectorRef = useRef<HTMLDivElement>(null);

  const { theme, setTheme } = useThemeStore();

  const handleTheme = (value: ThemeName) => {
    setTheme(value);
    sendUpdateThemeCommand(value);
    setIsOpen(false);
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

  return (
    <div
      className="theme-selector"
      ref={themeSelectorRef}
    >
      <IconButton onClick={() => setIsOpen(true)}>
        <AutoAwesomeIcon />
      </IconButton>
      {isOpen && (
        <div className="theme-selector__container">
          <div className="theme-selector__header">
            <p>Theme</p>
            <IconButton onClick={() => setIsOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
          <div className="theme-selector__list">
            {(Object.entries(THEME_CONFIG) as ThemeList).map(([themeName, themeConfig]) => (
              <ThemeIcons
                key={themeName}
                title={themeName}
                theme={theme}
                colors={themeConfig.colors}
                onClick={() => handleTheme(themeName)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;
