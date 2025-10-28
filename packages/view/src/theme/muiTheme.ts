import { createTheme } from "@mui/material/styles";

import type { ThemeName } from "./theme.type";
import { BACKGROUND_COLORS, COMMON_COLORS, GREY_COLORS, SYSTEM_COLORS, THEME_CONFIG } from "./theme.const";
import { muiChip, muiIconButton, muiSelect, muiTooltip } from "./components";

export const createMuiTheme = (themeName: ThemeName) => {
  const themeColors = THEME_CONFIG[themeName].colors;

  return createTheme({
    cssVariables: true,
    palette: {
      ...themeColors,
      ...SYSTEM_COLORS,
      grey: GREY_COLORS,
      background: BACKGROUND_COLORS,
      common: COMMON_COLORS,
    },
    components: {
      MuiIconButton: muiIconButton,
      MuiSelect: muiSelect,
      MuiTooltip: muiTooltip,
      MuiChip: muiChip,
    },
  });
};
