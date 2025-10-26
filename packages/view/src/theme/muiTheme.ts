import { createTheme } from "@mui/material/styles";

import type { ThemeName } from "./theme.type";
import { BACKGROUND_COLORS, COMMON_COLORS, GREY_COLORS, SYSTEM_COLORS, THEME_CONFIG } from "./theme.const";

export const createMuiTheme = (theme: ThemeName) => {
  const themeColors = THEME_CONFIG[theme].colors;

  return createTheme({
    cssVariables: true,
    palette: {
      ...themeColors,
      ...SYSTEM_COLORS,
      grey: GREY_COLORS,
      background: BACKGROUND_COLORS,
      common: COMMON_COLORS,
    },
  });
};
