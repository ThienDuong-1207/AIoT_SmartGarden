"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const THEME_OPTIONS = ["forest", "ocean", "sunset"] as const;
export type Theme = (typeof THEME_OPTIONS)[number];

const LEGACY_THEME_MAP: Record<string, Theme> = {
  dark: "forest",
  light: "forest",
};

const DEFAULT_THEME: Theme = "forest";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}>({ theme: DEFAULT_THEME, setTheme: () => {}, toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  function applyTheme(next: Theme) {
    setThemeState(next);
    localStorage.setItem("sg-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  // Đọc theme từ localStorage sau khi mount (tránh SSR mismatch)
  useEffect(() => {
    const saved = localStorage.getItem("sg-theme");
    const preferred = DEFAULT_THEME;
    const normalized = saved && (THEME_OPTIONS as readonly string[]).includes(saved)
      ? (saved as Theme)
      : LEGACY_THEME_MAP[saved ?? ""];
    const initial = normalized ?? preferred;
    applyTheme(initial);
  }, []);

  function toggle() {
    const currentIndex = THEME_OPTIONS.indexOf(theme);
    const next = THEME_OPTIONS[(currentIndex + 1) % THEME_OPTIONS.length];
    applyTheme(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: applyTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
