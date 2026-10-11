"use client";

import React, { useState, useMemo } from "react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import {
  CURATED_CATEGORY_ICONS,
  CuratedIconItem,
} from "@/lib/utils/category-helper";
import { Search, ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  color?: string;
  isAutoDetected?: boolean;
}

const CATEGORIES = [
  "All",
  "Food",
  "Shopping",
  "Transport",
  "Home",
  "Health",
  "Family",
  "Leisure",
  "Finance",
];

export function IconPicker({
  value,
  onChange,
  color = "#0F766E",
  isAutoDetected = false,
}: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All");

  const filteredIcons = useMemo(() => {
    return CURATED_CATEGORY_ICONS.filter((item: CuratedIconItem) => {
      const matchesGroup =
        selectedGroup === "All" || item.category === selectedGroup;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesGroup && matchesSearch;
    });
  }, [search, selectedGroup]);

  const currentIconItem = CURATED_CATEGORY_ICONS.find(
    (i) => i.name.toLowerCase() === (value || "").toLowerCase()
  );

  return (
    <div className="d-flex flex-column gap-2">
      <div className="d-flex align-items-center justify-content-between">
        <label className="form-label small fw-semibold text-dark mb-0">
          Category Icon
        </label>
        {isAutoDetected && (
          <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: "11px" }}>
            Auto-suggested
          </span>
        )}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-100 d-flex align-items-center justify-content-between p-2.5 rounded-input border bg-surface text-start transition",
          isOpen ? "border-primary shadow-sm" : ""
        )}
      >
        <div className="d-flex align-items-center gap-2.5">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm"
            style={{ width: "34px", height: "34px", backgroundColor: color }}
          >
            <CategoryIcon name={value} size={16} />
          </div>
          <div>
            <p className="small fw-bold text-dark mb-0">
              {currentIconItem?.label || value || "Select Icon"}
            </p>
            <p className="small text-secondary mb-0" style={{ fontSize: "11px" }}>
              {isOpen ? "Click to close picker" : "Click to choose custom icon"}
            </p>
          </div>
        </div>
        <div className="text-secondary">
          {isOpen ? (
            <ChevronUp style={{ width: "16px", height: "16px" }} />
          ) : (
            <ChevronDown style={{ width: "16px", height: "16px" }} />
          )}
        </div>
      </button>

      {/* Expandable Icon Selection Grid */}
      {isOpen && (
        <div className="p-3 bg-light rounded-card border d-flex flex-column gap-2 shadow-sm">
          {/* Search bar */}
          <div className="position-relative">
            <Search
              style={{ width: "14px", height: "14px", left: "10px", top: "50%", transform: "translateY(-50%)" }}
              className="position-absolute text-secondary"
            />
            <input
              type="text"
              placeholder="Search 50+ icons (e.g. food, fuel, gym, pet)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control form-control-sm rounded-input ps-4 small"
            />
          </div>

          {/* Category Tabs */}
          <div className="d-flex gap-1 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedGroup(cat)}
                className={cn(
                  "badge rounded-pill border px-2.5 py-1 small fw-semibold text-nowrap transition",
                  selectedGroup === cat
                    ? "bg-primary text-white border-primary"
                    : "bg-surface text-secondary border"
                )}
                style={{ fontSize: "11px", textDecoration: "none", cursor: "pointer" }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid of icons */}
          <div className="row g-1 overflow-y-auto p-1 bg-surface rounded-input border" style={{ maxHeight: "200px" }}>
            {filteredIcons.length === 0 ? (
              <div className="col-12 py-4 text-center small text-secondary">
                No matching icons found
              </div>
            ) : (
              filteredIcons.map((item: CuratedIconItem) => {
                const isSelected =
                  value.toLowerCase() === item.name.toLowerCase();
                return (
                  <div key={item.name} className="col-3 col-sm-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        onChange(item.name);
                        setIsOpen(false);
                      }}
                      title={item.label}
                      className={cn(
                        "btn btn-sm w-100 p-1.5 rounded-btn d-flex flex-column align-items-center justify-content-center border transition",
                        isSelected
                          ? "btn-primary text-white shadow-sm"
                          : "btn-light border-0 text-dark"
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-circle d-flex align-items-center justify-content-center mb-1",
                          isSelected
                            ? "bg-white bg-opacity-25 text-white"
                            : "bg-light text-secondary"
                        )}
                        style={{ width: "26px", height: "26px" }}
                      >
                        <CategoryIcon name={item.name} size={14} />
                      </div>
                      <span className="text-truncate d-block w-100" style={{ fontSize: "9px", lineHeight: 1.1 }}>
                        {item.label}
                      </span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presetColors: Array<{ hex: string; label: string }>;
  isAutoDetected?: boolean;
}

export function ColorPicker({
  value,
  onChange,
  presetColors,
  isAutoDetected = false,
}: ColorPickerProps) {
  return (
    <div className="d-flex flex-column gap-1">
      <div className="d-flex align-items-center justify-content-between">
        <label className="form-label small fw-semibold text-dark mb-0">
          Theme Color
        </label>
        {isAutoDetected && (
          <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: "11px" }}>
            Auto-suggested
          </span>
        )}
      </div>

      <div className="d-flex flex-wrap align-items-center gap-2 p-2 bg-light rounded-input border">
        {presetColors.map((color) => {
          const isSelected = value.toLowerCase() === color.hex.toLowerCase();
          return (
            <button
              key={color.hex}
              type="button"
              onClick={() => onChange(color.hex)}
              title={color.label}
              className="rounded-circle d-flex align-items-center justify-content-center text-white border-0 shadow-sm p-0"
              style={{
                width: "28px",
                height: "28px",
                backgroundColor: color.hex,
                outline: isSelected ? "2px solid var(--primary)" : "none",
                outlineOffset: "2px",
                cursor: "pointer",
              }}
            >
              {isSelected && <Check style={{ width: "14px", height: "14px" }} />}
            </button>
          );
        })}

        {/* Native color picker for custom colors */}
        <label
          title="Pick custom hex color"
          className="position-relative rounded-circle border-2 border-dashed d-flex align-items-center justify-content-center cursor-pointer bg-white"
          style={{ width: "28px", height: "28px", cursor: "pointer" }}
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="position-absolute top-0 start-0 opacity-0 w-100 h-100 cursor-pointer"
          />
          <span className="small text-secondary fw-bold">+</span>
        </label>
      </div>
    </div>
  );
}

