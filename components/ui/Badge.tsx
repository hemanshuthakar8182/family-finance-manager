import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "income" | "expense" | "warning" | "info" | "secondary";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    income: "bg-income-light text-income-foreground border-income-border",
    expense: "bg-expense-light text-expense-foreground border-expense-border",
    warning: "bg-warning-light text-warning-foreground border-amber-200",
    info: "bg-info-light text-info-foreground border-blue-200",
    secondary: "bg-slate-50 text-slate-600 border-slate-200",
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
