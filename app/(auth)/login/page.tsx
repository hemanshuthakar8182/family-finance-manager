"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Shield, Users } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-vh-100 bg-light d-flex flex-column justify-content-center py-4 px-3">
      <div className="mx-auto w-100 text-center mb-4" style={{ maxWidth: "420px" }}>
        {/* Brand emblem */}
        <div 
          className="rounded-4 bg-primary text-white fw-bold fs-3 d-flex align-items-center justify-content-center mx-auto shadow-sm"
          style={{ width: "56px", height: "56px" }}
        >
          ₹
        </div>
        <h2 className="mt-3 fs-4 fw-bold text-dark mb-1">
          Sign In to Your Family
        </h2>
        <p className="text-secondary small mb-0">
          Shared daily expense & finance management for households
        </p>
      </div>

      <div className="mx-auto w-100" style={{ maxWidth: "420px" }}>
        <div className="card rounded-card border shadow-sm p-4 bg-surface">
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

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

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
                  className="btn btn-sm btn-light border text-start p-2 w-100 rounded-btn transition"
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
                  className="btn btn-sm btn-light border text-start p-2 w-100 rounded-btn transition"
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

          <div className="mt-3 text-center small text-secondary">
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
