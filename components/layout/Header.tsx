"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AppLogo } from "@/components/ui/AppLogo";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

interface HeaderProps {
  onOpenQuickAdd?: () => void;
}

export function Header({ onOpenQuickAdd }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <header 
      className="navbar bg-surface border-bottom px-2.5 px-sm-4 py-2 d-flex align-items-center justify-content-between flex-shrink-0"
      style={{ zIndex: 1030, minHeight: "56px", backdropFilter: "blur(10px)" }}
    >
      {/* Mobile Only: Brand & Family Name */}
      <div className="d-lg-none d-flex align-items-center gap-2 me-1 overflow-hidden flex-shrink-1">
        <AppLogo
          size="sm"
          logoUrl={user?.familyLogoUrl}
          name={user?.familyName || "Family Finance"}
        />
        <div className="overflow-hidden">
          <div className="d-flex align-items-center gap-1">
            <span className="fw-bold text-foreground small text-truncate">
              {user?.familyName || "Family Finance"}
            </span>
            {user?.role === "ADMIN" && (
              <Badge variant="info" className="py-0 px-1 gap-1 flex-shrink-0" style={{ fontSize: "9px" }}>
                <Shield style={{ width: "9px", height: "9px" }} /> Admin
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Actions & Profile (pinned right) */}
      <div className="d-flex align-items-center gap-1.5 gap-sm-2.5 ms-auto flex-shrink-0">
        {onOpenQuickAdd && (
          <Button
            size="sm"
            onClick={onOpenQuickAdd}
            className="d-none d-sm-inline-flex shadow-sm btn-primary small fw-semibold px-3 py-1 gap-2"
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            <span>Add Transaction</span>
          </Button>
        )}

        {/* Dynamic Multi-Color Theme Selector */}
        <ThemeSelector />

        <div className="d-flex align-items-center gap-1.5 ps-1.5 border-start">
          <div 
            className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center border border-primary border-opacity-25"
            style={{ width: "32px", height: "32px", fontSize: "12px" }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="d-none d-md-block text-start">
            <p className="small fw-semibold text-foreground mb-0 lh-1">
              {user?.name || "Member"}
            </p>
            <p className="text-secondary mb-0 lh-1 mt-1" style={{ fontSize: "10px" }}>
              {user?.role === "ADMIN" ? "Family Admin" : "Member"}
            </p>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Log Out"
            type="button"
            className="btn btn-sm btn-ghost rounded-circle p-1.5 text-secondary"
            aria-label="Log Out"
          >
            <LogOut style={{ width: "16px", height: "16px" }} />
          </button>
        </div>
      </div>
    </header>
  );
}
