"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Plus, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface HeaderProps {
  onOpenQuickAdd?: () => void;
}

export function Header({ onOpenQuickAdd }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-surface/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Family Name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-btn bg-primary text-white font-bold text-base shadow-sm">
          ₹
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">
              {user?.familyName || "Family Finance"}
            </span>
            {user?.role === "ADMIN" && (
              <Badge variant="info" className="hidden sm:inline-flex text-[10px] py-0 px-1.5 gap-0.5">
                <Shield className="w-2.5 h-2.5" /> Admin
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Shared Family Financial Assistant
          </p>
        </div>
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onOpenQuickAdd && (
          <Button
            size="sm"
            onClick={onOpenQuickAdd}
            className="hidden sm:inline-flex shadow-sm bg-primary hover:bg-primary-hover text-white text-xs font-semibold px-3 py-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Transaction
          </Button>
        )}

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs border border-teal-200">
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
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
