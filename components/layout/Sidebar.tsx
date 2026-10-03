"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Tags,
  CreditCard,
  Users,
  Target,
  Settings,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SidebarProps {
  onOpenQuickAdd?: () => void;
}

export function Sidebar({ onOpenQuickAdd }: SidebarProps) {
  const pathname = usePathname();

  const mainNav = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Transactions", href: "/transactions", icon: Receipt },
    { label: "Reports", href: "/reports", icon: BarChart3 },
  ];

  const managementNav = [
    { label: "Categories", href: "/categories", icon: Tags },
    { label: "Accounts", href: "/accounts", icon: CreditCard },
    { label: "Family", href: "/family", icon: Users },
    { label: "Budgets", href: "/budgets", icon: Target },
  ];

  const bottomNav = [
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface shrink-0 h-screen sticky top-0 overflow-y-auto">
      {/* Brand logo & tagline */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-btn bg-primary text-white font-bold text-sm shadow-sm">
          ₹
        </div>
        <span className="font-bold text-slate-900 tracking-tight text-base">
          Family Finance
        </span>
      </div>

      {/* Quick Add CTA */}
      <div className="p-4 pb-2">
        <button
          onClick={onOpenQuickAdd}
          className="w-full h-11 bg-primary hover:bg-primary-hover text-white rounded-btn font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Main Nav Items */}
      <div className="flex-1 px-3 py-3 space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Main
          </p>
          <div className="space-y-1">
            {mainNav.map((item) => {
              const active = pathname === item.href || (item.href === "/dashboard" && pathname === "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-btn text-sm font-medium transition-colors",
                    active
                      ? "bg-teal-50 text-primary font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-slate-400")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Manage
          </p>
          <div className="space-y-1">
            {managementNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-btn text-sm font-medium transition-colors",
                    active
                      ? "bg-teal-50 text-primary font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-slate-400")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            System
          </p>
          <div className="space-y-1">
            {bottomNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-btn text-sm font-medium transition-colors",
                    active
                      ? "bg-teal-50 text-primary font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-slate-400")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-border text-center">
        <p className="text-[11px] text-slate-400">Family Personal Finance</p>
        <p className="text-[10px] text-slate-400 mt-0.5">v1.0.0 Production Ready</p>
      </div>
    </aside>
  );
}
