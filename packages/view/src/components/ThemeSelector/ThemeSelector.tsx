// 1. 코드리뷰 (변수명, 로직 등) - 특히 theme colors를 가져오는 방식
// 2. localStorage에 저장 못 하는 이슈.
// 3. 컬러 배치를 어떻게 해야 할지 ? (primary, secondary의 영역)

import { useEffect, useState } from "react";
import "./ThemeSelector.scss";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";

const themes = [
  {
    title: "Githru",
    value: "githru",
    colors: {
      primary: "#f14f8c",
      secondary: "#8421c9",
      tertiary: "#ffcb7d",
    },
  },
  {
    title: "Hacker Blue",
    value: "hacker-blue",
    colors: {
      primary: "#456cf7",
      secondary: "#0c216f",
      tertiary: "#6c60f0",
    },
  },
  {
    title: "Aqua",
    value: "aqua",
    colors: {
      primary: "#25d4bf",
      secondary: "#0687a3",
      tertiary: "#35ffff",
    },
  },
  {
    title: "Cotton Candy",
    value: "cotton-candy",
    colors: {
      primary: "#ffcccb",
      secondary: "#feffd1",
      tertiary: "#8979ca",
    },
  },

  {
    title: "Mono",
    value: "mono",
    colors: {
      primary: "#5f6f86",
      secondary: "#3a4776",
      tertiary: "#9499c3",
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
