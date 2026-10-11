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
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-end align-items-sm-center justify-content-center p-0 p-sm-3"
      style={{ zIndex: 1060, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "modal-content bottom-sheet-modal position-relative w-100 rounded-top-4 rounded-sm-modal bg-surface shadow-card border overflow-hidden d-flex flex-column z-10",
          maxWidthStyles[maxWidth]
        )}
        style={{ maxHeight: "90dvh" }}
      >
        {/* Pinned Top: Drag Handle + Header */}
        <div className="flex-shrink-0 px-3 px-sm-4 pt-3 pb-3 border-bottom bg-surface user-select-none">
          {/* Mobile drag handle button */}
          <div 
            onClick={onClose}
            className="d-sm-none mx-auto mb-2 rounded-pill bg-secondary bg-opacity-25"
            style={{ width: "48px", height: "6px", cursor: "pointer" }}
            title="Tap to dismiss"
          />

          <div className="d-flex align-items-start justify-content-between gap-3">
            <div>
              {title && (
                <h3 className="h6 fw-bold text-dark mb-0">
                  {title}
                </h3>
              )}
              {description && (
                <p className="small text-secondary mb-0 mt-1">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              type="button"
              className="btn btn-sm btn-light rounded-circle p-1 text-secondary"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" style={{ width: "18px", height: "18px" }} />
            </button>
          </div>
        </div>

        {/* Scrollable Body Container */}
        <div 
          className="flex-grow-1 overflow-y-auto px-3 px-sm-4 py-3"
          style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 20px))" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
