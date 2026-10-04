import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "income" | "expense" | "warning" | "info" | "secondary";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-surface-muted text-slate-800 border-border",
    income: "bg-income-light text-income-foreground border-income-border",
    expense: "bg-expense-light text-expense-foreground border-expense-border",
    warning: "bg-warning-light text-warning-foreground border-amber-500/25",
    info: "bg-info-light text-info-foreground border-blue-500/25",
    secondary: "bg-surface-muted/60 text-slate-600 border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border select-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
