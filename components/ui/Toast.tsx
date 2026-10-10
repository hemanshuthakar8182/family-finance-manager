"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ToastOptions {
  type?: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastOptions & { id: string })[]>([]);

  const showToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...options, id }]);

    const timeout = options.duration || 4000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, timeout);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div 
        className="position-fixed top-0 end-0 p-3 d-flex flex-column gap-2"
        style={{ zIndex: 1080, maxWidth: "420px", width: "100%", pointerEvents: "none" }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "toast show w-100 d-flex align-items-start gap-3 p-3 rounded-card border shadow-sm bg-surface",
              toast.type === "error"
                ? "border-danger bg-danger-subtle text-danger-emphasis"
                : toast.type === "warning"
                ? "border-warning bg-warning-subtle text-warning-emphasis"
                : toast.type === "info"
                ? "border-primary bg-primary-subtle text-primary-emphasis"
                : "border-success bg-success-subtle text-success-emphasis"
            )}
            style={{ pointerEvents: "auto" }}
          >
            {toast.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-1" style={{ width: "20px", height: "20px" }} />
            ) : toast.type === "warning" ? (
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-1" style={{ width: "20px", height: "20px" }} />
            ) : toast.type === "info" ? (
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-1" style={{ width: "20px", height: "20px" }} />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-1" style={{ width: "20px", height: "20px" }} />
            )}
            <div className="flex-grow-1">
              <h4 className="small fw-bold mb-0">{toast.title}</h4>
              {toast.message && (
                <p className="small text-secondary mb-0 mt-1">{toast.message}</p>
              )}
              {toast.actionText && toast.onAction && (
                <button
                  onClick={() => {
                    toast.onAction?.();
                    removeToast(toast.id);
                  }}
                  className="btn btn-link btn-sm p-0 mt-1 small fw-bold text-primary text-decoration-none"
                >
                  {toast.actionText} →
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="btn btn-sm btn-link text-secondary p-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" style={{ width: "16px", height: "16px" }} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
