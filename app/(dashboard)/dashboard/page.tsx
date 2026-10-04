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
  CASH: "text-amber-700 bg-amber-50",
  BANK: "text-blue-700 bg-blue-50",
  UPI: "text-violet-700 bg-violet-50",
  CREDIT_CARD: "text-rose-700 bg-rose-50",
  WALLET: "text-teal-700 bg-teal-50",
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
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-btn w-64" />
        <div className="h-40 bg-slate-200 rounded-card lg:hidden" />
        <div className="hidden lg:grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-card" />
          ))}
        </div>
        <div className="h-14 bg-slate-200 rounded-card" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200 rounded-card lg:col-span-2" />
          <div className="h-80 bg-slate-200 rounded-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Header & Greeting ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Hello, {user?.name?.split(" ")[0] || "Family"} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Overview for {currentMonthStr}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            title="Refresh Dashboard"
            className="p-2 rounded-btn border border-border bg-surface text-slate-600 hover:bg-surface-muted text-xs flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={onOpenQuickAdd}
            className="px-3.5 py-2 rounded-btn bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Expense</span>
          </button>
        </div>
      </div>

      {/* ── KPI Summary (Hero on mobile, 4-col on desktop) ── */}
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
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {accounts.map((acc) => {
            const Icon = ACCOUNT_ICON[acc.type] || CreditCard;
            const colCls = ACCOUNT_COLOR[acc.type] || "text-slate-700 bg-slate-100";
            const isCreditCard = acc.type === "CREDIT_CARD";
            return (
              <div
                key={acc.id}
                className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-btn bg-surface border border-border shadow-soft min-w-[130px]"
              >
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", colCls)}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-800 truncate">{acc.name}</p>
                  <p
                    className={cn(
                      "text-xs font-bold font-amount",
                      isCreditCard ? "text-expense" : "text-slate-900"
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

      {/* ── MOBILE: Recent Transactions first (most relevant daily) ── */}
      <div className="lg:hidden">
        <RecentTransactionsWidget
          transactions={metrics?.recentTransactions || []}
          onSelectTransaction={onSelectTransaction}
          onOpenQuickAdd={onOpenQuickAdd}
        />
      </div>

      {/* ── Charts & Analytics Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Income vs Expense Monthly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income vs Expense Trend</CardTitle>
            <span className="text-xs text-slate-400">Past 6 Months</span>
          </CardHeader>
          <IncomeExpenseChart data={metrics?.monthlyTrend || []} />
        </Card>

        {/* Expense by Category Donut */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <span className="text-xs text-slate-400">{currentMonthStr}</span>
          </CardHeader>
          <CategoryExpenseChart data={metrics?.categoryBreakdown || []} />
        </Card>
      </div>

      {/* ── Secondary Row: Recent Transactions (desktop only) + Member Spending ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* DESKTOP: Recent Transactions */}
        <div className="hidden lg:block lg:col-span-2">
          <RecentTransactionsWidget
            transactions={metrics?.recentTransactions || []}
            onSelectTransaction={onSelectTransaction}
            onOpenQuickAdd={onOpenQuickAdd}
          />
        </div>

        {/* Family Member Spending */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Family Member Spending</CardTitle>
              <span className="text-xs text-slate-400">{currentMonthStr}</span>
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
