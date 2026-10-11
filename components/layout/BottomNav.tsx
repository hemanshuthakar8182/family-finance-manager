"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Menu,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { MobileMoreDrawer } from "./MobileMoreDrawer";

interface BottomNavProps {
  onOpenQuickAdd: () => void;
}

export function BottomNav({ onOpenQuickAdd }: BottomNavProps) {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const isHome = pathname === "/dashboard" || pathname === "/";
  const isTransactions = pathname === "/transactions";
  const isReports = pathname === "/reports";
  const isOther = !isHome && !isTransactions && !isReports;

  return (
    <>
      <nav 
        className="d-lg-none position-fixed bottom-0 start-0 end-0 bg-surface border-top px-3 pt-2 shadow-lg"
        style={{ zIndex: 1040, paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 8px))", backdropFilter: "blur(10px)" }}
      >
        <div className="d-flex align-items-center justify-content-around position-relative mx-auto" style={{ maxWidth: "450px" }}>
          {/* Home */}
          <Link
            href="/dashboard"
            className={cn(
              "d-flex flex-column align-items-center justify-content-center py-1 px-2 text-decoration-none transition",
              isHome ? "text-primary fw-bold" : "text-secondary"
            )}
          >
            <LayoutDashboard className="mb-1" style={{ width: "20px", height: "20px" }} />
            <span style={{ fontSize: "11px" }}>Home</span>
          </Link>

          {/* Transactions */}
          <Link
            href="/transactions"
            className={cn(
              "d-flex flex-column align-items-center justify-content-center py-1 px-2 text-decoration-none transition",
              isTransactions ? "text-primary fw-bold" : "text-secondary"
            )}
          >
            <Receipt className="mb-1" style={{ width: "20px", height: "20px" }} />
            <span style={{ fontSize: "11px" }}>Transactions</span>
          </Link>

          {/* Floating Quick Add Button */}
          <div className="d-flex flex-column align-items-center" style={{ marginTop: "-24px" }}>
            <button
              onClick={onOpenQuickAdd}
              type="button"
              aria-label="Add Transaction"
              className="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center p-0 border border-4"
              style={{ width: "52px", height: "52px", borderColor: "var(--surface)" }}
            >
              <Plus style={{ width: "26px", height: "26px", strokeWidth: "2.5" }} />
            </button>
            <span className="fw-semibold text-primary mt-1" style={{ fontSize: "10px" }}>Add</span>
          </div>

          {/* Reports */}
          <Link
            href="/reports"
            className={cn(
              "d-flex flex-column align-items-center justify-content-center py-1 px-2 text-decoration-none transition",
              isReports ? "text-primary fw-bold" : "text-secondary"
            )}
          >
            <BarChart3 className="mb-1" style={{ width: "20px", height: "20px" }} />
            <span style={{ fontSize: "11px" }}>Reports</span>
          </Link>

          {/* More */}
          <button
            onClick={() => setIsMoreOpen(true)}
            type="button"
            className={cn(
              "btn btn-link p-0 d-flex flex-column align-items-center justify-content-center py-1 px-2 text-decoration-none transition",
              isOther ? "text-primary fw-bold" : "text-secondary"
            )}
          >
            <Menu className="mb-1" style={{ width: "20px", height: "20px" }} />
            <span style={{ fontSize: "11px" }}>More</span>
          </button>
        </div>
      </nav>

      {/* More Options Drawer */}
      <MobileMoreDrawer isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
}
