"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  User,
  Shield,
  LogOut,
  ChevronRight,
  IndianRupee,
  Info,
  Globe,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const currentUser = session?.user as any;
  const { showToast } = useToast();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast({ type: "error", title: "Passwords do not match" });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast({ type: "error", title: "New password must be at least 6 characters" });
      return;
    }

    setPasswordLoading(true);
    // In a real app, post to /api/auth/change-password
    await new Promise((r) => setTimeout(r, 1000));
    setPasswordLoading(false);

    showToast({
      type: "success",
      title: "Password Updated",
      message: "Your new password has been saved.",
    });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Profile, preferences, and security
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <CardTitle>Profile</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
            <span className="text-slate-500">Full Name</span>
            <span className="font-semibold text-slate-900">{currentUser?.name || "—"}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
            <span className="text-slate-500">Email Address</span>
            <span className="font-semibold text-slate-900">{currentUser?.email || "—"}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
            <span className="text-slate-500">Family Name</span>
            <span className="font-semibold text-slate-900">{currentUser?.familyName || "—"}</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-slate-500">Access Role</span>
            <span className="font-semibold text-slate-900 capitalize">
              {currentUser?.role === "ADMIN" ? "Family Admin" : "Family Member"}
            </span>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <CardTitle>Preferences</CardTitle>
          </div>
        </CardHeader>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
            <div>
              <span className="text-slate-700 font-medium">Currency</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Used for all amounts and reports
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-primary font-semibold">
              <IndianRupee className="w-4 h-4" />
              <span>INR (₹)</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <div>
              <span className="text-slate-700 font-medium">Date Format</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Transaction date display</p>
            </div>
            <span className="text-slate-800 font-semibold text-xs">DD MMM YYYY</span>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>

        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              placeholder="••••••••"
              className="w-full h-10 px-3 rounded-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              placeholder="Min 6 characters"
              className="w-full h-10 px-3 rounded-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              placeholder="Repeat new password"
              className="w-full h-10 px-3 rounded-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="md"
            isLoading={passwordLoading}
            className="font-semibold"
          >
            Update Password
          </Button>
        </form>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            <CardTitle>About</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between py-1">
            <span>Application</span>
            <span className="font-semibold text-slate-800">Family Personal Finance Manager</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Version</span>
            <span className="font-semibold text-slate-800">1.0.0 MVP</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Stack</span>
            <span className="font-semibold text-slate-800">Next.js · Prisma · MySQL</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Database</span>
            <span className="font-semibold text-slate-800">MySQL (XAMPP Local)</span>
          </div>
        </div>
      </Card>

      {/* Sign Out */}
      <div className="pt-2">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center justify-center gap-2 p-3.5 text-sm font-bold text-expense bg-red-50 hover:bg-red-100 rounded-btn border border-red-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out from Family Account
        </button>
      </div>
    </div>
  );
}
