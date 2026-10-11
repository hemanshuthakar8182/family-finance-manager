"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDashboard } from "@/components/providers/DashboardProvider";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { IncomeExpenseChart } from "@/components/dashboard/IncomeExpenseChart";
import { CategoryExpenseChart } from "@/components/dashboard/CategoryExpenseChart";
import { MemberSpendingList } from "@/components/dashboard/MemberSpendingList";
import { RecentTransactionsWidget } from "@/components/dashboard/RecentTransactionsWidget";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatMonthYear, formatCurrency } from "@/lib/utils/formatters";
import { Calendar, Plus, RefreshCw, CreditCard, Banknote, Smartphone, Wallet } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const ACCOUNT_ICON: Record<string, any> = {
  CASH: Banknote,
  BANK: CreditCard,
  UPI: Smartphone,
  CREDIT_CARD: CreditCard,
  WALLET: Wallet,
};

const ACCOUNT_COLOR: Record<string, string> = {
  CASH: "text-warning bg-warning-subtle",
  BANK: "text-primary bg-primary-subtle",
  UPI: "text-info bg-info-subtle",
  CREDIT_CARD: "text-danger bg-danger-subtle",
  WALLET: "text-success bg-success-subtle",
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
        <div className="bg-light rounded-btn p-3 placeholder-glow" style={{ width: "250px", height: "40px" }} />
        <div className="bg-light rounded-card p-4 placeholder-glow" style={{ height: "140px" }} />
        <div className="row g-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-12 col-md-6 col-lg-3">
              <div className="bg-light rounded-card p-3 placeholder-glow" style={{ height: "100px" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* ── Header & Greeting ── */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">
            Hello, {user?.name?.split(" ")[0] || "Family"} 👋
          </h1>
          <p className="small text-secondary mb-0 d-flex align-items-center gap-1.5">
            <Calendar style={{ width: "14px", height: "14px" }} />
            <span>Overview for {currentMonthStr}</span>
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={fetchAll}
            title="Refresh Dashboard"
            type="button"
            className="btn btn-sm btn-light border text-secondary d-flex align-items-center gap-1.5 py-1.5 px-3 rounded-btn"
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

      {/* ── KPI Summary ── */}
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
        <div className="d-flex gap-2 overflow-x-auto pb-1">
          {accounts.map((acc) => {
            const Icon = ACCOUNT_ICON[acc.type] || CreditCard;
            const colCls = ACCOUNT_COLOR[acc.type] || "text-secondary bg-light";
            const isCreditCard = acc.type === "CREDIT_CARD";
            return (
              <div
                key={acc.id}
                className="d-flex align-items-center gap-2 px-3 py-2 rounded-btn bg-surface border shadow-sm flex-shrink-0"
                style={{ minWidth: "140px" }}
              >
                <div 
                  className={cn("rounded-circle d-flex align-items-center justify-content-center flex-shrink-0", colCls)}
                  style={{ width: "30px", height: "30px" }}
                >
                  <Icon style={{ width: "15px", height: "15px" }} />
                </div>
                <div className="overflow-hidden">
                  <p className="small fw-semibold text-dark text-truncate mb-0" style={{ fontSize: "11px" }}>{acc.name}</p>
                  <p
                    className={cn(
                      "small fw-bold font-amount mb-0",
                      isCreditCard ? "text-danger" : "text-dark"
                    )}
                  >
                    {isCreditCard ? "−" : ""}{formatCurrency(acc.currentBalance)}
                  </p>
                </div>
              </div>
            );
          })}
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
          <Card className="h-100">
            <CardHeader>
              <CardTitle>Income vs Expense Trend</CardTitle>
              <span className="small text-secondary" style={{ fontSize: "11px" }}>Past 6 Months</span>
            </CardHeader>
            <IncomeExpenseChart data={metrics?.monthlyTrend || []} />
          </Card>
        </div>

        {/* Expense by Category Donut */}
        <div className="col-12 col-lg-4">
          <Card className="h-100">
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
          <Card className="h-100">
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
