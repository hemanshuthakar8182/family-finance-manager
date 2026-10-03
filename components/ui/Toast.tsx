"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ToastOptions {
  type?: "success" | "error" | "info";
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
      <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-card border shadow-card bg-surface transition-all duration-300 animate-in slide-in-from-top-3",
              toast.type === "error"
                ? "border-red-200 bg-red-50/90 text-red-900"
                : toast.type === "info"
                ? "border-blue-200 bg-blue-50/90 text-blue-900"
                : "border-emerald-200 bg-emerald-50/95 text-emerald-950"
            )}
          >
            {toast.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-expense flex-shrink-0 mt-0.5" />
            ) : toast.type === "info" ? (
              <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-income flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="text-sm font-semibold">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-slate-600 mt-0.5">{toast.message}</p>
              )}
              {toast.actionText && toast.onAction && (
                <button
                  onClick={() => {
                    toast.onAction?.();
                    removeToast(toast.id);
                  }}
                  className="mt-2 text-xs font-bold text-primary hover:underline underline-offset-2"
                >
                  {toast.actionText} →
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
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
