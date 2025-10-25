import type { Theme } from "@mui/material/styles";

export const muiIconButton = {
  styleOverrides: {
    root: ({ theme }: { theme: Theme }) => ({
      color: theme.palette.common.white,
      "&:hover": {
        color: theme.palette.grey[700],
      },
    }),
  },
};
