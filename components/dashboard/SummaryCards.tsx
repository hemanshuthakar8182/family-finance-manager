"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils/formatters";
import { TrendingUp, TrendingDown, Wallet, CalendarDays } from "lucide-react";
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
        className="d-lg-none rounded-card overflow-hidden shadow-sm border text-white"
        style={{
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 60%, var(--accent) 100%)"
        }}
      >
        <div className="p-4">
          {/* Balance primary */}
          <p className="small fw-semibold opacity-75 mb-1 text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
            Total Family Balance
          </p>
          <div className="display-6 fw-bold font-amount">
            {formatCurrency(metrics.currentBalance)}
          </div>
          <p className="small opacity-75 mb-0 mt-1" style={{ fontSize: "11px" }}>Across all accounts</p>
        </div>

        {/* Three sub-metrics row */}
        <div className="row g-0 border-top border-white border-opacity-25 text-center">
          <div className="col-4 p-3 border-end border-white border-opacity-25">
            <p className="small fw-semibold opacity-75 text-uppercase mb-1" style={{ fontSize: "10px" }}>
              Today
            </p>
            <div className="fs-6 fw-bold font-amount">
              {formatCurrency(metrics.todayExpense)}
            </div>
            <p className="small opacity-75 mb-0" style={{ fontSize: "10px" }}>spent</p>
          </div>

          <div className="col-4 p-3 border-end border-white border-opacity-25">
            <p className="small fw-semibold opacity-75 text-uppercase mb-1" style={{ fontSize: "10px" }}>
              Income
            </p>
            <div className="fs-6 fw-bold font-amount">
              {formatCurrency(metrics.totalIncome)}
            </div>
            <p className="small opacity-75 mb-0" style={{ fontSize: "10px" }}>this month</p>
          </div>

          <div className="col-4 p-3">
            <p className="small fw-semibold opacity-75 text-uppercase mb-1" style={{ fontSize: "10px" }}>
              Spent
            </p>
            <div className="fs-6 fw-bold font-amount">
              {formatCurrency(metrics.totalExpense)}
            </div>
            <p className="small opacity-75 mb-0" style={{ fontSize: "10px" }}>this month</p>
          </div>
        </div>

        {/* Savings rate strip */}
        <div
          className={cn(
            "d-flex align-items-center justify-content-between px-4 py-2 border-top border-white border-opacity-25",
            savingsHealthy ? "bg-black bg-opacity-10" : "bg-black bg-opacity-25"
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
            {savingsRate}%{savingsHealthy ? " 👍" : " ⚠️"}
          </span>
        </div>
      </div>

      {/* ── DESKTOP: 4-card grid (≥ lg) ── */}
      <div className="d-none d-lg-flex row g-3">
        {/* Balance */}
        <div className="col-3">
          <div className="p-3 rounded-card border bg-surface shadow-sm d-flex flex-column justify-content-between h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-semibold text-secondary">Current Balance</span>
              <div 
                className="rounded-btn d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary flex-shrink-0"
                style={{ width: "32px", height: "32px" }}
              >
                <Wallet style={{ width: "16px", height: "16px" }} />
              </div>
            </div>
            <div>
              <div
                className={cn(
                  "fs-4 fw-bold font-amount",
                  balanceHealthy ? "text-dark" : "text-danger"
                )}
              >
                {formatCurrency(metrics.currentBalance)}
              </div>
              <p className="text-secondary small mb-0 mt-1" style={{ fontSize: "11px" }}>Across all accounts</p>
            </div>
          </div>
        </div>

        {/* Today */}
        <div className="col-3">
          <div className="p-3 rounded-card border bg-surface shadow-sm d-flex flex-column justify-content-between h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-semibold text-secondary">Today&apos;s Spending</span>
              <div 
                className="rounded-btn d-flex align-items-center justify-content-center bg-warning bg-opacity-15 text-warning flex-shrink-0"
                style={{ width: "32px", height: "32px" }}
              >
                <CalendarDays style={{ width: "16px", height: "16px" }} />
              </div>
            </div>
            <div>
              <div className="fs-4 fw-bold font-amount text-dark">
                {formatCurrency(metrics.todayExpense)}
              </div>
              <p className="text-secondary small mb-0 mt-1" style={{ fontSize: "11px" }}>Family expenses today</p>
            </div>
          </div>
        </div>

        {/* Month Income */}
        <div className="col-3">
          <div className="p-3 rounded-card border bg-surface shadow-sm d-flex flex-column justify-content-between h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-semibold text-secondary">Month Income</span>
              <div 
                className="rounded-btn d-flex align-items-center justify-content-center bg-success bg-opacity-10 text-success flex-shrink-0"
                style={{ width: "32px", height: "32px" }}
              >
                <TrendingUp style={{ width: "16px", height: "16px" }} />
              </div>
            </div>
            <div>
              <div className="fs-4 fw-bold font-amount text-income">
                {formatCurrency(metrics.totalIncome)}
              </div>
              <p className="text-secondary small mb-0 mt-1" style={{ fontSize: "11px" }}>Current month earnings</p>
            </div>
          </div>
        </div>

        {/* Month Expense + savings rate */}
        <div className="col-3">
          <div className="p-3 rounded-card border bg-surface shadow-sm d-flex flex-column justify-content-between h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="small fw-semibold text-secondary">Month Expense</span>
              <div 
                className="rounded-btn d-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger flex-shrink-0"
                style={{ width: "32px", height: "32px" }}
              >
                <TrendingDown style={{ width: "16px", height: "16px" }} />
              </div>
            </div>
            <div>
              <div className="fs-4 fw-bold font-amount text-dark">
                {formatCurrency(metrics.totalExpense)}
              </div>
              <div className="d-flex align-items-center justify-content-between gap-1 mt-1">
                <p className="text-secondary small mb-0" style={{ fontSize: "11px" }}>Month outflows</p>
                {metrics.totalIncome > 0 && (
                  <span
                    className={cn(
                      "badge rounded-pill fw-bold",
                      savingsHealthy
                        ? "bg-success-subtle text-success"
                        : "bg-warning-subtle text-warning-emphasis"
                    )}
                    style={{ fontSize: "10px" }}
                  >
                    {savingsRate}% saved
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
