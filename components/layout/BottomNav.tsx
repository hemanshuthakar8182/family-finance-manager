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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border px-3 py-2 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around relative">
          {/* Home */}
          <Link
            href="/dashboard"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors",
              isHome ? "text-primary font-semibold" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Home</span>
          </Link>

          {/* Transactions */}
          <Link
            href="/transactions"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors",
              isTransactions ? "text-primary font-semibold" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Receipt className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Transactions</span>
          </Link>

          {/* Floating Quick Add Button */}
          <div className="flex flex-col items-center -mt-6">
            <button
              onClick={onOpenQuickAdd}
              aria-label="Add Transaction"
              className="w-13 h-13 p-3.5 rounded-full bg-primary hover:bg-primary-hover text-primary-foreground shadow-floating flex items-center justify-center transform active:scale-90 transition-all duration-150 ring-4 ring-background"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
            <span className="text-[10px] font-semibold text-primary mt-1">Add</span>
          </div>

          {/* Reports */}
          <Link
            href="/reports"
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors",
              isReports ? "text-primary font-semibold" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">Reports</span>
          </Link>

          {/* More */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors",
              isOther ? "text-primary font-semibold" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[11px]">More</span>
          </button>
        </div>
      </nav>

      {/* More Options Drawer */}
      <MobileMoreDrawer isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
}
