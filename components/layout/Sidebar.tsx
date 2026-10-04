"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Tags,
  CreditCard,
  Users,
  Target,
  Settings,
  Repeat,
  FileSpreadsheet,
  HandCoins,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AppLogo } from "@/components/ui/AppLogo";

interface SidebarProps {
  onOpenQuickAdd?: () => void;
}

export function Sidebar({ onOpenQuickAdd }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

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
    { label: "Recurring", href: "/recurring", icon: Repeat },
    { label: "Splits & Settle", href: "/splits", icon: HandCoins },
    { label: "Import Statement", href: "/import", icon: FileSpreadsheet },
  ];

  const bottomNav = [
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-surface shrink-0 h-screen sticky top-0 overflow-y-auto">
      {/* Brand logo & Family Identity */}
      <Link
        href="/dashboard"
        className="h-16 px-5 flex items-center gap-3 border-b border-border hover:bg-slate-50/80 transition-colors"
        title="Go to Dashboard"
      >
        <AppLogo
          size="md"
          logoUrl={user?.familyLogoUrl}
          name={user?.familyName || "Family Finance"}
        />
        <div className="flex flex-col min-w-0 justify-center">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-slate-900 tracking-tight text-sm truncate">
              {user?.familyName || "Family Finance"}
            </span>
            {user?.role === "ADMIN" && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0 leading-none">
                Admin
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400 font-medium truncate mt-0.5">
            Family Finance
          </span>
        </div>
      </Link>

      {/* Main Nav Items */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
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
                      ? "bg-primary/10 text-primary font-semibold"
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
                      ? "bg-primary/10 text-primary font-semibold"
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
                      ? "bg-primary/10 text-primary font-semibold"
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
