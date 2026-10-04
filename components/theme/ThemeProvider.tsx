"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME_ID, getThemeConfig, ThemeConfig, THEMES } from "./theme-config";

interface ThemeContextType {
  theme: string;
  themeConfig: ThemeConfig;
  setTheme: (themeId: string) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME_ID,
  themeConfig: THEMES[0],
  setTheme: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>(DEFAULT_THEME_ID);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Read saved theme from localStorage
    const saved = localStorage.getItem("app_theme");
    const initialTheme = saved && THEMES.some((t) => t.id === saved) ? saved : DEFAULT_THEME_ID;
    setThemeState(initialTheme);
    applyThemeToDOM(initialTheme);
    setMounted(true);

    // Cross-tab theme sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "app_theme" && e.newValue && THEMES.some((t) => t.id === e.newValue)) {
        setThemeState(e.newValue);
        applyThemeToDOM(e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const applyThemeToDOM = (themeId: string) => {
    const config = getThemeConfig(themeId);
    const root = document.documentElement;

    root.setAttribute("data-theme", themeId);
    root.setAttribute("data-is-dark", config.isDark ? "true" : "false");

    if (config.isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Dynamic mobile status bar adaptation
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        config.isDark
          ? themeId === "carbon-titanium"
            ? "#09090B"
            : "#111827"
          : config.primaryColor
      );
    }
  };

  const setTheme = (themeId: string) => {
    if (!THEMES.some((t) => t.id === themeId)) return;
    setThemeState(themeId);
    applyThemeToDOM(themeId);
    try {
      localStorage.setItem("app_theme", themeId);
    } catch (e) {
      console.warn("Could not save theme preference to localStorage", e);
    }
  };

  const themeConfig = getThemeConfig(theme);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeConfig,
        setTheme,
        isDark: themeConfig.isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
