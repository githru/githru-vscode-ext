import { useEffect, useState } from "react";
import "./ThemeSelector.scss";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";

const themes = [
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

type ThemeIconsProps = {
  title: string;
  value: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  onClick: () => void;
};

const ThemeIcons = ({ title, value, colors, onClick }: ThemeIconsProps) => {
  const [isSelected, setIsSelected] = useState<string>("");

  useEffect(() => {
    const selectedTheme = document.documentElement.getAttribute("custom-type");
    if (selectedTheme) setIsSelected(selectedTheme);
  }, []);

  return (
    <div
      className={`theme-icon${isSelected === value ? "--selected" : ""}`}
      onClick={onClick}
      role="presentation"
    >
      <div className="icon__container">
        <div
          className="icon"
          style={{ backgroundColor: colors.primary }}
        />
        <div
          className="icon"
          style={{ backgroundColor: colors.secondary }}
        />
        <div
          className="icon"
          style={{ backgroundColor: colors.tertiary }}
        />
      </div>
      <p>{title}</p>
    </div>
  );
};

const ThemeSelector = () => {
  const [open, setOpen] = useState<boolean>(false);

  const handleTheme = (value: string) => {
    document.documentElement.setAttribute("custom-type", value);
  };

  useEffect(() => {
    document.documentElement.setAttribute("custom-type", "githru");
  }, []);

  return (
    <div className="theme-selector">
      <AutoAwesomeIcon onClick={() => setOpen(true)} />
      {open && (
        <div className="selector__container">
          <div>
            <p>Theme</p>
            <CloseIcon
              fontSize="small"
              onClick={() => setOpen(false)}
            />
          </div>
          <div>
            {themes.map((theme) => (
              <ThemeIcons
                key={theme.value}
                title={theme.title}
                value={theme.value}
                colors={theme.colors}
                onClick={() => {
                  handleTheme(theme.value);
                  setOpen(false);
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
