"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/components/providers/DashboardProvider";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { CategoryExpenseChart } from "@/components/dashboard/CategoryExpenseChart";
import { MemberSpendingList } from "@/components/dashboard/MemberSpendingList";
import { RecentTransactionsWidget } from "@/components/dashboard/RecentTransactionsWidget";
import { ForecastingWidget } from "@/components/dashboard/ForecastingWidget";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatMonthYear, formatCurrency } from "@/lib/utils/formatters";
import { Calendar, Plus, RefreshCw, CreditCard, Banknote, Smartphone, Wallet, Building2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ACCOUNT_ICON: Record<string, any> = {
  CASH: Banknote,
  BANK: Building2,
  UPI: Smartphone,
  CREDIT_CARD: CreditCard,
  WALLET: Wallet,
};

const ACCOUNT_COLOR: Record<string, string> = {
  CASH: "bg-warning-soft text-warning",
  BANK: "bg-primary-soft text-primary",
  UPI: "bg-info-soft text-info",
  CREDIT_CARD: "bg-danger-soft text-danger",
  WALLET: "bg-success-soft text-success",
};

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  CASH: "Cash Wallet",
  BANK: "Bank Account",
  UPI: "UPI Digital",
  CREDIT_CARD: "Credit Card",
  WALLET: "Digital Wallet",
};

const ACCOUNT_BADGE_CLASS: Record<string, string> = {
  CASH: "bg-warning-soft text-dark border-warning-subtle",
  BANK: "bg-primary-soft text-primary border-primary-subtle",
  UPI: "bg-info-soft text-dark border-info-subtle",
  CREDIT_CARD: "bg-danger-soft text-danger border-danger-subtle",
  WALLET: "bg-success-soft text-success border-success-subtle",
};

const ACCOUNT_AMBIENT_BG: Record<string, string> = {
  CASH: "linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, var(--surface) 100%)",
  BANK: "linear-gradient(180deg, rgba(79, 70, 229, 0.05) 0%, var(--surface) 100%)",
  UPI: "linear-gradient(180deg, rgba(6, 182, 212, 0.05) 0%, var(--surface) 100%)",
  CREDIT_CARD: "linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, var(--surface) 100%)",
  WALLET: "linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, var(--surface) 100%)",
};

export default function DashboardPage() {
  const { openQuickAdd: onOpenQuickAdd, openTransaction: onSelectTransaction, refreshTrigger } = useDashboard();
  const { data: session } = useSession();
  const user = session?.user as any;

  const [metrics, setMetrics] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = () => {
    setIsLoading(true);
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((dashData) => {
        setMetrics(dashData);
        if (Array.isArray(dashData.accounts)) {
          setAccounts(dashData.accounts);
        }
      })
      .catch((err) => console.error("Dashboard error:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, [refreshTrigger]);

  const currentMonthStr = formatMonthYear(new Date());

  if (isLoading && !metrics) {
    return (
      <div className="d-flex flex-column gap-4">
        {/* Header Skeleton */}
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          <div>
            <div className="skeleton-shimmer mb-2" style={{ width: "220px", height: "28px" }} />
            <div className="skeleton-shimmer" style={{ width: "160px", height: "16px" }} />
          </div>
          <div className="d-flex gap-2">
            <div className="skeleton-shimmer" style={{ width: "100px", height: "36px" }} />
            <div className="skeleton-shimmer" style={{ width: "130px", height: "36px" }} />
          </div>
        </div>

        {/* 4 Cards Skeleton */}
        <div className="row g-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-3">
              <div className="card border bg-surface p-3.5 shadow-sm rounded-card" style={{ height: "128px" }}>
                <div className="d-flex justify-content-between mb-3">
                  <div className="skeleton-shimmer" style={{ width: "90px", height: "14px" }} />
                  <div className="skeleton-shimmer rounded-circle" style={{ width: "32px", height: "32px" }} />
                </div>
                <div className="skeleton-shimmer mt-auto" style={{ width: "130px", height: "24px" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Account Strip Skeleton */}
        <div className="d-flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-shimmer" style={{ width: "160px", height: "54px" }} />
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="card border bg-surface p-4 rounded-card shadow-sm" style={{ height: "340px" }}>
              <div className="skeleton-shimmer mb-4" style={{ width: "180px", height: "20px" }} />
              <div className="skeleton-shimmer w-100 h-75" />
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="card border bg-surface p-4 rounded-card shadow-sm" style={{ height: "340px" }}>
              <div className="skeleton-shimmer mb-4" style={{ width: "160px", height: "20px" }} />
              <div className="skeleton-shimmer w-100 h-75" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* ── Header & Greeting ── */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
        <div>
          <h1 className="h4 fw-bold text-foreground mb-1">
            Hello, {user?.name?.split(" ")[0] || "Family"} 👋
          </h1>
          <p className="small text-muted mb-0 d-flex align-items-center gap-1.5">
            <Calendar style={{ width: "14px", height: "14px" }} />
            <span>Overview for {currentMonthStr}</span>
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={fetchAll}
            title="Refresh Dashboard"
            type="button"
            className="btn btn-sm btn-light border text-secondary d-flex align-items-center gap-1.5 py-1.5 px-3 rounded-btn shadow-sm"
          >
            <RefreshCw style={{ width: "14px", height: "14px" }} />
            <span className="d-none d-sm-inline">Refresh</span>
          </button>
          <button
            onClick={onOpenQuickAdd}
            type="button"
            className="btn btn-sm btn-primary text-white fw-semibold shadow-sm d-flex align-items-center gap-1.5 py-1.5 px-3 rounded-btn"
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            <span>Quick Expense</span>
          </button>
        </div>
      </div>

      {/* ── KPI Summary Elevated Cards ── */}
      <SummaryCards
        metrics={{
          totalIncome: metrics?.totalIncome || 0,
          totalExpense: metrics?.totalExpense || 0,
          currentBalance:
            (Number(metrics?.currentBalance) > 0 ? Number(metrics.currentBalance) : 0) ||
            accounts.reduce((s, a) => s + Number(a.currentBalance || 0), 0),
          todayExpense: metrics?.todayExpense || 0,
        }}
      />

      {/* ── Smart Cashflow Forecasting & Burn Rate ── */}
      <ForecastingWidget
        totalExpense={metrics?.totalExpense || 0}
        totalIncome={metrics?.totalIncome || 0}
        currentBalance={
          (Number(metrics?.currentBalance) > 0 ? Number(metrics.currentBalance) : 0) ||
          accounts.reduce((s, a) => s + Number(a.currentBalance || 0), 0)
        }
      />

      {/* ── Quick Account Balances Strip ── */}
      {accounts.length > 0 && (
        <div className="d-flex flex-column gap-2.5">
          <div className="d-flex align-items-center justify-content-between px-1">
            <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.06em" }}>
              Wallets &amp; Bank Accounts
            </span>
            <span className="badge rounded-pill bg-light border text-secondary fw-semibold px-2 py-0.5" style={{ fontSize: "10px" }}>
              {accounts.length} active
            </span>
          </div>

          <div className="row g-3">
            {accounts.map((acc) => {
              const Icon = ACCOUNT_ICON[acc.type] || CreditCard;
              const colCls = ACCOUNT_COLOR[acc.type] || "bg-primary-soft text-primary";
              const badgeCls = ACCOUNT_BADGE_CLASS[acc.type] || "bg-light border text-secondary";
              const ambientBg = ACCOUNT_AMBIENT_BG[acc.type] || "var(--surface)";
              const typeLabel = ACCOUNT_TYPE_LABEL[acc.type] || acc.type.replace("_", " ");
              const isCreditCard = acc.type === "CREDIT_CARD";
              const displayName = acc.name.toLowerCase() === "case" ? "Cash" : acc.name;
              const colSpanClass =
                accounts.length === 1
                  ? "col-12"
                  : accounts.length === 2
                  ? "col-12 col-sm-6"
                  : accounts.length === 3
                  ? "col-12 col-md-4"
                  : "col-12 col-sm-6 col-md-4 col-xl-3";

              return (
                <div key={acc.id} className={colSpanClass}>
                  <div 
                    className="card-elevated border p-3.5 rounded-card hover-lift shadow-xs h-100 d-flex flex-column justify-content-between"
                    style={{ background: ambientBg }}
                  >
                    {/* Header: Icon + Name + Subtitle grouped on Left <----> Type Pill on Right */}
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="d-flex align-items-center gap-2.5 overflow-hidden">
                        <div 
                          className={cn("rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs", colCls)}
                          style={{ width: "38px", height: "38px" }}
                        >
                          <Icon style={{ width: "19px", height: "19px" }} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="small fw-bold text-foreground text-truncate mb-0" style={{ fontSize: "14px", letterSpacing: "-0.01em" }}>
                            {displayName}
                          </p>
                          <span className="small text-secondary" style={{ fontSize: "11px" }}>
                            {isCreditCard ? "Credit Facility" : "Liquid Reserve"}
                          </span>
                        </div>
                      </div>
                      <span 
                        className={cn("badge rounded-pill border fw-bold px-2.5 py-1 flex-shrink-0", badgeCls)}
                        style={{ fontSize: "10px", letterSpacing: "0.02em" }}
                      >
                        {typeLabel}
                      </span>
                    </div>

                    {/* Body: Prominent Tabular Balance */}
                    <div className="mt-1 pt-2 border-top border-light-subtle d-flex align-items-end justify-content-between">
                      <div>
                        <span className="small text-secondary fw-semibold text-uppercase d-block" style={{ fontSize: "10px", letterSpacing: "0.04em" }}>
                          {isCreditCard ? "Total Due" : "Available Balance"}
                        </span>
                        <div className="mt-0.5">
                          <CurrencyDisplay
                            amount={acc.currentBalance}
                            size="lg"
                            type={isCreditCard ? "EXPENSE" : "DEFAULT"}
                          />
                        </div>
                      </div>
                      <span className="small text-secondary" style={{ fontSize: "11px" }}>
                        {isCreditCard ? "Active Card" : "Ready to Spend"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MOBILE: Recent Transactions first ── */}
      <div className="d-lg-none">
        <RecentTransactionsWidget
          transactions={metrics?.recentTransactions || []}
          onSelectTransaction={onSelectTransaction}
          onOpenQuickAdd={onOpenQuickAdd}
        />
      </div>

      {/* ── Charts & Analytics Grid ── */}
      <div className="row g-4">
        {/* Income vs Expense Monthly Trend */}
        <div className="col-12 col-lg-8">
          <Card className="h-100 card-elevated">
            <CardHeader>
              <CardTitle>Income vs Expense Trend</CardTitle>
              <span className="small text-secondary" style={{ fontSize: "11px" }}>Past 6 Months</span>
            </CardHeader>
            <IncomeExpenseChart data={metrics?.monthlyTrend || []} />
          </Card>
        </div>

        {/* Expense by Category Donut */}
        <div className="col-12 col-lg-4">
          <Card className="h-100 card-elevated">
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
              <span className="small text-secondary" style={{ fontSize: "11px" }}>{currentMonthStr}</span>
            </CardHeader>
            <CategoryExpenseChart data={metrics?.categoryBreakdown || []} />
          </Card>
        </div>
      </div>

      {/* ── Secondary Row: Recent Transactions + Member Spending ── */}
      <div className="row g-4">
        {/* DESKTOP: Recent Transactions */}
        <div className="d-none d-lg-block col-12 col-lg-8">
          <RecentTransactionsWidget
            transactions={metrics?.recentTransactions || []}
            onSelectTransaction={onSelectTransaction}
            onOpenQuickAdd={onOpenQuickAdd}
          />
        </div>

        {/* Family Member Spending */}
        <div className="col-12 col-lg-4">
          <Card className="h-100 card-elevated">
            <CardHeader>
              <CardTitle>Family Member Spending</CardTitle>
              <span className="small text-secondary" style={{ fontSize: "11px" }}>{currentMonthStr}</span>
            </CardHeader>
            <MemberSpendingList
              data={metrics?.memberBreakdown || []}
              totalExpense={metrics?.totalExpense || 0}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
