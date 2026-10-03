"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Tags,
  CreditCard,
  Users,
  Target,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  HelpCircle,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface MobileMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMoreDrawer({ isOpen, onClose }: MobileMoreDrawerProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Categories",
      href: "/categories",
      icon: Tags,
      desc: "Manage family expense & income categories",
    },
    {
      label: "Accounts",
      href: "/accounts",
      icon: CreditCard,
      desc: "Bank accounts, UPI wallets & cards",
    },
    {
      label: "Family Members",
      href: "/family",
      icon: Users,
      desc: "Invite and manage family members",
    },
    {
      label: "Budgets",
      href: "/budgets",
      icon: Target,
      desc: "Category monthly spending limits",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      desc: "Preferences, currency, security",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="More Options"
      description="Family management and application settings"
      maxWidth="md"
    >
      <div className="space-y-2 py-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between p-3 rounded-card border transition-all ${
                active
                  ? "bg-teal-50 border-teal-200 text-primary"
                  : "bg-surface border-border hover:bg-slate-50 text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-btn flex items-center justify-center ${
                    active ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          );
        })}

        <div className="pt-3 border-t border-slate-100 mt-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center gap-2 p-3 text-sm font-semibold text-expense bg-red-50 hover:bg-red-100 rounded-btn transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from Family</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
