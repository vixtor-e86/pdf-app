import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { palette, Palette } from "./tokens";

type ThemeCtx = { theme: Palette; isDark: boolean; toggleDark: () => void };
const Ctx = createContext<ThemeCtx | null>(null);
const STORAGE_KEY = "app_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  // Restore persisted preference once
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => v && setIsDark(v === "dark"));
  }, []);

  const value = useMemo<ThemeCtx>(
    () => ({
      theme: isDark ? palette.dark : palette.light,
      isDark,
      toggleDark: () => {
        setIsDark((d) => {
          AsyncStorage.setItem(STORAGE_KEY, d ? "light" : "dark");
          return !d;
        });
      },
    }),
    [isDark]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
