import { useEffect, useRef, useState } from "react";
import "./ThemeSelector.scss";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";

import { setCustomTheme } from "services";

type ThemeInfo = {
  title: string;
  value: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
};

type ThemeIconsProps = ThemeInfo & {
  onClick: () => void;
};

const themeInfo: ThemeInfo[] = [
  {
    title: "Githru",
    value: "githru",
    colors: {
      primary: "#e06091",
      secondary: "#8840bb",
      tertiary: "#ffd08a",
    },
  },
  {
    title: "Hacker Blue",
    value: "hacker-blue",
    colors: {
      primary: "#456cf7",
      secondary: "#3f4c73",
      tertiary: "#6c60f0",
    },
  },
  {
    title: "Aqua",
    value: "aqua",
    colors: {
      primary: "#51decd",
      secondary: "#0687a3",
      tertiary: "#a7ffff",
    },
  },
  {
    title: "Cotton Candy",
    value: "cotton-candy",
    colors: {
      primary: "#ffcccb",
      secondary: "#feffd1",
      tertiary: "#a39aeb",
    },
  },

  {
    title: "Mono",
    value: "mono",
    colors: {
      primary: "#68788f",
      secondary: "#3a4776",
      tertiary: "#9aaed1",
    },
  },
];

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
            {themeInfo.map((theme) => (
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
