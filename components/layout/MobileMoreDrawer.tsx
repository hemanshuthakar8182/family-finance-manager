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
  Repeat,
  FileSpreadsheet,
  HandCoins,
  Palette,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

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
      label: "Recurring",
      href: "/recurring",
      icon: Repeat,
      desc: "Manage automated recurring bills & subscriptions",
    },
    {
      label: "Splits & Settle",
      href: "/splits",
      icon: HandCoins,
      desc: "Shared household bills & member balances",
    },
    {
      label: "Import Statement",
      href: "/import",
      icon: FileSpreadsheet,
      desc: "Upload CSV or Excel bank statement",
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
      <div className="d-flex flex-column gap-2 py-1">
        {/* Quick Theme Selector Row */}
        <div className="d-flex align-items-center justify-content-between p-3 rounded-card border bg-surface">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="rounded-btn d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary"
              style={{ width: "38px", height: "38px" }}
            >
              <Palette style={{ width: "20px", height: "20px" }} />
            </div>
            <div className="text-start">
              <p className="small fw-bold text-dark mb-0">Appearance Theme</p>
              <p className="small text-secondary mb-0" style={{ fontSize: "11px" }}>Pick system accent & dark mode</p>
            </div>
          </div>
          <ThemeSelector />
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`d-flex align-items-center justify-content-between p-3 rounded-card border text-decoration-none transition ${
                active
                  ? "bg-primary-subtle border-primary-subtle text-primary"
                  : "bg-surface hover-bg-light text-dark"
              }`}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className={`rounded-btn d-flex align-items-center justify-content-center ${
                    active ? "bg-primary text-white" : "bg-light text-secondary"
                  }`}
                  style={{ width: "38px", height: "38px" }}
                >
                  <Icon style={{ width: "20px", height: "20px" }} />
                </div>
                <div className="text-start">
                  <p className="small fw-bold mb-0">{item.label}</p>
                  <p className="small text-secondary mb-0" style={{ fontSize: "11px" }}>{item.desc}</p>
                </div>
              </div>
              <ChevronRight style={{ width: "16px", height: "16px" }} className="text-secondary" />
            </Link>
          );
        })}

        <div className="pt-3 border-top mt-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            type="button"
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 p-3 rounded-btn fw-bold small"
          >
            <LogOut style={{ width: "16px", height: "16px" }} />
            <span>Sign Out from Family</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
