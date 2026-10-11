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
  IndianRupee,
  Info,
  Globe,
  Upload,
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
    <div className="d-flex flex-column gap-4 mx-auto" style={{ maxWidth: "700px" }}>
      {/* Header */}
      <div>
        <h1 className="h4 fw-bold text-foreground mb-1">
          Settings
        </h1>
        <p className="small text-muted mb-0">
          Branding, profile, preferences, and security
        </p>
      </div>

      {/* Family Branding & Identity Card */}
      <Card>
        <CardHeader>
          <div className="d-flex align-items-center gap-2">
            <Building style={{ width: "16px", height: "16px" }} className="text-primary" />
            <CardTitle>Family Branding &amp; Identity</CardTitle>
          </div>
        </CardHeader>

        <form onSubmit={handleSaveBranding} className="d-flex flex-column gap-3">
          {/* Logo Section */}
          <div>
            <label className="form-label small fw-semibold text-foreground mb-2">
              Project Logo
            </label>
            <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-card border">
              <AppLogo
                size="xl"
                logoUrl={logoPreview || currentUser?.familyLogoUrl}
                name={familyName || currentUser?.familyName}
              />
              <div className="d-flex flex-column gap-1 flex-grow-1 min-vw-0">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoFileSelect}
                    className="d-none"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1.5 shadow-sm small fw-semibold"
                    style={{ cursor: "pointer" }}
                  >
                    <Upload style={{ width: "14px", height: "14px" }} className="text-primary" />
                    <span>{logoPreview ? "Change Logo" : "Upload Logo"}</span>
                  </label>

                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 small fw-semibold"
                    >
                      <Trash2 style={{ width: "14px", height: "14px" }} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="small text-secondary mb-0" style={{ fontSize: "11px" }}>
                  Recommended: Square PNG, SVG or WEBP (Max 5MB).
                </p>
              </div>
            </div>
          </div>

          {/* Family / Project Title */}
          <div>
            <label className="form-label small fw-semibold text-foreground mb-1">
              Family / Project Title *
            </label>
            <input
              required
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="e.g. Sharma Family or Family Finance"
              className="form-control rounded-input small fw-medium"
            />
            <p className="small text-secondary mb-0 mt-1" style={{ fontSize: "11px" }}>
              Displayed in the navigation bar, sidebar, and financial statement exports.
            </p>
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isBrandingLoading}
              className="fw-bold shadow-sm"
            >
              Save Branding
            </Button>
          </div>
        </form>
      </Card>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="d-flex align-items-center justify-content-between w-100">
            <div className="d-flex align-items-center gap-2">
              <User style={{ width: "16px", height: "16px" }} className="text-primary" />
              <CardTitle>Profile Details</CardTitle>
            </div>
            {!isEditingProfile && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingProfile(true)}
                className="small fw-semibold gap-1.5 py-1 px-2.5"
              >
                <Edit3 style={{ width: "14px", height: "14px" }} />
                <span>Edit Profile</span>
              </Button>
            )}
          </div>
        </CardHeader>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="d-flex flex-column gap-3">
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

            <div className="p-3 bg-light rounded-card border small d-flex flex-column gap-1.5">
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-secondary">Family Workspace</span>
                <span className="fw-semibold text-foreground">
                  {familyName || currentUser?.familyName || "Thakar Family's"}
                </span>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-secondary">Access Role</span>
                <span className="fw-semibold text-foreground">
                  {profileRole === "ADMIN" ? "Family Admin" : "Family Member"}
                </span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isProfileSaving}
                className="fw-bold small"
              >
                <Save style={{ width: "14px", height: "14px" }} className="me-1" />
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
                className="small"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="d-flex flex-column small">
            <div className="d-flex align-items-center justify-content-between py-2.5 border-bottom">
              <span className="text-secondary">Full Name</span>
              <span className="fw-semibold text-foreground">
                {profileName || currentUser?.name || "—"}
              </span>
            </div>
            <div className="d-flex align-items-center justify-content-between py-2.5 border-bottom">
              <span className="text-secondary">Email Address</span>
              <span className="fw-semibold text-foreground">
                {profileEmail || currentUser?.email || "—"}
              </span>
            </div>
            <div className="d-flex align-items-center justify-content-between py-2.5 border-bottom">
              <span className="text-secondary">Family Name</span>
              <span className="fw-semibold text-foreground">
                {familyName || currentUser?.familyName || "—"}
              </span>
            </div>
            <div className="d-flex align-items-center justify-content-between py-2.5">
              <span className="text-secondary">Access Role</span>
              <Badge
                variant={profileRole === "ADMIN" ? "info" : "secondary"}
                className="fw-semibold small text-capitalize"
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
          <div className="d-flex align-items-center gap-2">
            <Globe style={{ width: "16px", height: "16px" }} className="text-primary" />
            <CardTitle>Preferences</CardTitle>
          </div>
        </CardHeader>

        <div className="d-flex flex-column small">
          <div className="d-flex align-items-center justify-content-between py-2.5 border-bottom">
            <div>
              <span className="text-foreground fw-medium">Appearance &amp; Theme</span>
              <p className="small text-secondary mb-0 mt-0.5" style={{ fontSize: "11px" }}>
                Switch between Classic, Light, Mix Gradients, and Dark themes
              </p>
            </div>
            <ThemeSelector />
          </div>

          <div className="d-flex align-items-center justify-content-between py-2.5 border-bottom">
            <div>
              <span className="text-foreground fw-medium">Currency</span>
              <p className="small text-secondary mb-0 mt-0.5" style={{ fontSize: "11px" }}>
                Used for all amounts and reports
              </p>
            </div>
            <div className="d-flex align-items-center gap-1.5 text-primary fw-semibold">
              <IndianRupee style={{ width: "16px", height: "16px" }} />
              <span>INR (₹)</span>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between py-2.5">
            <div>
              <span className="text-foreground fw-medium">Date Format</span>
              <p className="small text-secondary mb-0 mt-0.5" style={{ fontSize: "11px" }}>
                Transaction date display
              </p>
            </div>
            <span className="text-foreground fw-semibold">DD MMM YYYY</span>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="d-flex align-items-center gap-2">
            <Shield style={{ width: "16px", height: "16px" }} className="text-primary" />
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>

        <form onSubmit={handlePasswordChange} className="d-flex flex-column gap-3">
          <div>
            <label className="form-label small fw-semibold text-foreground mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              placeholder="••••••••"
              className="form-control rounded-input small"
            />
          </div>

          <div>
            <label className="form-label small fw-semibold text-foreground mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              placeholder="Min 6 characters"
              className="form-control rounded-input small"
            />
          </div>

          <div>
            <label className="form-label small fw-semibold text-foreground mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              placeholder="Repeat new password"
              className="form-control rounded-input small"
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            size="md"
            isLoading={passwordLoading}
            className="fw-semibold align-self-start"
          >
            Update Password
          </Button>
        </form>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <div className="d-flex align-items-center gap-2">
            <Info style={{ width: "16px", height: "16px" }} className="text-primary" />
            <CardTitle>About</CardTitle>
          </div>
        </CardHeader>
        <div className="d-flex flex-column gap-2 small text-secondary">
          <div className="d-flex justify-content-between py-1">
            <span>Application</span>
            <span className="fw-semibold text-foreground">Family Personal Finance Manager</span>
          </div>
          <div className="d-flex justify-content-between py-1">
            <span>Version</span>
            <span className="fw-semibold text-foreground">1.0.0 MVP</span>
          </div>
          <div className="d-flex justify-content-between py-1">
            <span>Stack</span>
            <span className="fw-semibold text-foreground">Next.js · Prisma · MySQL · Bootstrap 5</span>
          </div>
          <div className="d-flex justify-content-between py-1">
            <span>Database</span>
            <span className="fw-semibold text-foreground">TiDB Cloud / MySQL</span>
          </div>
        </div>
      </Card>

      {/* Sign Out */}
      <div className="pt-2">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          type="button"
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 p-3 fw-bold rounded-btn shadow-sm"
        >
          <LogOut style={{ width: "16px", height: "16px" }} />
          <span>Sign Out from Family Account</span>
        </button>
      </div>
    </div>
  );
}
