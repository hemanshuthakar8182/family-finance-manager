import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefixText, type = "text", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-100">
        {label && (
          <label htmlFor={inputId} className="form-label small fw-semibold text-dark mb-1">
            {label}
          </label>
        )}
        <div className="position-relative d-flex align-items-center">
          {prefixText && (
            <span className="position-absolute start-0 ps-3 text-secondary fw-semibold select-none small">
              {prefixText}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={cn(
              "form-control rounded-input py-2 px-3 small text-dark bg-surface border",
              prefixText && "ps-5",
              error && "is-invalid border-danger",
              className
            )}
            {...props}
          />
        </div>
        {error && <div className="text-danger small mt-1 fw-medium">{error}</div>}
      </div>
    );
  }
);

Input.displayName = "Input";
