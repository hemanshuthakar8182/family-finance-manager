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

const SIZE_CONFIG = {
  xs: { size: 24, borderRadius: "6px", fontSize: "11px" },
  sm: { size: 32, borderRadius: "8px", fontSize: "13px" },
  md: { size: 36, borderRadius: "10px", fontSize: "15px" },
  lg: { size: 48, borderRadius: "14px", fontSize: "20px" },
  xl: { size: 64, borderRadius: "18px", fontSize: "26px" },
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
  const cfg = SIZE_CONFIG[size] || SIZE_CONFIG.md;

  const displayName = name?.trim() || "Family Finance";
  const initial = displayName.charAt(0).toUpperCase();

  const renderEmblem = () => {
    if (logoUrl && !imageError) {
      return (
        <div
          className={cn(
            "position-relative flex-shrink-0 overflow-hidden bg-surface border shadow-sm d-flex align-items-center justify-content-center p-1",
            className
          )}
          style={{ width: `${cfg.size}px`, height: `${cfg.size}px`, borderRadius: cfg.borderRadius }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={displayName}
            onError={() => setImageError(true)}
            className="w-100 h-100 object-fit-contain"
            style={{ borderRadius: "inherit" }}
          />
        </div>
      );
    }

    // Default premium gradient monogram emblem
    return (
      <div
        className={cn(
          "flex-shrink-0 d-flex align-items-center justify-content-center fw-bold shadow-sm user-select-none",
          className
        )}
        style={{
          width: `${cfg.size}px`,
          height: `${cfg.size}px`,
          borderRadius: cfg.borderRadius,
          background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
          color: "var(--primary-foreground, #ffffff)",
          fontSize: cfg.fontSize,
        }}
      >
        <span style={{ lineHeight: 1 }}>{initial}</span>
      </div>
    );
  };

  if (!showText) {
    return renderEmblem();
  }

  return (
    <div className="d-flex align-items-center gap-2 overflow-hidden">
      {renderEmblem()}
      <div className="overflow-hidden">
        <h2
          className={cn(
            "h6 fw-bold text-dark text-truncate mb-0",
            textClassName
          )}
        >
          {displayName}
        </h2>
        {subtitle && (
          <p className="small text-secondary text-truncate mb-0" style={{ fontSize: "11px" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

