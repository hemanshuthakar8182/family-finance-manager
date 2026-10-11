"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Shield, Users, Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("hemanshu@8182");
    setError("");
  };

  return (
    <div className="min-vh-100 bg-background d-flex flex-column justify-content-center py-5 px-3 position-relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div
        className="position-absolute top-0 start-50 translate-middle-x rounded-circle"
        style={{
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(var(--primary-rgb), 0.12) 0%, rgba(var(--primary-rgb), 0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="mx-auto w-100 text-center mb-4 position-relative" style={{ maxWidth: "420px" }}>
        {/* Brand emblem */}
        <div 
          className="rounded-4 bg-primary text-white fw-bold fs-3 d-flex align-items-center justify-content-center mx-auto shadow-sm"
          style={{
            width: "58px",
            height: "58px",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)",
          }}
        >
          ₹
        </div>
        <h2 className="mt-3 fs-4 fw-bold text-foreground mb-1">
          Sign In to Your Family
        </h2>
        <p className="text-secondary small mb-0">
          Shared daily expense &amp; finance management for households
        </p>
      </div>

      <div className="mx-auto w-100 position-relative" style={{ maxWidth: "420px" }}>
        <div className="card-elevated p-4 p-sm-4.5 bg-surface shadow-card">
          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            {error && (
              <div className="p-2.5 rounded-btn bg-danger-subtle border border-danger-subtle text-danger small fw-semibold">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@family.local"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <label className="form-label small fw-semibold text-foreground mb-1">
                Password
              </label>
              <div className="position-relative d-flex align-items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-control rounded-input small pe-5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn-sm btn-link position-absolute end-0 me-2 text-secondary p-0 text-decoration-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: "16px", height: "16px" }} />
                  ) : (
                    <Eye style={{ width: "16px", height: "16px" }} />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-100 fw-bold shadow-sm mt-1"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins for Pair Programming/Review */}
          <div className="mt-4 pt-3 border-top">
            <p className="small text-secondary text-uppercase fw-bold mb-2 text-center" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
              Quick Family Access
            </p>
            <div className="row g-2">
              <div className="col-6">
                <button
                  type="button"
                  onClick={() => handleFillDemo("hemanshuthakar8182@gmail.com")}
                  className="btn btn-sm btn-light border text-start p-2.5 w-100 rounded-btn hover-lift"
                >
                  <div className="d-flex align-items-center gap-1.5 small fw-bold text-primary">
                    <Shield style={{ width: "14px", height: "14px" }} />
                    <span>Admin</span>
                  </div>
                  <p className="text-secondary small mb-0 mt-0.5 text-truncate" style={{ fontSize: "10px" }}>
                    hemanshuthakar8182...
                  </p>
                </button>
              </div>

              <div className="col-6">
                <button
                  type="button"
                  onClick={() => handleFillDemo("heenathakar8182@gmail.com")}
                  className="btn btn-sm btn-light border text-start p-2.5 w-100 rounded-btn hover-lift"
                >
                  <div className="d-flex align-items-center gap-1.5 small fw-bold text-dark">
                    <Users style={{ width: "14px", height: "14px" }} />
                    <span>Member</span>
                  </div>
                  <p className="text-secondary small mb-0 mt-0.5 text-truncate" style={{ fontSize: "10px" }}>
                    heenathakar8182...
                  </p>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3.5 text-center small text-secondary">
            Don&apos;t have a family account yet?{" "}
            <Link
              href="/register"
              className="fw-bold text-primary text-decoration-none"
            >
              Create Family
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
