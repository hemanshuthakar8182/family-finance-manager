import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "income" | "expense";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "btn d-inline-flex align-items-center justify-content-center fw-medium shadow-none select-none text-decoration-none";

    const variants = {
      primary: "btn-primary shadow-sm text-white",
      secondary: "btn-light border bg-surface-muted text-dark",
      outline: "btn-outline-secondary bg-surface text-dark",
      ghost: "btn-link text-secondary text-decoration-none hover-bg-light",
      destructive: "btn-danger shadow-sm text-white",
      income: "btn-success shadow-sm text-white",
      expense: "btn-danger shadow-sm text-white",
    };

    const sizes = {
      sm: "btn-sm rounded-btn py-1 px-3",
      md: "rounded-btn py-2 px-3",
      lg: "btn-lg rounded-btn py-2.5 px-4",
      icon: "rounded-btn p-2 d-inline-flex align-items-center justify-content-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="d-inline-flex align-items-center gap-2">
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            <span>Please wait...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
