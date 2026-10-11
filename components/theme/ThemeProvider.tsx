"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { DEFAULT_THEME_ID, getThemeConfig, ThemeConfig, THEMES } from "./theme-config";

interface ThemeContextType {
  theme: string;
  themeConfig: ThemeConfig;
  setTheme: (themeId: string) => void;
  previewTheme: (themeId: string) => void;
  cancelPreview: () => void;
  isAutoSystem: boolean;
  toggleAutoSystem: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DEFAULT_THEME_ID,
  themeConfig: THEMES[0],
  setTheme: () => {},
  previewTheme: () => {},
  cancelPreview: () => {},
  isAutoSystem: false,
  toggleAutoSystem: () => {},
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>(DEFAULT_THEME_ID);
  const [isAutoSystem, setIsAutoSystem] = useState<boolean>(false);
  const [previewingTheme, setPreviewingTheme] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger smooth cross-fade animation when switching themes
  const triggerTransition = () => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.add("theme-transitioning");
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    transitionTimeoutRef.current = setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 280);
  };

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

  // Resolve active theme based on Auto OS mode or user preference
  const resolveSystemTheme = (isDark: boolean) => {
    // When OS is dark, choose default Dark Emerald, otherwise Classic Teal
    return isDark ? "dark-emerald" : "classic-teal";
  };

  useEffect(() => {
    // 1. Read saved theme & auto mode from localStorage
    const savedAuto = localStorage.getItem("app_theme_mode") === "system";
    const savedTheme = localStorage.getItem("app_theme");

    setIsAutoSystem(savedAuto);

    let active = DEFAULT_THEME_ID;
    if (savedAuto) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      active = resolveSystemTheme(prefersDark);
    } else if (savedTheme && THEMES.some((t) => t.id === savedTheme)) {
      active = savedTheme;
    }

    setThemeState(active);
    applyThemeToDOM(active);
    setMounted(true);

    // 2. Listen to OS System Theme changes if Auto Mode is ON
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleOSChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem("app_theme_mode") === "system") {
        triggerTransition();
        const sysTheme = resolveSystemTheme(e.matches);
        setThemeState(sysTheme);
        applyThemeToDOM(sysTheme);
      }
    };
    mediaQuery.addEventListener("change", handleOSChange);

    // 3. Cross-tab theme sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "app_theme" && e.newValue && THEMES.some((t) => t.id === e.newValue)) {
        triggerTransition();
        setThemeState(e.newValue);
        applyThemeToDOM(e.newValue);
      }
      if (e.key === "app_theme_mode") {
        setIsAutoSystem(e.newValue === "system");
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      mediaQuery.removeEventListener("change", handleOSChange);
      window.removeEventListener("storage", handleStorage);
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const setTheme = (themeId: string) => {
    if (!THEMES.some((t) => t.id === themeId)) return;
    triggerTransition();
    setThemeState(themeId);
    setPreviewingTheme(null);
    setIsAutoSystem(false);
    applyThemeToDOM(themeId);

    try {
      localStorage.setItem("app_theme", themeId);
      localStorage.setItem("app_theme_mode", "manual");
      // Cookie for SSR zero-flash hydration
      document.cookie = `app_theme=${themeId}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.warn("Could not save theme preference", e);
    }
  };

  const toggleAutoSystem = () => {
    triggerTransition();
    const nextAuto = !isAutoSystem;
    setIsAutoSystem(nextAuto);

    if (nextAuto) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const sysTheme = resolveSystemTheme(prefersDark);
      setThemeState(sysTheme);
      applyThemeToDOM(sysTheme);
      try {
        localStorage.setItem("app_theme_mode", "system");
        document.cookie = `app_theme=${sysTheme}; path=/; max-age=31536000; SameSite=Lax`;
      } catch (e) {}
    } else {
      try {
        localStorage.setItem("app_theme_mode", "manual");
      } catch (e) {}
    }
  };

  // Live hover preview in selector
  const previewTheme = (themeId: string) => {
    if (!THEMES.some((t) => t.id === themeId)) return;
    setPreviewingTheme(themeId);
    applyThemeToDOM(themeId);
  };

  const cancelPreview = () => {
    if (previewingTheme) {
      setPreviewingTheme(null);
      applyThemeToDOM(theme);
    }
  };

  const activeThemeId = previewingTheme || theme;
  const themeConfig = getThemeConfig(activeThemeId);

  return (
    <ThemeContext.Provider
      value={{
        theme: activeThemeId,
        themeConfig,
        setTheme,
        previewTheme,
        cancelPreview,
        isAutoSystem,
        toggleAutoSystem,
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
