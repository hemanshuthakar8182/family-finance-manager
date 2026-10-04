"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface AppLogoProps {
  logoUrl?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  subtitle?: string | null;
  textClassName?: string;
}

const SIZE_MAP = {
  xs: {
    container: "w-6 h-6 rounded-md text-xs",
    iconSize: 12,
  },
  sm: {
    container: "w-8 h-8 rounded-lg text-sm",
    iconSize: 16,
  },
  md: {
    container: "w-9 h-9 rounded-xl text-base",
    iconSize: 18,
  },
  lg: {
    container: "w-12 h-12 rounded-2xl text-xl",
    iconSize: 24,
  },
  xl: {
    container: "w-16 h-16 rounded-2xl text-2xl",
    iconSize: 32,
  },
};

export function AppLogo({
  logoUrl,
  name = "Family Finance",
  size = "md",
  className,
  showText = false,
  subtitle,
  textClassName,
}: AppLogoProps) {
  const [imageError, setImageError] = useState(false);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  const displayName = name?.trim() || "Family Finance";
  const initial = displayName.charAt(0).toUpperCase();

  const renderEmblem = () => {
    if (logoUrl && !imageError) {
      return (
        <div
          className={cn(
            "relative shrink-0 overflow-hidden bg-surface border border-border shadow-xs flex items-center justify-center p-0.5",
            sizeConfig.container,
            className
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={displayName}
            onError={() => setImageError(true)}
            className="w-full h-full object-contain rounded-[inherit]"
          />
        </div>
      );
    }

    // Default premium gradient monogram emblem
    return (
      <div
        className={cn(
          "shrink-0 flex items-center justify-center font-bold text-primary-foreground shadow-xs select-none bg-gradient-to-tr from-primary to-accent ring-1 ring-border/30",
          sizeConfig.container,
          className
        )}
      >
        <span className="font-heading tracking-tight leading-none drop-shadow-xs">
          {initial}
        </span>
      </div>
    );
  };

  if (!showText) {
    return renderEmblem();
  }

  return (
    <div className="flex items-center gap-2.5 min-w-0">
      {renderEmblem()}
      <div className="min-w-0">
        <h2
          className={cn(
            "text-sm font-bold tracking-tight text-slate-900 truncate leading-snug",
            textClassName
          )}
        >
          {displayName}
        </h2>
        {subtitle && (
          <p className="text-[11px] font-medium text-slate-500 truncate leading-none mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
