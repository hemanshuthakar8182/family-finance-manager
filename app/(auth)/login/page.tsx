"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Shield, Sparkles, Users } from "lucide-react";

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
    setPassword("password123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand emblem */}
        <div className="w-14 h-14 rounded-2xl bg-primary text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
          ₹
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign In to Your Family
        </h2>
        <p className="mt-1 text-center text-xs sm:text-sm text-slate-500">
          Shared daily expense & finance management for households
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-7 px-5 sm:px-8 rounded-card border border-border shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-btn bg-red-50 border border-red-200 text-xs font-medium text-expense">
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
              className="w-full font-bold shadow-sm"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins for Pair Programming/Review */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo("himanshu@family.local")}
                className="p-2.5 rounded-btn border border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  himanshu@family.local
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo("priya@family.local")}
                className="p-2.5 rounded-btn border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Users className="w-3.5 h-3.5" />
                  <span>Member Login</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  priya@family.local
                </p>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Default password: <span className="font-mono">password123</span>
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don&apos;t have a family account yet?{" "}
            <Link
              href="/register"
              className="font-bold text-primary hover:underline underline-offset-2"
            >
              Create Family
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
