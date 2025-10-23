import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ThemeName } from "theme";

interface ThemeState {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "githru",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme",
    }
  )
);
