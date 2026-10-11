"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils/formatters";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { TrendingUp, TrendingDown, Wallet, CalendarDays, ArrowUpRight, ArrowDownRight, ShieldCheck } from "lucide-react";
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
      <div 
        className="d-lg-none rounded-card overflow-hidden shadow-card border border-white border-opacity-10 text-white"
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 65%, var(--accent) 100%)"
        }}
      >
        <div className="p-4 position-relative">
          {/* Subtle Ambient Glow */}
          <div
            className="position-absolute end-0 top-0 rounded-circle"
            style={{
              width: "160px",
              height: "160px",
              background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Balance primary */}
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="small fw-semibold opacity-85 text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.06em" }}>
              {balanceHealthy ? "Total Family Balance" : "Net Family Balance (Deficit)"}
            </span>
            <span className="badge rounded-pill bg-white bg-opacity-20 text-white py-0.5 px-2" style={{ fontSize: "10px" }}>
              {balanceHealthy ? "Live Ledger" : "Overdrawn"}
            </span>
          </div>

          <div className="my-1">
            <CurrencyDisplay
              amount={metrics.currentBalance}
              size="2xl"
              className="text-white"
              showDecimals={false}
            />
          </div>
          <p className="small opacity-75 mb-0" style={{ fontSize: "11px" }}>
            {balanceHealthy ? "Across all bank accounts & cash wallets" : "Family reserves currently overdrawn"}
          </p>
        </div>

        {/* Three sub-metrics row */}
        <div className="row g-0 border-top border-white border-opacity-20 text-center">
          <div className="col-4 py-2.5 px-1 px-sm-3 border-end border-white border-opacity-20">
            <p className="small fw-semibold opacity-75 text-uppercase mb-0.5" style={{ fontSize: "10px" }}>
              Today
            </p>
            <div className="text-nowrap">
              <CurrencyDisplay amount={metrics.todayExpense} size="sm" className="text-white" />
            </div>
            <p className="small opacity-75 mb-0" style={{ fontSize: "9px" }}>spent</p>
          </div>

          <div className="col-4 py-2.5 px-1 px-sm-3 border-end border-white border-opacity-20">
            <p className="small fw-semibold opacity-75 text-uppercase mb-0.5" style={{ fontSize: "10px" }}>
              Income
            </p>
            <div className="text-nowrap">
              <CurrencyDisplay amount={metrics.totalIncome} size="sm" className="text-white" />
            </div>
            <p className="small opacity-75 mb-0" style={{ fontSize: "9px" }}>this month</p>
          </div>

          <div className="col-4 py-2.5 px-1 px-sm-3">
            <p className="small fw-semibold opacity-75 text-uppercase mb-0.5" style={{ fontSize: "10px" }}>
              Spent
            </p>
            <div className="text-nowrap">
              <CurrencyDisplay amount={metrics.totalExpense} size="sm" className="text-white" />
            </div>
            <p className="small opacity-75 mb-0" style={{ fontSize: "9px" }}>this month</p>
          </div>
        </div>

        {/* Savings rate strip */}
        <div
          className={cn(
            "d-flex align-items-center justify-content-between px-4 py-2 border-top border-white border-opacity-20",
            savingsHealthy ? "bg-black bg-opacity-15" : "bg-black bg-opacity-30"
          )}
        >
          <span className="small fw-semibold" style={{ fontSize: "11px" }}>Monthly Savings Rate</span>
          <span
            className={cn(
              "badge rounded-pill fw-bold px-2.5 py-1",
              savingsHealthy ? "bg-white bg-opacity-25 text-white" : "bg-warning text-dark"
            )}
            style={{ fontSize: "11px" }}
          >
            {savingsRate}%{savingsHealthy ? " 🎯 On Track" : " ⚠️ Under Target"}
          </span>
        </div>
      </div>

      {/* ── DESKTOP: 4-card elevated fintech grid (≥ lg) ── */}
      <div className="d-none d-lg-flex row g-3">
        {/* Balance Card */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div 
            className={cn("kpi-card d-flex flex-column justify-content-between h-100", balanceHealthy ? "kpi-card-balance" : "border-danger-subtle")}
            style={{
              background: balanceHealthy
                ? undefined
                : "linear-gradient(180deg, rgba(239, 68, 68, 0.04) 0%, var(--surface) 80%)"
            }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className={cn("small fw-bold text-uppercase", balanceHealthy ? "text-secondary" : "text-danger")} style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
                {balanceHealthy ? "Total Balance" : "Net Deficit"}
              </span>
              <div 
                className={cn(
                  "rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs",
                  balanceHealthy ? "bg-primary-soft text-primary" : "bg-danger-soft text-danger"
                )}
                style={{ width: "40px", height: "40px" }}
              >
                <Wallet style={{ width: "20px", height: "20px" }} />
              </div>
            </div>
            <div>
              <div className="mb-3">
                <CurrencyDisplay
                  amount={metrics.currentBalance}
                  size="2xl"
                  type={balanceHealthy ? "DEFAULT" : "EXPENSE"}
                />
              </div>
              <div className="d-flex align-items-center justify-content-between pt-2 border-top border-light-subtle">
                <span className={cn("badge rounded-pill fw-semibold px-2 py-0.5", balanceHealthy ? "bg-primary-soft text-primary" : "bg-danger-soft text-danger")} style={{ fontSize: "10px" }}>
                  {balanceHealthy ? "All Accounts" : "Overdrawn"}
                </span>
                <span className={cn("small text-truncate", balanceHealthy ? "text-secondary" : "text-danger fw-medium")} style={{ fontSize: "11px" }}>
                  {balanceHealthy ? "Liquid Reserves" : "Negative Reserves"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Today Card */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="kpi-card kpi-card-today d-flex flex-column justify-content-between h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
                Today&apos;s Spend
              </span>
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center bg-warning-soft flex-shrink-0 shadow-xs"
                style={{ width: "40px", height: "40px" }}
              >
                <CalendarDays style={{ width: "20px", height: "20px" }} />
              </div>
            </div>
            <div>
              <div className="mb-3">
                <CurrencyDisplay
                  amount={metrics.todayExpense}
                  size="2xl"
                />
              </div>
              <div className="d-flex align-items-center justify-content-between pt-2 border-top border-light-subtle">
                <span className="badge rounded-pill bg-warning-soft fw-semibold px-2 py-0.5" style={{ fontSize: "10px" }}>
                  Today
                </span>
                <span className="small text-secondary text-truncate" style={{ fontSize: "11px" }}>
                  Daily Outflow
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Month Income Card */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="kpi-card kpi-card-income d-flex flex-column justify-content-between h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
                Month Income
              </span>
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center bg-success-soft flex-shrink-0 shadow-xs"
                style={{ width: "40px", height: "40px" }}
              >
                <TrendingUp style={{ width: "20px", height: "20px" }} />
              </div>
            </div>
            <div>
              <div className="mb-3">
                <CurrencyDisplay
                  amount={metrics.totalIncome}
                  size="2xl"
                  type="INCOME"
                />
              </div>
              <div className="d-flex align-items-center justify-content-between pt-2 border-top border-light-subtle">
                <span className="badge rounded-pill bg-success-soft fw-semibold px-2 py-0.5" style={{ fontSize: "10px" }}>
                  <ArrowUpRight style={{ width: "12px", height: "12px" }} /> Inflows
                </span>
                <span className="small text-secondary text-truncate" style={{ fontSize: "11px" }}>
                  Earned this month
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Month Expense Card */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="kpi-card kpi-card-expense d-flex flex-column justify-content-between h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
                Month Expense
              </span>
              <div 
                className="rounded-3 d-flex align-items-center justify-content-center bg-danger-soft flex-shrink-0 shadow-xs"
                style={{ width: "40px", height: "40px" }}
              >
                <TrendingDown style={{ width: "20px", height: "20px" }} />
              </div>
            </div>
            <div>
              <div className="mb-3">
                <CurrencyDisplay
                  amount={metrics.totalExpense}
                  size="2xl"
                  type="EXPENSE"
                />
              </div>
              <div className="d-flex align-items-center justify-content-between pt-2 border-top border-light-subtle">
                <span className="badge rounded-pill bg-danger-soft fw-semibold px-2 py-0.5" style={{ fontSize: "10px" }}>
                  <ArrowDownRight style={{ width: "12px", height: "12px" }} /> Outflows
                </span>
                <span className="small text-secondary text-truncate" style={{ fontSize: "11px" }}>
                  Total monthly spend
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
