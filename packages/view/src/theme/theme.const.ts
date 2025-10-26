import type { BackgroundColors, CommonColors, GreyColors, SystemColors, ThemeConfig } from "./theme.type";

export const THEME_CONFIG: ThemeConfig = {
  githru: {
    colors: {
      primary: {
        main: "#E06091",
        light: "#FF91B8",
        dark: "#813A54",
      },
      secondary: {
        main: "#FFD08A",
        light: "#FFE2A2",
        dark: "#FFC458",
      },
    },
  },
  "hacker-blue": {
    colors: {
      primary: {
        main: "#456CF7",
        light: "#93AAFA",
        dark: "#304CAD",
      },
      secondary: {
        main: "#6C60F0",
        light: "#AAA3F6",
        dark: "#615BCB",
      },
    },
  },
  aqua: {
    colors: {
      primary: {
        main: "#51DECD",
        light: "#9AECE2",
        dark: "#399B90",
      },
      secondary: {
        main: "#0687A3",
        light: "#6FB9CA",
        dark: "#045F72",
      },
    },
  },
  "cotton-candy": {
    colors: {
      primary: {
        main: "#FFCCCB",
        light: "#FFE1E1",
        dark: "#B38F8E",
      },
      secondary: {
        main: "#A39AEB",
        light: "#CAC4F3",
        dark: "#726CA5",
      },
    },
  },
  mono: {
    colors: {
      primary: {
        main: "#68788F",
        light: "#A7B1BE",
        dark: "#495464",
      },
      secondary: {
        main: "#566AB6",
        light: "#9DA9D5",
        dark: "#3C4A7F",
      },
    },
  },
};

export const SYSTEM_COLORS: SystemColors = {
  error: {
    main: "#FF6371",
  },
  success: {
    main: "#1EC198",
  },
};

export const GREY_COLORS: GreyColors = {
  50: "#151A22",
  100: "#1C232F",
  200: "#222A37",
  300: "#313A48",
  400: "#3F4856",
  500: "#586170",
  600: "#AAB4C5",
  700: "#E9EEF6",
};

export const BACKGROUND_COLORS: BackgroundColors = {
  default: "#10131A",
};

export const COMMON_COLORS: CommonColors = {
  white: "#f7f7f7",
  black: "#0B0E13",
};
