"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { AppLogo } from "@/components/ui/AppLogo";
import { ThemeSelector } from "@/components/theme/ThemeSelector";
import {
  User,
  Shield,
  LogOut,
  ChevronRight,
  IndianRupee,
  Info,
  Globe,
  Upload,
  Sparkles,
  Building,
  Trash2,
  Edit3,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const currentUser = session?.user as any;
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Branding state
  const [familyName, setFamilyName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isBrandingLoading, setIsBrandingLoading] = useState(false);

  // User profile state
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileRole, setProfileRole] = useState("ADMIN");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  useEffect(() => {
    if (currentUser?.familyName && !familyName) {
      setFamilyName(currentUser.familyName);
    }
    if (currentUser?.familyLogoUrl && !logoUrl) {
      setLogoUrl(currentUser.familyLogoUrl);
      setLogoPreview(currentUser.familyLogoUrl);
    }

    // Fetch freshest family branding from database
    fetch("/api/family")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.name) {
          setFamilyName(data.name);
          setLogoUrl(data.logoUrl || null);
          setLogoPreview(data.logoUrl || null);
          // Sync session if there is any mismatch
          if (
            update &&
            (currentUser?.familyName !== data.name ||
              currentUser?.familyLogoUrl !== data.logoUrl ||
              currentUser?.familyId !== data.id)
          ) {
            update({
              familyId: data.id,
              familyName: data.name,
              familyLogoUrl: data.logoUrl,
            });
          }
        }
      })
      .catch((err) => console.error("Failed to load family data:", err));

    // Fetch freshest user profile from database
    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.name) {
          setProfileName(data.name);
          setProfileEmail(data.email || "");
          setProfileRole(data.role || "ADMIN");
          if (
            update &&
            (currentUser?.name !== data.name || currentUser?.email !== data.email)
          ) {
            update({
              name: data.name,
              email: data.email,
            });
          }
        }
      })
      .catch((err) => console.error("Failed to load user profile:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showToast({ type: "error", title: "Full name is required" });
      return;
    }

    setIsProfileSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName.trim(),
          email: profileEmail.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      if (update) {
        await update({
          name: data.user.name,
          email: data.user.email,
        });
      }

      setIsEditingProfile(false);
      showToast({
        type: "success",
        title: "Profile Saved",
        message: "Your profile details have been updated successfully.",
      });
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: "error", title: "Image size must be under 5MB" });
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) {
      showToast({ type: "error", title: "Family name is required" });
      return;
    }

    setIsBrandingLoading(true);
    try {
      let finalLogoUrl = logoUrl;

      if (logoFile) {
        const uploadData = new FormData();
        uploadData.append("file", logoFile);
        const uploadRes = await fetch("/api/upload/logo", {
          method: "POST",
          body: uploadData,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadJson.error || "Failed to upload logo image");
        finalLogoUrl = uploadJson.url;
      }

      const res = await fetch("/api/family", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: familyName.trim(),
          logoUrl: finalLogoUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update family branding");

      // Update client-side session immediately with returned database values
      if (update) {
        await update({
          familyId: data.id,
          familyName: data.name,
          familyLogoUrl: data.logoUrl,
        });
      }

      setFamilyName(data.name);
      setLogoUrl(data.logoUrl);
      setLogoPreview(data.logoUrl);
      setLogoFile(null);

      showToast({
        type: "success",
        title: "Branding Saved",
        message: "Family logo & title updated across the application.",
      });
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    } finally {
      setIsBrandingLoading(false);
    }
  };

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
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      showToast({
        type: "success",
        title: "Password Updated",
        message: "Your new password has been saved.",
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Error",
        message: err.message,
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Branding, profile, preferences, and security
        </p>
      </div>

      {/* Family Branding & Identity Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            <CardTitle>Family Branding &amp; Identity</CardTitle>
          </div>
        </CardHeader>

        <form onSubmit={handleSaveBranding} className="space-y-4">
          {/* Logo Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Project Logo
            </label>
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-card border border-border/80">
              <AppLogo
                size="xl"
                logoUrl={logoPreview || currentUser?.familyLogoUrl}
                name={familyName || currentUser?.familyName}
              />
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoFileSelect}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-white border border-border text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    <span>{logoPreview ? "Change Logo" : "Upload Logo"}</span>
                  </label>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-btn text-xs font-semibold text-expense hover:bg-red-50 border border-red-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Recommended: Square PNG, SVG or WEBP (Max 5MB).
                </p>
              </div>
            </div>
          </div>

          {/* Family / Project Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Family / Project Title *
            </label>
            <input
              required
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g. Sharma Family or Family Finance"
              className="w-full h-11 px-3 rounded-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Displayed in the navigation bar, sidebar, and financial statement exports.
            </p>
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isBrandingLoading}
              className="font-bold shadow-xs"
            >
              Save Branding
            </Button>
          </div>
        </form>
      </Card>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <CardTitle>Profile Details</CardTitle>
            </div>
            {!isEditingProfile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingProfile(true)}
                className="text-xs font-semibold gap-1.5 py-1 px-2.5 h-8"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Button>
            )}
          </div>
        </CardHeader>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <Input
              label="Full Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. Hemanshu Thakar"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              placeholder="e.g. hemanshuthakar8182@gmail.com"
              required
            />

            <div className="p-3 bg-surface-muted rounded-card border border-border/80 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Family Workspace</span>
                <span className="font-semibold text-slate-800">
                  {familyName || currentUser?.familyName || "Thakar Family's"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Access Role</span>
                <span className="font-semibold text-slate-800">
                  {profileRole === "ADMIN" ? "Family Admin" : "Family Member"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isProfileSaving}
                className="font-bold text-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save Changes
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setProfileName(currentUser?.name || "");
                  setProfileEmail(currentUser?.email || "");
                  setIsEditingProfile(false);
                }}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <span className="text-slate-500">Full Name</span>
              <span className="font-semibold text-slate-900">
                {profileName || currentUser?.name || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <span className="text-slate-500">Email Address</span>
              <span className="font-semibold text-slate-900">
                {profileEmail || currentUser?.email || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-border">
              <span className="text-slate-500">Family Name</span>
              <span className="font-semibold text-slate-900">
                {familyName || currentUser?.familyName || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-slate-500">Access Role</span>
              <Badge
                variant={profileRole === "ADMIN" ? "info" : "secondary"}
                className="font-semibold text-xs capitalize"
              >
                {profileRole === "ADMIN" ? "Family Admin" : "Family Member"}
              </Badge>
            </div>
          </div>
        )}
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
              <span className="text-slate-700 font-medium">Appearance & Theme</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Switch between Classic, Light, Mix Gradients, and Dark themes
              </p>
            </div>
            <ThemeSelector />
          </div>

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
