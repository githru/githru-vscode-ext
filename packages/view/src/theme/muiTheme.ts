import { createTheme } from "@mui/material/styles";

import type { ThemeName } from "./theme.type";
import { BACKGROUND_COLOR, GREY_COLORS, SYSTEM_COLORS, THEME_CONFIG } from "./theme.const";

export const createMuiTheme = (theme: ThemeName) => {
  const { colors } = THEME_CONFIG[theme];

  return createTheme({
    cssVariables: true,
    palette: {
      ...colors,
      ...SYSTEM_COLORS,
      grey: GREY_COLORS,
      background: BACKGROUND_COLOR,
    },
  });
};
