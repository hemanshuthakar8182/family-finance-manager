"use client";

import React, { useState, useRef, useEffect } from "react";
import { Palette, Check, Sparkles, Moon, Sun, ShieldCheck, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { THEMES, THEME_CATEGORIES, ThemeCategory } from "./theme-config";
import { cn } from "@/lib/utils/cn";

export function ThemeSelector() {
  const { theme, setTheme, previewTheme, cancelPreview, themeConfig, isAutoSystem, toggleAutoSystem } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ThemeCategory>(themeConfig.category);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync active category tab when current theme changes
  useEffect(() => {
    setActiveCategory(themeConfig.category);
  }, [themeConfig.category]);

  // Click outside to close and revert any active preview
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        cancelPreview();
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, cancelPreview]);

  const filteredThemes = THEMES.filter((t) => t.category === activeCategory);

  const getCategoryIcon = (cat: ThemeCategory) => {
    switch (cat) {
      case "classic":
        return <ShieldCheck style={{ width: "14px", height: "14px" }} />;
      case "light":
        return <Sun style={{ width: "14px", height: "14px" }} />;
      case "mix":
        return <Sparkles style={{ width: "14px", height: "14px" }} />;
      case "dark":
        return <Moon style={{ width: "14px", height: "14px" }} />;
    }
  };

  return (
    <div className="position-relative d-inline-block text-start" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          if (isOpen) cancelPreview();
          setIsOpen(!isOpen);
        }}
        title="Change System Theme"
        aria-label="Change System Theme"
        className={cn(
          "btn btn-sm position-relative d-flex align-items-center justify-content-center p-2 rounded-btn border transition",
          isOpen
            ? "btn-light border-primary text-primary"
            : "btn-light border text-secondary"
        )}
      >
        <Palette style={{ width: "16px", height: "16px" }} />
        {/* Dynamic color pip */}
        <span
          className="position-absolute top-0 end-0 rounded-circle border border-2 border-white shadow-xs"
          style={{
            width: "11px",
            height: "11px",
            background: themeConfig.gradient || themeConfig.primaryColor,
            transform: "translate(25%, -25%)",
          }}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          className="position-absolute end-0 top-100 mt-2 rounded-card bg-surface border p-3 overflow-y-auto shadow-lg"
          style={{
            zIndex: 1070,
            width: "min(330px, calc(100vw - 24px))",
            maxHeight: "82vh",
            backdropFilter: "blur(14px)",
          }}
          onMouseLeave={cancelPreview}
        >
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between pb-2 border-bottom">
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-btn d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0"
                style={{
                  width: "28px",
                  height: "28px",
                  background: themeConfig.gradient || themeConfig.primaryColor,
                }}
              >
                <Palette style={{ width: "14px", height: "14px" }} />
              </div>
              <div>
                <h4 className="small fw-bold text-dark mb-0 lh-1">
                  Theme Appearance
                </h4>
                <p className="text-secondary mb-0 mt-1" style={{ fontSize: "10px" }}>
                  Currently:{" "}
                  <span className="fw-semibold text-primary">
                    {themeConfig.name}
                  </span>
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center gap-1">
              <button
                onClick={() => {
                  toggleAutoSystem();
                }}
                type="button"
                title="Automatically match operating system theme"
                className={cn(
                  "btn btn-sm py-0.5 px-2 rounded-pill small fw-semibold d-inline-flex align-items-center gap-1 transition",
                  isAutoSystem
                    ? "btn-primary text-white shadow-xs"
                    : "btn-light border text-secondary"
                )}
                style={{ fontSize: "10px" }}
              >
                <Monitor style={{ width: "11px", height: "11px" }} />
                <span>Auto OS</span>
              </button>

              <button
                onClick={() => setTheme("classic-teal")}
                type="button"
                className="btn btn-sm btn-link text-secondary text-decoration-none py-0 px-1.5 small"
                style={{ fontSize: "11px" }}
                title="Reset to default theme"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="row g-1 p-1 bg-light rounded-btn my-2 border">
            {THEME_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <div key={cat.id} className="col-3">
                  <button
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "btn btn-sm w-100 d-flex align-items-center justify-content-center gap-1 py-1 px-1 rounded-btn fw-semibold transition",
                      isActive
                        ? "btn-light shadow-sm text-dark border"
                        : "btn-link text-secondary text-decoration-none"
                    )}
                    style={{ fontSize: "11px" }}
                  >
                    {getCategoryIcon(cat.id)}
                    <span>{cat.label}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Theme Grid with Hover Live-Preview */}
          <div className="d-flex flex-column gap-1 overflow-y-auto pe-1" style={{ maxHeight: "260px" }}>
            {filteredThemes.map((item) => {
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  onMouseEnter={() => previewTheme(item.id)}
                  className={cn(
                    "btn btn-sm w-100 d-flex align-items-center justify-content-between p-2 rounded-btn border text-start transition",
                    isSelected
                      ? "btn-light border-primary bg-primary-subtle text-primary shadow-xs"
                      : "btn-light border-0 text-dark"
                  )}
                >
                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                    {/* Swatch */}
                    <div
                      className="rounded-circle flex-shrink-0 shadow-sm border d-flex align-items-center justify-content-center"
                      style={{
                        width: "26px",
                        height: "26px",
                        background: item.gradient || item.primaryColor,
                      }}
                    />

                    <div className="overflow-hidden">
                      <div className="d-flex align-items-center gap-1">
                        <span className="small fw-bold text-dark text-truncate">
                          {item.name}
                        </span>
                        {item.isDark && (
                          <span className="badge bg-dark rounded-pill py-0 px-1" style={{ fontSize: "9px" }}>
                            Dark
                          </span>
                        )}
                        {item.gradient && (
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill py-0 px-1" style={{ fontSize: "9px" }}>
                            Mix
                          </span>
                        )}
                      </div>
                      <p className="text-secondary text-truncate mb-0" style={{ fontSize: "10px" }}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Checkmark */}
                  {isSelected && (
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center bg-primary text-white flex-shrink-0 ms-2"
                      style={{ width: "18px", height: "18px" }}
                    >
                      <Check style={{ width: "12px", height: "12px", strokeWidth: "3" }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="pt-2 mt-2 border-top d-flex align-items-center justify-content-between text-secondary" style={{ fontSize: "10px" }}>
            <span className="d-inline-flex align-items-center gap-1">
              <span>✨ Hover to preview</span>
            </span>
            <span className="fw-medium">
              {isAutoSystem ? "OS Sync Active" : "Auto-saved"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
