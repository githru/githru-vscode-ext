import type { Theme } from "@mui/material/styles";
import type { BaseTheme } from "@mui/material/styles/createThemeNoVars";

export const muiSelect: NonNullable<BaseTheme["components"]>["MuiSelect"] = {
  styleOverrides: {
    root: ({ theme }: { theme: Theme }) => ({
      height: "1.875rem",
      minWidth: 110,
      borderRadius: "9999px",
      border: `1px solid ${theme.palette.grey[300]}`,
      backgroundColor: theme.palette.grey[200],
      color: theme.palette.common.white,
      fontSize: "0.875rem",
      textAlign: "left",

      "&:hover": {
        backgroundColor: theme.palette.grey[300],
      },

      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        border: "none",
      },
    }),

    icon: ({ theme }: { theme: Theme }) => ({
      right: "0.5rem",
      color: theme.palette.common.white,
    }),
  },

  defaultProps: {
    MenuProps: {
      PaperProps: {
        sx: (theme: Theme) => ({
          "&.MuiPaper-root": {
            marginTop: "0.5rem",
            border: `1px solid ${theme.palette.grey[300]}`,
            borderRadius: "4px",
            backgroundColor: theme.palette.grey[100],
            color: theme.palette.common.white,
          },
          "& .MuiList-root": {
            padding: 0,
          },
          "& .MuiMenuItem-root": {
            paddingLeft: "14px",
            fontSize: "0.875rem",

            "&:hover": {
              backgroundColor: theme.palette.grey[300],
            },
          },
          "& .Mui-selected": {
            backgroundColor: `${theme.palette.grey[300]} !important`,
          },
        }),
      },
    },
  },
};
