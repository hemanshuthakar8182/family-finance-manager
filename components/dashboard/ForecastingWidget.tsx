"use client";

import React from "react";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import {
  TrendingUp,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Flame,
  PiggyBank,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ForecastingWidgetProps {
  totalExpense: number;
  totalIncome: number;
  currentBalance: number;
}

export function ForecastingWidget({
  totalExpense,
  totalIncome,
  currentBalance,
}: ForecastingWidgetProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const dayOfMonth = Math.max(1, now.getDate());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysRemaining = Math.max(0, daysInMonth - dayOfMonth);
  const monthPercentElapsed = Math.min(100, Math.round((dayOfMonth / daysInMonth) * 100));

  // Daily burn calculations
  const dailyBurnRate = totalExpense > 0 ? totalExpense / dayOfMonth : 0;
  const projectedRemainingExpense = dailyBurnRate * daysRemaining;
  const projectedMonthTotalExpense = totalExpense + projectedRemainingExpense;
  const projectedClosingBalance = currentBalance - projectedRemainingExpense;

  // Safe daily budget cap
  const safeDailyBudget =
    daysRemaining > 0 ? Math.max(0, currentBalance / daysRemaining) : currentBalance;

  // Health assessment
  const isHealthyPace = projectedClosingBalance >= 0;
  const isThrivingPace =
    totalIncome > 0 && projectedMonthTotalExpense <= totalIncome * 0.8;

  return (
    <div className="card-elevated p-3.5 p-sm-4 bg-surface position-relative overflow-hidden">
      {/* Top Banner Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary flex-shrink-0"
            style={{ width: "32px", height: "32px" }}
          >
            <Sparkles style={{ width: "16px", height: "16px" }} />
          </div>
          <div>
            <h3 className="h6 fw-bold text-foreground mb-0 d-flex align-items-center gap-2">
              <span>Smart Cashflow Forecast</span>
              <span className="badge rounded-pill bg-light border text-secondary fw-semibold" style={{ fontSize: "10px" }}>
                AI Model
              </span>
            </h3>
            <p className="small text-secondary mb-0" style={{ fontSize: "11px" }}>
              Day {dayOfMonth} of {daysInMonth} ({daysRemaining} days left in {now.toLocaleString("en-US", { month: "short" })})
            </p>
          </div>
        </div>

        {/* Overall Status Badge */}
        <div>
          <span
            className={cn(
              "badge rounded-pill d-inline-flex align-items-center gap-1.5 py-1.5 px-3 fw-bold",
              isThrivingPace
                ? "bg-success-subtle text-success border border-success-subtle"
                : isHealthyPace
                ? "bg-primary-subtle text-primary border border-primary-subtle"
                : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
            )}
            style={{ fontSize: "11px" }}
          >
            {isThrivingPace ? (
              <>
                <ShieldCheck style={{ width: "14px", height: "14px" }} />
                <span>Optimal Savings Pace</span>
              </>
            ) : isHealthyPace ? (
              <>
                <ShieldCheck style={{ width: "14px", height: "14px" }} />
                <span>Positive Cashflow</span>
              </>
            ) : (
              <>
                <AlertTriangle style={{ width: "14px", height: "14px" }} />
                <span>Watch Spending Pace</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 3 Smart Predictive KPI Columns */}
      <div className="row g-2.5">
        {/* Metric 1: Current Daily Burn Rate */}
        <div className="col-12 col-md-4">
          <div className="p-3 rounded-card bg-light border d-flex flex-column justify-content-between h-100">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="small fw-semibold text-secondary" style={{ fontSize: "11px" }}>
                Current Daily Burn
              </span>
              <Flame style={{ width: "15px", height: "15px" }} className="text-warning" />
            </div>
            <div>
              <CurrencyDisplay amount={dailyBurnRate} size="md" />
              <span className="small text-secondary ms-1" style={{ fontSize: "11px" }}>
                / day
              </span>
            </div>
            <p className="small text-secondary mb-0 mt-1" style={{ fontSize: "10px" }}>
              Averaged over {dayOfMonth} days
            </p>
          </div>
        </div>

        {/* Metric 2: Projected Month-End Balance */}
        <div className="col-12 col-md-4">
          <div className="p-3 rounded-card bg-light border d-flex flex-column justify-content-between h-100">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="small fw-semibold text-secondary" style={{ fontSize: "11px" }}>
                Projected Month-End Balance
              </span>
              <PiggyBank style={{ width: "15px", height: "15px" }} className="text-primary" />
            </div>
            <div>
              <CurrencyDisplay
                amount={projectedClosingBalance}
                size="md"
                type={projectedClosingBalance >= 0 ? "DEFAULT" : "EXPENSE"}
              />
            </div>
            <p className="small text-secondary mb-0 mt-1" style={{ fontSize: "10px" }}>
              Estimated balance on day {daysInMonth}
            </p>
          </div>
        </div>

        {/* Metric 3: Safe Daily Budget */}
        <div className="col-12 col-md-4">
          <div className="p-3 rounded-card bg-light border d-flex flex-column justify-content-between h-100">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="small fw-semibold text-secondary" style={{ fontSize: "11px" }}>
                Safe Spending Cap
              </span>
              <Calendar style={{ width: "15px", height: "15px" }} className="text-success" />
            </div>
            <div>
              <CurrencyDisplay amount={safeDailyBudget} size="md" />
              <span className="small text-secondary ms-1" style={{ fontSize: "11px" }}>
                / day
              </span>
            </div>
            <p className="small text-secondary mb-0 mt-1" style={{ fontSize: "10px" }}>
              Daily allowance for next {daysRemaining} days
            </p>
          </div>
        </div>
      </div>

      {/* Month Progress Strip */}
      <div className="mt-3 pt-2.5 border-top d-flex align-items-center gap-3">
        <span className="small fw-semibold text-secondary flex-shrink-0" style={{ fontSize: "11px" }}>
          Month Elapsed: {monthPercentElapsed}%
        </span>
        <div className="progress flex-grow-1 bg-light rounded-pill" style={{ height: "6px" }}>
          <div
            className="progress-bar rounded-pill bg-primary"
            style={{ width: `${monthPercentElapsed}%` }}
          />
        </div>
        <span className="small text-secondary flex-shrink-0" style={{ fontSize: "11px" }}>
          {daysRemaining}d remaining
        </span>
      </div>
    </div>
  );
}
