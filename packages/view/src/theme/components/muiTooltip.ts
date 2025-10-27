import type { Theme } from "@mui/material/styles";
import type { BaseTheme } from "@mui/material/styles/createThemeNoVars";

export const muiTooltip: NonNullable<BaseTheme["components"]>["MuiTooltip"] = {
  styleOverrides: {
    tooltip: ({ theme }: { theme: Theme }) => ({
      backgroundColor: theme.palette.grey[300],
    }),
    arrow: ({ theme }: { theme: Theme }) => ({
      color: theme.palette.grey[300],
    }),
  },

  defaultProps: {
    arrow: true,
    placement: "top",
  },
};
