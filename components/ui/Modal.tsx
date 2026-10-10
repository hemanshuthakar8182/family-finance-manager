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

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          "relative w-full rounded-t-[28px] sm:rounded-modal bg-surface shadow-2xl border border-border/80 z-10 h-auto max-h-[92dvh] sm:max-h-[85vh] flex flex-col overflow-hidden transform transition-all duration-200 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2",
          maxWidths[maxWidth]
        )}
      >
        {/* Pinned Top: Drag Handle + Header */}
        <div className="shrink-0 px-4 pt-3 pb-3 sm:px-6 sm:pt-5 sm:pb-4 border-b border-border bg-surface select-none">
          {/* Mobile drag handle button */}
          <div 
            onClick={onClose}
            className="w-12 h-1.5 bg-slate-300 hover:bg-slate-400 rounded-full mx-auto mb-2.5 sm:hidden cursor-pointer transition-colors" 
            title="Tap to dismiss"
          />

          <div className="flex items-start justify-between gap-3">
            <div>
              {title && (
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 p-1.5 rounded-lg hover:bg-surface-muted transition-colors -mr-1 shrink-0"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body Container */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 sm:px-6 sm:py-4 overscroll-contain min-h-0 pb-[max(1rem,env(safe-area-inset-bottom,16px))]">
          {children}
        </div>
      </div>
    </div>
  );
}
