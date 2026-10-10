"use client";

import React, { useState, useRef, useEffect } from "react";
import { Palette, Check, Sparkles, Moon, Sun, Layers, ShieldCheck } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { THEMES, THEME_CATEGORIES, ThemeCategory } from "./theme-config";
import { cn } from "@/lib/utils/cn";

export function ThemeSelector() {
  const { theme, setTheme, themeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ThemeCategory>(themeConfig.category);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync active category tab when current theme changes
  useEffect(() => {
    setActiveCategory(themeConfig.category);
  }, [themeConfig.category]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredThemes = THEMES.filter((t) => t.category === activeCategory);

  const getCategoryIcon = (cat: ThemeCategory) => {
    switch (cat) {
      case "classic":
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case "light":
        return <Sun className="w-3.5 h-3.5" />;
      case "mix":
        return <Sparkles className="w-3.5 h-3.5" />;
      case "dark":
        return <Moon className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="relative inline-block text-left" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Change System Theme"
        aria-label="Change System Theme"
        className={cn(
          "relative flex items-center justify-center p-2 rounded-xl transition-all duration-150 border",
          isOpen
            ? "bg-primary/10 border-primary/30 text-primary shadow-xs"
            : "border-border hover:bg-surface-muted hover:border-slate-300 text-slate-600 hover:text-slate-900"
        )}
      >
        <Palette className="w-4 h-4" />
        {/* Dynamic color pip */}
        <span
          className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-surface shadow-xs"
          style={{
            background: themeConfig.gradient || themeConfig.primaryColor,
          }}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className="fixed inset-x-3 bottom-4 sm:absolute sm:inset-x-auto sm:right-0 sm:bottom-auto sm:mt-2 w-auto sm:w-96 rounded-2xl bg-surface border border-border shadow-2xl p-4 z-[70] animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-primary-foreground shadow-xs"
                style={{
                  background: themeConfig.gradient || themeConfig.primaryColor,
                }}
              >
                <Palette className="w-4 h-4 drop-shadow-xs" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-none">
                  Theme Appearance
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Currently:{" "}
                  <span className="font-semibold text-primary">
                    {themeConfig.name}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setTheme("classic-teal")}
              className="text-[10px] text-slate-400 hover:text-primary transition-colors font-medium px-2 py-0.5 rounded-md hover:bg-surface-muted"
            >
              Reset
            </button>
          </div>

          {/* Category Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-surface-muted rounded-xl my-3 text-xs border border-border/60">
            {THEME_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg font-semibold text-[11px] transition-all",
                    isActive
                      ? "bg-surface text-slate-900 shadow-xs border border-border/80"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {getCategoryIcon(cat.id)}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Theme Grid */}
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {filteredThemes.map((item) => {
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all duration-150 group",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/20"
                      : "border-transparent hover:border-border hover:bg-surface-muted"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Swatch */}
                    <div
                      className="w-7 h-7 rounded-full shrink-0 shadow-xs ring-2 ring-border/80 flex items-center justify-center"
                      style={{
                        background: item.gradient || item.primaryColor,
                      }}
                    >
                      {item.secondaryColor && !item.gradient && (
                        <div
                          className="w-3 h-3 rounded-full ml-2 mt-2 shadow-xs"
                          style={{ backgroundColor: item.secondaryColor }}
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 tracking-tight">
                          {item.name}
                        </span>
                        {item.isDark && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-200">
                            Dark
                          </span>
                        )}
                        {item.gradient && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25">
                            Mix
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Checkmark or selection cue */}
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "opacity-0 group-hover:opacity-40 text-slate-400"
                    )}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="pt-3 mt-3 border-t border-border flex items-center justify-between text-[10px] text-slate-400">
            <span>✨ Realtime System Adaptation</span>
            <span className="font-medium text-slate-500">Auto-saved</span>
          </div>
        </div>
      )}
    </div>
  );
}
