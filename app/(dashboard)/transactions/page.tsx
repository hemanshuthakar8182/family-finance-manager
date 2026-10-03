"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDashboard } from "@/components/providers/DashboardProvider";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionCard } from "@/components/transactions/TransactionCard";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/formatters";
import { Plus, Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function getDateLabel(dateStr: string): string {
  const txDate = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const toDay = (d: Date) => d.toISOString().split("T")[0];
  const txDay = toDay(txDate);

  if (txDay === toDay(today)) return "Today";
  if (txDay === toDay(yesterday)) return "Yesterday";

  return txDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function groupTransactionsByDate(transactions: any[]) {
  const groups: Record<string, any[]> = {};
  for (const tx of transactions) {
    const label = getDateLabel(tx.date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  }
  return groups;
}

type QuickFilter = "ALL" | "EXPENSE" | "INCOME" | "THIS_WEEK" | "TODAY";

const QUICK_FILTERS: { label: string; value: QuickFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Expenses", value: "EXPENSE" },
  { label: "Income", value: "INCOME" },
  { label: "Today", value: "TODAY" },
  { label: "This Week", value: "THIS_WEEK" },
];

export default function TransactionsPage() {
  const { openQuickAdd: onOpenQuickAdd, openTransaction: onSelectTransaction, refreshTrigger } = useDashboard();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1, totalCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>("ALL");

  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  const today = new Date().toISOString().split("T")[0];
  const weekStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split("T")[0];
  })();

  const initialFilters = {
    search: "",
    type: "ALL" as "ALL" | "EXPENSE" | "INCOME",
    categoryId: "",
    accountId: "",
    memberId: "",
    startDate: "",
    endDate: "",
  };

  const [filters, setFilters] = useState(initialFilters);

  // Merge quickFilter into effective API params
  const effectiveFilters = useMemo(() => {
    const f = { ...filters };
    if (quickFilter === "EXPENSE") f.type = "EXPENSE";
    else if (quickFilter === "INCOME") f.type = "INCOME";
    else if (quickFilter === "TODAY") { f.startDate = today; f.endDate = today; }
    else if (quickFilter === "THIS_WEEK") { f.startDate = weekStart; f.endDate = today; }
    return f;
  }, [filters, quickFilter]);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/accounts").then((r) => r.json()),
      fetch("/api/family/members").then((r) => r.json()),
    ]).then(([catData, accData, memData]) => {
      if (Array.isArray(catData)) setCategories(catData);
      if (Array.isArray(accData)) setAccounts(accData);
      if (Array.isArray(memData)) setMembers(memData);
    });
  }, []);

  const fetchTransactions = (page = 1) => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(pagination.limit));

    if (effectiveFilters.search) params.set("search", effectiveFilters.search);
    if (effectiveFilters.type !== "ALL") params.set("type", effectiveFilters.type);
    if (effectiveFilters.categoryId) params.set("categoryId", effectiveFilters.categoryId);
    if (effectiveFilters.accountId) params.set("accountId", effectiveFilters.accountId);
    if (effectiveFilters.memberId) params.set("memberId", effectiveFilters.memberId);
    if (effectiveFilters.startDate) params.set("startDate", effectiveFilters.startDate);
    if (effectiveFilters.endDate) params.set("endDate", effectiveFilters.endDate);

    fetch(`/api/transactions?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.items || []);
        if (data.pagination) setPagination(data.pagination);
      })
      .catch((err) => console.error("Error fetching transactions:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTransactions(1);
  }, [effectiveFilters, refreshTrigger]);

  // Group mobile transactions by date
  const grouped = useMemo(() => groupTransactionsByDate(transactions), [transactions]);

  // Per-day totals for mobile header
  const dayTotals: Record<string, { income: number; expense: number }> = useMemo(() => {
    const out: Record<string, { income: number; expense: number }> = {};
    for (const [label, txs] of Object.entries(grouped)) {
      let income = 0;
      let expense = 0;
      for (const t of txs) {
        if (t.type === "INCOME") income += Number(t.amount);
        else expense += Number(t.amount);
      }
      out[label] = { income, expense };
    }
    return out;
  }, [grouped]);

  return (
    <div className="space-y-5">
      {/* ── Title & Add CTA ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Family Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Search, filter, and audit all family spending &amp; earnings
          </p>
        </div>

        <Button
          size="md"
          onClick={onOpenQuickAdd}
          className="shadow-sm font-semibold text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span>Add Transaction</span>
        </Button>
      </div>

      {/* ── Quick Filter Chips (above search) ── */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {QUICK_FILTERS.map((qf) => (
          <button
            key={qf.value}
            onClick={() => {
              setQuickFilter(qf.value);
              // Clear advanced type/date from manual filters when quick filter changes
              setFilters((f) => ({ ...f, type: "ALL", startDate: "", endDate: "" }));
            }}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap",
              quickFilter === qf.value
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-white text-slate-700 border-border hover:bg-slate-50"
            )}
          >
            {qf.label}
          </button>
        ))}
        {quickFilter !== "ALL" && (
          <button
            onClick={() => setQuickFilter("ALL")}
            className="shrink-0 px-2 py-1 rounded-full text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Advanced Filters ── */}
      <TransactionFilters
        filters={filters}
        categories={categories}
        accounts={accounts}
        members={members}
        onChange={(newFilters) => { setFilters(newFilters); setQuickFilter("ALL"); }}
        onReset={() => { setFilters(initialFilters); setQuickFilter("ALL"); }}
      />

      {/* ── Transaction List ── */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-card" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-14 text-center bg-surface rounded-card border border-border p-6 shadow-soft">
          <div className="w-14 h-14 rounded-full bg-teal-50 text-primary flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No transactions found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search filters or record a new daily expense.
          </p>
          <button
            onClick={onOpenQuickAdd}
            className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-btn shadow-sm transition-all"
          >
            + Add New Expense
          </button>
        </div>
      ) : (
        <>
          {/* ── MOBILE: Date-grouped cards ── */}
          <div className="space-y-5 lg:hidden">
            {Object.entries(grouped).map(([label, txs]) => {
              const totals = dayTotals[label];
              return (
                <div key={label}>
                  {/* Date group header */}
                  <div className="flex items-center justify-between mb-2 px-0.5">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-slate-200 w-2" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold ml-3">
                      {totals.income > 0 && (
                        <span className="text-income">+{formatCurrency(totals.income)}</span>
                      )}
                      {totals.expense > 0 && (
                        <span className="text-expense">−{formatCurrency(totals.expense)}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {txs.map((t) => (
                      <TransactionCard
                        key={t.id}
                        transaction={t}
                        onClick={() => onSelectTransaction(t)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── DESKTOP: Clean data table ── */}
          <div className="hidden lg:block">
            <TransactionTable
              transactions={transactions}
              onSelectTransaction={onSelectTransaction}
            />
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs text-slate-600">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchTransactions(pagination.page - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchTransactions(pagination.page + 1)}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
