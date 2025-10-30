import type {
  ColorPartial,
  CommonColors as MuiCommonColors,
  PaletteColorOptions,
  TypeBackground,
} from "@mui/material/styles/createPalette";

export type ThemeName = "githru" | "hacker-blue" | "aqua" | "cotton-candy" | "mono";

export interface ThemeColors {
  primary: PaletteColorOptions;
  secondary: PaletteColorOptions;
}

export interface SystemColors {
  error: PaletteColorOptions;
  success: PaletteColorOptions;
}

export type GreyColors = ColorPartial;
export type BackgroundColors = Partial<TypeBackground>;
export type CommonColors = Partial<MuiCommonColors>;

export type ThemeConfig = Record<ThemeName, { colors: ThemeColors }>;
