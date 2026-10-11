"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: "modal-max-sm",
    md: "modal-max-md",
    lg: "modal-max-lg",
    xl: "modal-max-xl",
  };

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end align-items-sm-center justify-content-center p-0 p-sm-3 modal-backdrop-blur"
      style={{ zIndex: 1060 }}
    >
      {/* Click-away backdrop dismiss overlay */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Dialog / Mobile Sheet Card */}
      <div
        className={cn(
          "modal-content modal-sheet-dialog position-relative w-100 rounded-top-4 rounded-sm-4 bg-surface overflow-hidden d-flex flex-column z-10",
          maxWidthStyles[maxWidth]
        )}
        style={{ maxHeight: "90dvh" }}
      >
        {/* Pinned Top: Tactile Mobile Pull Pill + Title Bar */}
        <div className="flex-shrink-0 px-3.5 px-sm-4 pt-3 pb-3 border-bottom bg-surface user-select-none">
          {/* Mobile tactile pull handle */}
          <div 
            onClick={onClose}
            className="d-sm-none modal-drag-pill mx-auto mb-2.5"
            title="Tap or drag to dismiss"
          />

          <div className="d-flex align-items-center justify-content-between gap-3">
            <div className="overflow-hidden">
              {title && (
                <h3 className="h6 fw-bold text-foreground mb-0 text-truncate" style={{ letterSpacing: "-0.01em" }}>
                  {title}
                </h3>
              )}
              {description && (
                <p className="small text-secondary mb-0 mt-0.5 text-truncate" style={{ fontSize: "12px" }}>
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              type="button"
              className="modal-close-btn flex-shrink-0"
              aria-label="Close dialog"
            >
              <X style={{ width: "16px", height: "16px", strokeWidth: 2.2 }} />
            </button>
          </div>
        </div>

        {/* Scrollable Body Container with safe-area padding */}
        <div 
          className="flex-grow-1 overflow-y-auto px-3.5 px-sm-4 py-3"
          style={{ 
            overscrollBehavior: "contain",
            paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 24px))" 
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
