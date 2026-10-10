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
    <aside 
      className="d-none d-lg-flex flex-column border-end bg-surface flex-shrink-0 vh-100 sticky-top overflow-y-auto"
      style={{ width: "260px" }}
    >
      {/* Brand logo & Family Identity */}
      <Link
        href="/dashboard"
        className="d-flex align-items-center gap-3 px-3 py-3 border-bottom text-decoration-none"
        style={{ minHeight: "64px" }}
        title="Go to Dashboard"
      >
        <AppLogo
          size="md"
          logoUrl={user?.familyLogoUrl}
          name={user?.familyName || "Family Finance"}
        />
        <div className="d-flex flex-column overflow-hidden justify-content-center">
          <div className="d-flex align-items-center gap-1 overflow-hidden">
            <span className="fw-bold text-dark small text-truncate">
              {user?.familyName || "Family Finance"}
            </span>
            {user?.role === "ADMIN" && (
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill py-0 px-1" style={{ fontSize: "9px" }}>
                Admin
              </span>
            )}
          </div>
          <span className="text-secondary small text-truncate" style={{ fontSize: "11px" }}>
            Family Finance
          </span>
        </div>
      </Link>

      {/* Main Nav Items */}
      <div className="flex-grow-1 px-3 py-3 overflow-y-auto d-flex flex-column gap-4">
        <div>
          <p className="px-2 small fw-bold text-secondary text-uppercase mb-1" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
            Main
          </p>
          <div className="d-flex flex-column gap-1">
            {mainNav.map((item) => {
              const active = pathname === item.href || (item.href === "/dashboard" && pathname === "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "d-flex align-items-center gap-3 px-3 py-2 rounded-btn small text-decoration-none transition",
                    active
                      ? "bg-primary bg-opacity-10 text-primary fw-bold"
                      : "text-secondary hover-bg-light"
                  )}
                >
                  <Icon style={{ width: "16px", height: "16px" }} className={active ? "text-primary" : "text-secondary"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-2 small fw-bold text-secondary text-uppercase mb-1" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
            Manage
          </p>
          <div className="d-flex flex-column gap-1">
            {managementNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "d-flex align-items-center gap-3 px-3 py-2 rounded-btn small text-decoration-none transition",
                    active
                      ? "bg-primary bg-opacity-10 text-primary fw-bold"
                      : "text-secondary hover-bg-light"
                  )}
                >
                  <Icon style={{ width: "16px", height: "16px" }} className={active ? "text-primary" : "text-secondary"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-2 small fw-bold text-secondary text-uppercase mb-1" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
            System
          </p>
          <div className="d-flex flex-column gap-1">
            {bottomNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "d-flex align-items-center gap-3 px-3 py-2 rounded-btn small text-decoration-none transition",
                    active
                      ? "bg-primary bg-opacity-10 text-primary fw-bold"
                      : "text-secondary hover-bg-light"
                  )}
                >
                  <Icon style={{ width: "16px", height: "16px" }} className={active ? "text-primary" : "text-secondary"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="p-3 border-top text-center mt-auto">
        <p className="text-secondary small mb-0" style={{ fontSize: "11px" }}>Family Personal Finance</p>
        <p className="text-secondary small mb-0 mt-1" style={{ fontSize: "10px" }}>v1.0.0 Production Ready</p>
      </div>
    </aside>
  );
}
