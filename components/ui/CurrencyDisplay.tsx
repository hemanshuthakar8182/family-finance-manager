import React from "react";
import { cn } from "@/lib/utils/cn";

export interface CurrencyDisplayProps {
  amount: number | string | null | undefined;
  showSign?: boolean;
  type?: "INCOME" | "EXPENSE" | "TRANSFER" | "DEFAULT";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showDecimals?: boolean;
}

export function CurrencyDisplay({
  amount,
  showSign = false,
  type = "DEFAULT",
  size = "md",
  className,
  showDecimals = false,
}: CurrencyDisplayProps) {
  const numericAmount = typeof amount === "number" ? amount : Number(amount) || 0;
  const absVal = Math.abs(numericAmount);

  // Split into integer and decimal parts
  const formattedString = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(absVal);

  const parts = formattedString.split(".");
  const intPart = parts[0];
  const decPart = parts.length > 1 ? parts[1] : null;

  // Determine sign
  let sign = "";
  if (numericAmount < 0) {
    sign = "-";
  } else if (showSign) {
    if (type === "INCOME" || numericAmount > 0) {
      sign = "+";
    } else if (type === "TRANSFER") {
      sign = "⇄ ";
    }
  }

  // Color classes
  let colorClass = "text-foreground";
  if (numericAmount < 0) {
    colorClass = "text-danger";
  } else if (type === "INCOME" || (type === "DEFAULT" && numericAmount > 0 && showSign)) {
    colorClass = "text-income";
  } else if (type === "EXPENSE") {
    colorClass = "text-expense";
  } else if (type === "TRANSFER") {
    colorClass = "text-primary";
  }

  // Size sizing
  const sizeMap = {
    xs: { main: "fs-6 fw-bold", symbol: "small", dec: "small opacity-75" },
    sm: { main: "fs-6 fw-bold", symbol: "small", dec: "small opacity-75" },
    md: { main: "fs-5 fw-bold", symbol: "small", dec: "small opacity-75" },
    lg: { main: "fs-4 fw-bold", symbol: "fs-6", dec: "small opacity-75" },
    xl: { main: "fs-3 fw-bold", symbol: "fs-5", dec: "fs-6 opacity-75" },
    "2xl": { main: "display-6 fw-bold", symbol: "fs-4", dec: "fs-6 opacity-75" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <span
      className={cn(
        "d-inline-flex align-items-baseline font-amount user-select-none",
        colorClass,
        currentSize.main,
        className
      )}
      style={{ letterSpacing: "-0.02em" }}
    >
      {sign && <span>{sign}</span>}
      <span className={cn("me-0.5 fw-semibold", currentSize.symbol)} style={{ opacity: 0.85 }}>
        ₹
      </span>
      <span>{intPart}</span>
      {decPart && (
        <span className={cn("ms-0.5", currentSize.dec)} style={{ fontSize: "0.8em" }}>
          .{decPart}
        </span>
      )}
    </span>
  );
}
