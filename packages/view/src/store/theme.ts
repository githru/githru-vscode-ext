import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "githru",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme", // localStorage key
    }
  )
);
