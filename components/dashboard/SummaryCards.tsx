"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils/formatters";
import { TrendingUp, TrendingDown, Wallet, CalendarDays, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SummaryCardsProps {
  metrics: {
    totalIncome: number;
    totalExpense: number;
    currentBalance: number;
    todayExpense: number;
  };
}

export function SummaryCards({ metrics }: SummaryCardsProps) {
  const savingsRate =
    metrics.totalIncome > 0
      ? Math.round(((metrics.totalIncome - metrics.totalExpense) / metrics.totalIncome) * 100)
      : 0;

  const balanceHealthy = metrics.currentBalance >= 0;
  const savingsHealthy = savingsRate >= 20;

  return (
    <>
      {/* ── MOBILE: Unified Financial Health Hero (< lg) ── */}
      <div className="lg:hidden rounded-card overflow-hidden shadow-card border border-border bg-gradient-to-br from-primary via-primary-hover to-accent text-primary-foreground">
        <div className="px-5 pt-5 pb-4">
          {/* Balance primary */}
          <p className="text-xs font-semibold opacity-80 mb-0.5 tracking-wide uppercase">
            Total Family Balance
          </p>
          <div className="text-3xl font-bold font-amount tracking-tight">
            {formatCurrency(metrics.currentBalance)}
          </div>
          <p className="text-[11px] opacity-75 mt-0.5">Across all accounts</p>
        </div>

        {/* Three sub-metrics row */}
        <div className="grid grid-cols-3 border-t border-primary-foreground/15">
          <div className="px-4 py-3 border-r border-primary-foreground/15">
            <p className="text-[10px] font-semibold opacity-75 uppercase tracking-wide mb-0.5">
              Today
            </p>
            <div className="text-base font-bold font-amount">
              {formatCurrency(metrics.todayExpense)}
            </div>
            <p className="text-[10px] opacity-70">spent</p>
          </div>

          <div className="px-4 py-3 border-r border-primary-foreground/15">
            <p className="text-[10px] font-semibold opacity-75 uppercase tracking-wide mb-0.5">
              Income
            </p>
            <div className="text-base font-bold font-amount">
              {formatCurrency(metrics.totalIncome)}
            </div>
            <p className="text-[10px] opacity-70">this month</p>
          </div>

          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold opacity-75 uppercase tracking-wide mb-0.5">
              Spent
            </p>
            <div className="text-base font-bold font-amount">
              {formatCurrency(metrics.totalExpense)}
            </div>
            <p className="text-[10px] opacity-70">this month</p>
          </div>
        </div>

        {/* Savings rate strip */}
        <div
          className={cn(
            "flex items-center justify-between px-5 py-2.5 border-t border-primary-foreground/15",
            savingsHealthy ? "bg-black/10" : "bg-black/20"
          )}
        >
          <span className="text-[11px] font-semibold">Monthly Savings Rate</span>
          <span
            className={cn(
              "text-xs font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs",
              savingsHealthy ? "bg-white/20 text-current" : "bg-amber-500/30 text-amber-200"
            )}
          >
            {savingsRate}%{savingsHealthy ? " 👍" : " ⚠️"}
          </span>
        </div>
      </div>

      {/* ── DESKTOP: 4-card grid (≥ lg) ── */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        {/* Balance */}
        <div className="p-4 rounded-card border border-border bg-surface shadow-soft flex flex-col justify-between transition-all hover:shadow-card group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Current Balance</span>
            <div className="w-8 h-8 rounded-btn flex items-center justify-center bg-primary/10 text-primary shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div
              className={cn(
                "text-2xl font-bold font-amount tracking-tight",
                balanceHealthy ? "text-slate-900" : "text-expense"
              )}
            >
              {formatCurrency(metrics.currentBalance)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Across all accounts</p>
          </div>
        </div>

        {/* Today */}
        <div className="p-4 rounded-card border border-border bg-surface shadow-soft flex flex-col justify-between transition-all hover:shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Today&apos;s Spending</span>
            <div className="w-8 h-8 rounded-btn flex items-center justify-center bg-amber-500/10 text-amber-500 shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-amount text-slate-900 tracking-tight">
              {formatCurrency(metrics.todayExpense)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Family expenses today</p>
          </div>
        </div>

        {/* Month Income */}
        <div className="p-4 rounded-card border border-border bg-surface shadow-soft flex flex-col justify-between transition-all hover:shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Month Income</span>
            <div className="w-8 h-8 rounded-btn flex items-center justify-center bg-income/10 text-income shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-amount text-income tracking-tight">
              {formatCurrency(metrics.totalIncome)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Current month earnings</p>
          </div>
        </div>

        {/* Month Expense + savings rate */}
        <div className="p-4 rounded-card border border-border bg-surface shadow-soft flex flex-col justify-between transition-all hover:shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Month Expense</span>
            <div className="w-8 h-8 rounded-btn flex items-center justify-center bg-expense/10 text-expense shrink-0">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold font-amount text-slate-900 tracking-tight">
              {formatCurrency(metrics.totalExpense)}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-[11px] text-slate-400">Current month outflows</p>
              {metrics.totalIncome > 0 && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto",
                    savingsHealthy
                      ? "bg-income/10 text-income"
                      : "bg-warning/10 text-warning"
                  )}
                >
                  {savingsRate}% saved
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
