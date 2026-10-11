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
    <div className="card-elevated p-3.5 p-sm-4 bg-surface position-relative overflow-hidden border">
      {/* Top Banner Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-3.5">
        <div className="d-flex align-items-center gap-2.5">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center bg-primary-soft flex-shrink-0 shadow-xs"
            style={{ width: "36px", height: "36px" }}
          >
            <Sparkles style={{ width: "18px", height: "18px" }} />
          </div>
          <div>
            <h3 className="h6 fw-bold text-foreground mb-0 d-flex align-items-center gap-2">
              <span>Smart Cashflow Forecast</span>
              <span className="badge rounded-pill bg-primary-soft fw-semibold px-2 py-0.5" style={{ fontSize: "10px" }}>
                AI Model
              </span>
            </h3>
            <p className="small text-secondary mb-0" style={{ fontSize: "11px" }}>
              Day {dayOfMonth} of {daysInMonth} &bull; {daysRemaining} days remaining in {now.toLocaleString("en-US", { month: "long" })}
            </p>
          </div>
        </div>

        {/* Overall Status Badge */}
        <div>
          <span
            className={cn(
              "badge rounded-pill d-inline-flex align-items-center gap-1.5 py-1.5 px-3 fw-bold shadow-xs",
              isThrivingPace
                ? "bg-success-soft"
                : isHealthyPace
                ? "bg-primary-soft"
                : "bg-warning-soft"
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
      <div className="row g-3">
        {/* Metric 1: Current Daily Burn Rate */}
        <div className="col-12 col-md-4">
          <div className="p-3 rounded-card bg-surface border shadow-xs hover-lift d-flex flex-column justify-content-between h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-semibold text-secondary" style={{ fontSize: "11px", letterSpacing: "0.02em" }}>
                Current Daily Burn
              </span>
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center bg-warning-soft flex-shrink-0"
                style={{ width: "28px", height: "28px" }}
              >
                <Flame style={{ width: "14px", height: "14px" }} />
              </div>
            </div>
            <div>
              <div className="d-flex align-items-baseline gap-1">
                <CurrencyDisplay amount={dailyBurnRate} size="lg" />
                <span className="small text-secondary fw-medium" style={{ fontSize: "11px" }}>
                  / day
                </span>
              </div>
              <p className="small text-secondary mb-0 mt-1" style={{ fontSize: "10px" }}>
                Averaged over first {dayOfMonth} days
              </p>
            </div>
          </div>
        </div>

        {/* Metric 2: Projected Month Outflow */}
        <div className="col-12 col-md-4">
          <div className="p-3 rounded-card bg-surface border shadow-xs hover-lift d-flex flex-column justify-content-between h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-semibold text-secondary" style={{ fontSize: "11px", letterSpacing: "0.02em" }}>
                Projected Month Outflow
              </span>
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center bg-danger-soft flex-shrink-0"
                style={{ width: "28px", height: "28px" }}
              >
                <TrendingUp style={{ width: "14px", height: "14px" }} />
              </div>
            </div>
            <div>
              <div className="d-flex align-items-baseline gap-1">
                <CurrencyDisplay
                  amount={projectedMonthTotalExpense}
                  size="lg"
                  type="EXPENSE"
                />
              </div>
              <p className="small text-secondary mb-0 mt-1" style={{ fontSize: "10px" }}>
                Total spend expected at current pace
              </p>
            </div>
          </div>
        </div>

        {/* Metric 3: Safe Daily Budget Allowance */}
        <div className="col-12 col-md-4">
          <div className="p-3 rounded-card bg-surface border shadow-xs hover-lift d-flex flex-column justify-content-between h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-semibold text-secondary" style={{ fontSize: "11px", letterSpacing: "0.02em" }}>
                Safe Daily Spending Cap
              </span>
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center bg-success-soft flex-shrink-0"
                style={{ width: "28px", height: "28px" }}
              >
                <Calendar style={{ width: "14px", height: "14px" }} />
              </div>
            </div>
            <div>
              <div className="d-flex align-items-baseline gap-1">
                <CurrencyDisplay amount={safeDailyBudget} size="lg" />
                <span className="small text-secondary fw-medium" style={{ fontSize: "11px" }}>
                  / day
                </span>
              </div>
              <p className="small text-secondary mb-0 mt-1" style={{ fontSize: "10px" }}>
                Daily cap to maintain positive reserves
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Month Progress Strip */}
      <div className="mt-3 pt-3 border-top d-flex align-items-center gap-3">
        <span className="small fw-semibold text-secondary flex-shrink-0" style={{ fontSize: "11px" }}>
          Month Elapsed: <span className="text-foreground fw-bold">{monthPercentElapsed}%</span>
        </span>
        <div className="progress flex-grow-1 bg-light rounded-pill overflow-hidden shadow-xs" style={{ height: "7px" }}>
          <div
            className="progress-bar rounded-pill"
            style={{
              width: `${monthPercentElapsed}%`,
              background: "linear-gradient(90deg, #4F46E5 0%, #06B6D4 50%, #10B981 100%)",
              transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
        <span className="small text-secondary flex-shrink-0" style={{ fontSize: "11px" }}>
          {daysRemaining}d remaining
        </span>
      </div>
    </div>
  );
}
