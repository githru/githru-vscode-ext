import type {
  ColorPartial,
  CommonColors as MuiCommonColors,
  SimplePaletteColorOptions,
  TypeBackground,
} from "@mui/material/styles/createPalette";

export type ThemeName = "githru" | "hacker-blue" | "aqua" | "cotton-candy" | "mono";

export interface ThemeColors {
  primary: SimplePaletteColorOptions;
  secondary: SimplePaletteColorOptions;
}

export interface SystemColors {
  error: SimplePaletteColorOptions;
  success: SimplePaletteColorOptions;
}

export type GreyColors = ColorPartial;
export type BackgroundColors = Partial<TypeBackground>;
export type CommonColors = Partial<MuiCommonColors>;

export type ThemeConfig = Record<ThemeName, { colors: ThemeColors }>;
export type ThemeList = [ThemeName, ThemeConfig[ThemeName]][];
