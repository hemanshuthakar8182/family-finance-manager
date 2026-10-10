import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "income" | "expense" | "warning" | "info" | "secondary";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-light text-dark border",
    income: "bg-success-subtle text-success border border-success-subtle",
    expense: "bg-danger-subtle text-danger border border-danger-subtle",
    warning: "bg-warning-subtle text-warning-emphasis border border-warning-subtle",
    info: "bg-info-subtle text-info-emphasis border border-info-subtle",
    secondary: "bg-secondary-subtle text-secondary border border-secondary-subtle",
  };

  return (
    <span
      className={cn(
        "badge rounded-pill d-inline-flex align-items-center gap-1 px-2.5 py-1 select-none fw-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
