"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/components/providers/DashboardProvider";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { CategoryExpenseChart } from "@/components/dashboard/CategoryExpenseChart";
import { MemberSpendingList } from "@/components/dashboard/MemberSpendingList";
import { RecentTransactionsWidget } from "@/components/dashboard/RecentTransactionsWidget";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatMonthYear, formatCurrency } from "@/lib/utils/formatters";
import { Calendar, Plus, RefreshCw, CreditCard, Banknote, Smartphone, Wallet, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ACCOUNT_ICON: Record<string, any> = {
  CASH: Banknote,
  BANK: CreditCard,
  UPI: Smartphone,
  CREDIT_CARD: CreditCard,
  WALLET: Wallet,
};

const ACCOUNT_COLOR: Record<string, string> = {
  CASH: "text-warning bg-warning bg-opacity-15",
  BANK: "text-primary bg-primary bg-opacity-10",
  UPI: "text-info bg-info bg-opacity-15",
  CREDIT_CARD: "text-danger bg-danger bg-opacity-10",
  WALLET: "text-success bg-success bg-opacity-10",
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
          currentBalance: metrics?.currentBalance || 0,
          todayExpense: metrics?.todayExpense || 0,
        }}
      />

      {/* ── Quick Account Balances Strip ── */}
      {accounts.length > 0 && (
        <div className="d-flex flex-column gap-2">
          <div className="d-flex align-items-center justify-content-between px-1">
            <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
              Wallets &amp; Bank Accounts
            </span>
            <span className="small text-secondary" style={{ fontSize: "11px" }}>
              {accounts.length} active
            </span>
          </div>

          <div className="d-flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {accounts.map((acc) => {
              const Icon = ACCOUNT_ICON[acc.type] || CreditCard;
              const colCls = ACCOUNT_COLOR[acc.type] || "text-secondary bg-light";
              const isCreditCard = acc.type === "CREDIT_CARD";
              return (
                <div
                  key={acc.id}
                  className="card-elevated d-flex align-items-center gap-2.5 px-3 py-2.5 rounded-btn flex-shrink-0 hover-lift"
                  style={{ minWidth: "160px" }}
                >
                  <div 
                    className={cn("rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs", colCls)}
                    style={{ width: "32px", height: "32px" }}
                  >
                    <Icon style={{ width: "16px", height: "16px" }} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="small fw-semibold text-foreground text-truncate mb-0" style={{ fontSize: "11px" }}>
                      {acc.name}
                    </p>
                    <div className="mt-0.5">
                      <CurrencyDisplay
                        amount={acc.currentBalance}
                        size="xs"
                        type={isCreditCard ? "EXPENSE" : "DEFAULT"}
                      />
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
