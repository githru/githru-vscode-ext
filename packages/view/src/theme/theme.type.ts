import type { PaletteOptions } from "@mui/material/styles/createPalette";

export type ThemeName = "githru" | "hacker-blue" | "aqua" | "cotton-candy" | "mono";

export interface ThemeColors {
  primary: PaletteOptions["primary"];
  secondary: PaletteOptions["secondary"];
}

export interface SystemColors {
  error: PaletteOptions["error"];
  success: PaletteOptions["success"];
}

export type GreyColors = PaletteOptions["grey"];
export type BackgroundColor = PaletteOptions["background"];

export type ThemeConfig = {
  [key in ThemeName]: { colors: ThemeColors };
};
