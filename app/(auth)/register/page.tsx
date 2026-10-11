"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !familyName || !email || !password) {
      setError("Please complete all required fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          familyName: familyName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create family account");
      }

      // Automatically sign in upon registration
      const signInRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
          Set Up Your Family Space
        </h2>
        <p className="text-secondary small mb-0">
          Create your household finance workspace in under 30 seconds
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
              label="Family / Household Name"
              placeholder="e.g. Sharma Family, Verma Household"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              required
            />

            <Input
              label="Your Full Name"
              placeholder="e.g. Himanshu Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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
                Password (min 6 characters)
              </label>
              <div className="position-relative d-flex align-items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
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
              Create Family Space
            </Button>
          </form>

          <div className="mt-3.5 text-center small text-secondary">
            Already have a family registered?{" "}
            <Link
              href="/login"
              className="fw-bold text-primary text-decoration-none"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
