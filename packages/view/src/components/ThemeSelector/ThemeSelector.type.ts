export type ThemeInfo = {
  [key in "githru" | "hacker-blue" | "aqua" | "cotton-candy" | "mono"]: {
    title: string;
    value: key;
    colors: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
  };
};
