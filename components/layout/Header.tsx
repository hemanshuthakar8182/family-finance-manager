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
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-surface/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile Only: Brand & Family Name (hidden on desktop since sidebar shows it) */}
      <div className="lg:hidden flex items-center gap-3">
        <AppLogo
          size="sm"
          logoUrl={user?.familyLogoUrl}
          name={user?.familyName || "Family Finance"}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight text-sm">
              {user?.familyName || "Family Finance"}
            </span>
            {user?.role === "ADMIN" && (
              <Badge variant="info" className="text-[10px] py-0 px-1.5 gap-0.5">
                <Shield className="w-2.5 h-2.5" /> Admin
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-slate-500">
            Shared Family Financial Assistant
          </p>
        </div>
      </div>

      {/* Actions & Profile (pinned right) */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {onOpenQuickAdd && (
          <Button
            size="sm"
            onClick={onOpenQuickAdd}
            className="shadow-sm bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}

        {/* Dynamic Multi-Color Theme Selector */}
        <ThemeSelector />

        <div className="flex items-center gap-2 pl-2 border-l border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center text-xs border border-primary/25">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                {user?.name || "Member"}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                {user?.role === "ADMIN" ? "Family Admin" : "Member"}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Log Out"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-surface-muted transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
