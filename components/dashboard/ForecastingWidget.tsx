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

  const numBalance = Number(currentBalance) || 0;
  const numExpense = Number(totalExpense) || 0;
  const numIncome = Number(totalIncome) || 0;

  // Daily burn calculations
  const dailyBurnRate = numExpense > 0 ? Math.round(numExpense / dayOfMonth) : 0;
  const projectedRemainingExpense = dailyBurnRate * daysRemaining;
  const projectedMonthTotalExpense = numExpense + projectedRemainingExpense;
  const projectedClosingBalance = numBalance - projectedRemainingExpense;

  // Safe daily budget cap based on available liquid reserves across remaining days
  const safeDailyBudget =
    daysRemaining > 0
      ? (numBalance > 0 ? Math.max(1, Math.round(numBalance / daysRemaining)) : 0)
      : numBalance;

  // Health assessment
  const isHealthyPace = projectedClosingBalance >= 0;
  const isThrivingPace =
    numIncome > 0 && projectedMonthTotalExpense <= numIncome * 0.8;

  return (
    <div className="card-elevated p-3.5 p-sm-4 bg-surface position-relative overflow-hidden border shadow-sm" style={{ borderRadius: "20px" }}>
      {/* Top Banner Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm"
            style={{ 
              width: "42px", 
              height: "42px",
              background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
            }}
          >
            <Sparkles style={{ width: "20px", height: "20px" }} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h3 className="h6 fw-bold text-foreground mb-0" style={{ letterSpacing: "-0.01em" }}>
                Smart Cashflow Forecast
              </h3>
              <span 
                className="badge rounded-pill fw-bold px-2 py-0.5 text-white" 
                style={{ 
                  background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                  fontSize: "9px",
                  letterSpacing: "0.04em"
                }}
              >
                ✦ AI Model
              </span>
            </div>
            <p className="small text-secondary mb-0 mt-0.5" style={{ fontSize: "11px" }}>
              {now.toLocaleString("en-US", { month: "long" })} {year} &bull; Day {dayOfMonth} of {daysInMonth} ({daysRemaining} days remaining)
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
          <div 
            className="p-3.5 rounded-card border shadow-xs hover-lift d-flex flex-column justify-content-between h-100"
            style={{ background: "linear-gradient(180deg, rgba(245, 158, 11, 0.04) 0%, var(--surface) 100%)" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.04em" }}>
                Current Daily Burn
              </span>
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center bg-warning-soft flex-shrink-0 shadow-xs"
                style={{ width: "30px", height: "30px" }}
              >
                <Flame style={{ width: "15px", height: "15px" }} />
              </div>
            </div>
            <div>
              <div className="d-flex align-items-baseline gap-1 my-1">
                <CurrencyDisplay amount={dailyBurnRate} size="xl" />
                <span className="small text-secondary fw-semibold" style={{ fontSize: "12px" }}>
                  / day
                </span>
              </div>
              <p className="small text-secondary mb-0 pt-1.5 border-top border-light-subtle" style={{ fontSize: "11px" }}>
                Averaged across {dayOfMonth} active days
              </p>
            </div>
          </div>
        </div>

        {/* Metric 2: Projected Month Outflow */}
        <div className="col-12 col-md-4">
          <div 
            className="p-3.5 rounded-card border shadow-xs hover-lift d-flex flex-column justify-content-between h-100"
            style={{ background: "linear-gradient(180deg, rgba(239, 68, 68, 0.04) 0%, var(--surface) 100%)" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.04em" }}>
                Projected Month Outflow
              </span>
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center bg-danger-soft flex-shrink-0 shadow-xs"
                style={{ width: "30px", height: "30px" }}
              >
                <TrendingUp style={{ width: "15px", height: "15px" }} />
              </div>
            </div>
            <div>
              <div className="d-flex align-items-baseline gap-1 my-1">
                <CurrencyDisplay
                  amount={projectedMonthTotalExpense}
                  size="xl"
                  type="EXPENSE"
                />
              </div>
              <p className="small text-secondary mb-0 pt-1.5 border-top border-light-subtle" style={{ fontSize: "11px" }}>
                Estimated total spend by day {daysInMonth}
              </p>
            </div>
          </div>
        </div>

        {/* Metric 3: Safe Daily Budget Allowance */}
        <div className="col-12 col-md-4">
          <div 
            className="p-3.5 rounded-card border shadow-xs hover-lift d-flex flex-column justify-content-between h-100"
            style={{ 
              background: numBalance < 0 
                ? "linear-gradient(180deg, rgba(239, 68, 68, 0.04) 0%, var(--surface) 100%)" 
                : "linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, var(--surface) 100%)" 
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.04em" }}>
                Safe Daily Spending Cap
              </span>
              <div 
                className={cn("rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs", numBalance < 0 ? "bg-danger-soft" : "bg-success-soft")}
                style={{ width: "30px", height: "30px" }}
              >
                <Calendar style={{ width: "15px", height: "15px" }} />
              </div>
            </div>
            <div>
              <div className="d-flex align-items-baseline gap-1 my-1">
                <CurrencyDisplay amount={safeDailyBudget} size="xl" />
                <span className="small text-secondary fw-semibold" style={{ fontSize: "12px" }}>
                  / day
                </span>
              </div>
              <p className={cn("small mb-0 pt-1.5 border-top border-light-subtle", numBalance < 0 ? "text-danger" : "text-secondary")} style={{ fontSize: "11px" }}>
                {numBalance < 0 ? "Reserves overdrawn (add funds to unlock cap)" : "Daily allowance from liquid reserves"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Month Progress Strip */}
      <div className="mt-3.5 pt-3 border-top d-flex align-items-center gap-3">
        <span className="small fw-semibold text-secondary flex-shrink-0" style={{ fontSize: "11px" }}>
          Month Elapsed: <span className="text-foreground fw-bold">{monthPercentElapsed}%</span>
        </span>
        <div className="progress flex-grow-1 bg-light rounded-pill overflow-hidden shadow-xs" style={{ height: "8px" }}>
          <div
            className="progress-bar rounded-pill"
            style={{
              width: `${monthPercentElapsed}%`,
              background: "linear-gradient(90deg, #6366F1 0%, #06B6D4 50%, #10B981 100%)",
              transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
        <span className="small text-secondary flex-shrink-0 fw-medium" style={{ fontSize: "11px" }}>
          {daysRemaining} days remaining
        </span>
      </div>
    </div>
  );
}
