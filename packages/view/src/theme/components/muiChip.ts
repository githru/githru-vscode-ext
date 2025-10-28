import type { Theme } from "@mui/material/styles";
import type { BaseTheme } from "@mui/material/styles/createThemeNoVars";

export const muiChip: NonNullable<BaseTheme["components"]>["MuiChip"] = {
  styleOverrides: {
    root: ({ theme }: { theme: Theme }) => ({
      justifyContent: "space-between",
      backgroundColor: theme.palette.grey[300],
      color: theme.palette.grey[700],
    }),

    deleteIcon: ({ theme }: { theme: Theme }) => ({
      color: theme.palette.grey[600],
      fontSize: "1.25rem",

      "&:hover": {
        color: theme.palette.grey[700],
      },
    }),
  },
};
