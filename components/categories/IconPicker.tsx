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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          Category Icon
        </label>
        {isAutoDetected && (
          <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/25">
            Auto-suggested
          </span>
        )}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-2.5 rounded-input border bg-white transition-all text-left",
          isOpen
            ? "border-primary ring-2 ring-primary/10 shadow-xs"
            : "border-border hover:border-slate-300"
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
            style={{ backgroundColor: color }}
          >
            <CategoryIcon name={value} size={16} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-900">
              {currentIconItem?.label || value || "Select Icon"}
            </p>
            <p className="text-[10px] text-slate-400">
              {isOpen ? "Click to close picker" : "Click to choose custom icon"}
            </p>
          </div>
        </div>
        <div className="flex items-center text-slate-400">
          {isOpen ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Expandable Icon Selection Grid */}
      {isOpen && (
        <div className="p-3 bg-slate-50/80 rounded-card border border-border/80 space-y-2.5 animate-in fade-in duration-150">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search 50+ icons (e.g. food, fuel, gym, pet)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 bg-white rounded-input border border-border text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedGroup(cat)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all shrink-0",
                  selectedGroup === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-surface text-slate-600 border border-border hover:bg-surface-muted"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid of icons */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-48 overflow-y-auto p-1 bg-surface rounded-input border border-border">
            {filteredIcons.length === 0 ? (
              <div className="col-span-full py-6 text-center text-xs text-slate-400">
                No matching icons found
              </div>
            ) : (
              filteredIcons.map((item: CuratedIconItem) => {
                const isSelected =
                  value.toLowerCase() === item.name.toLowerCase();
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      onChange(item.name);
                      setIsOpen(false);
                    }}
                    title={item.label}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-btn border transition-all text-center group",
                      isSelected
                        ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                        : "bg-surface border-transparent hover:border-border text-slate-700 hover:bg-surface-muted"
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center mb-1 transition-transform group-hover:scale-110",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-muted text-slate-600"
                      )}
                    >
                      <CategoryIcon name={item.name} size={15} />
                    </div>
                    <span className="text-[9px] line-clamp-1 leading-tight">
                      {item.label}
                    </span>
                  </button>
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700">
          Theme Color
        </label>
        {isAutoDetected && (
          <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/25">
            Auto-suggested
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-surface-muted rounded-input border border-border">
        {presetColors.map((color) => {
          const isSelected = value.toLowerCase() === color.hex.toLowerCase();
          return (
            <button
              key={color.hex}
              type="button"
              onClick={() => onChange(color.hex)}
              title={color.label}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110 shadow-xs",
                isSelected
                  ? "ring-2 ring-offset-2 ring-primary scale-110"
                  : "hover:opacity-90"
              )}
              style={{ backgroundColor: color.hex }}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
          );
        })}

        {/* Native color picker for custom colors */}
        <label
          title="Pick custom hex color"
          className="relative w-6 h-6 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-slate-500 bg-white"
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <span className="text-[10px] text-slate-500 font-bold">+</span>
        </label>
      </div>
    </div>
  );
}
