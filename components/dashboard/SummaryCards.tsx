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
      <div className="lg:hidden rounded-card overflow-hidden shadow-card border border-teal-100 bg-gradient-to-br from-primary via-teal-600 to-teal-500">
        <div className="px-5 pt-5 pb-4">
          {/* Balance primary */}
          <p className="text-xs font-semibold text-teal-100 mb-0.5 tracking-wide uppercase">
            Total Family Balance
          </p>
          <div className="text-3xl font-bold font-amount text-white tracking-tight">
            {formatCurrency(metrics.currentBalance)}
          </div>
          <p className="text-[11px] text-teal-200 mt-0.5">Across all accounts</p>
        </div>

        {/* Three sub-metrics row */}
        <div className="grid grid-cols-3 border-t border-teal-400/30">
          <div className="px-4 py-3 border-r border-teal-400/30">
            <p className="text-[10px] font-semibold text-teal-200 uppercase tracking-wide mb-0.5">
              Today
            </p>
            <div className="text-base font-bold font-amount text-white">
              {formatCurrency(metrics.todayExpense)}
            </div>
            <p className="text-[10px] text-teal-300">spent</p>
          </div>

          <div className="px-4 py-3 border-r border-teal-400/30">
            <p className="text-[10px] font-semibold text-teal-200 uppercase tracking-wide mb-0.5">
              Income
            </p>
            <div className="text-base font-bold font-amount text-emerald-300">
              {formatCurrency(metrics.totalIncome)}
            </div>
            <p className="text-[10px] text-teal-300">this month</p>
          </div>

          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold text-teal-200 uppercase tracking-wide mb-0.5">
              Spent
            </p>
            <div className="text-base font-bold font-amount text-red-300">
              {formatCurrency(metrics.totalExpense)}
            </div>
            <p className="text-[10px] text-teal-300">this month</p>
          </div>
        </div>

        {/* Savings rate strip */}
        <div
          className={cn(
            "flex items-center justify-between px-5 py-2.5 border-t border-teal-400/30",
            savingsHealthy ? "bg-emerald-600/40" : "bg-amber-600/30"
          )}
        >
          <span className="text-[11px] text-white font-semibold">Monthly Savings Rate</span>
          <span
            className={cn(
              "text-xs font-bold px-2.5 py-0.5 rounded-full",
              savingsHealthy ? "bg-emerald-500/50 text-emerald-100" : "bg-amber-500/40 text-amber-100"
            )}
          >
            {savingsRate}%{savingsHealthy ? " 👍" : " ⚠️"}
          </span>
        </div>
      </div>

      {/* ── DESKTOP: 4-card grid (≥ lg) ── */}
      <div className="hidden lg:grid grid-cols-4 gap-4">
        {/* Balance */}
        <div className="p-4 rounded-card border border-teal-100 bg-surface shadow-soft flex flex-col justify-between transition-all hover:shadow-card group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Current Balance</span>
            <div className="w-8 h-8 rounded-btn flex items-center justify-center bg-teal-50 text-primary shrink-0">
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
        <div className="p-4 rounded-card border border-amber-100 bg-surface shadow-soft flex flex-col justify-between transition-all hover:shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Today&apos;s Spending</span>
            <div className="w-8 h-8 rounded-btn flex items-center justify-center bg-amber-50 text-amber-600 shrink-0">
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
        <div className="p-4 rounded-card border border-green-100 bg-surface shadow-soft flex flex-col justify-between transition-all hover:shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Month Income</span>
            <div className="w-8 h-8 rounded-btn flex items-center justify-center bg-green-50 text-income shrink-0">
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
        <div className="p-4 rounded-card border border-red-100 bg-surface shadow-soft flex flex-col justify-between transition-all hover:shadow-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Month Expense</span>
            <div className="w-8 h-8 rounded-btn flex items-center justify-center bg-red-50 text-expense shrink-0">
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
                      ? "bg-green-50 text-income"
                      : "bg-amber-50 text-amber-700"
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
