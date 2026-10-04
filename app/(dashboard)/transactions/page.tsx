"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDashboard } from "@/components/providers/DashboardProvider";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionCard } from "@/components/transactions/TransactionCard";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils/formatters";
import { Plus, Receipt, ChevronLeft, ChevronRight, Download, UploadCloud } from "lucide-react";
import Link from "next/link";

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

export default function TransactionsPage() {
  const { openQuickAdd: onOpenQuickAdd, openTransaction: onSelectTransaction, refreshTrigger } = useDashboard();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalPages: 1, totalCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("quickAdd") === "true") {
        onOpenQuickAdd();
      }
    }
  }, [onOpenQuickAdd]);

  const initialFilters = {
    search: "",
    type: "ALL" as "ALL" | "EXPENSE" | "INCOME" | "TRANSFER",
    categoryId: "",
    accountId: "",
    memberId: "",
    startDate: "",
    endDate: "",
  };

  const [filters, setFilters] = useState(initialFilters);

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

  const fetchTransactions = useCallback((page = 1) => {
    setIsLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(pagination.limit));

    if (filters.search) params.set("search", filters.search);
    if (filters.type !== "ALL") params.set("type", filters.type);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.accountId) params.set("accountId", filters.accountId);
    if (filters.memberId) params.set("memberId", filters.memberId);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);

    fetch(`/api/transactions?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.items || []);
        if (data.pagination) setPagination(data.pagination);
      })
      .catch((err) => console.error("Error fetching transactions:", err))
      .finally(() => setIsLoading(false));
  }, [filters, pagination.limit]);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions, refreshTrigger]);

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
        else if (t.type === "EXPENSE") expense += Number(t.amount);
      }
      out[label] = { income, expense };
    }
    return out;
  }, [grouped]);

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.type !== "ALL") params.set("type", filters.type);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.accountId) params.set("accountId", filters.accountId);
    if (filters.memberId) params.set("memberId", filters.memberId);
    if (filters.startDate) params.set("startDate", filters.startDate);
    if (filters.endDate) params.set("endDate", filters.endDate);

    window.location.href = `/api/transactions/export?${params.toString()}`;
  };

  return (
    <div className="space-y-5">
      {/* ── Title & Add CTA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Family Transactions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Search, filter, and audit all family spending &amp; earnings
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            href="/import"
            title="Import bank statement (CSV/Excel)"
            className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-btn border border-border bg-surface text-slate-700 hover:bg-surface-muted text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <UploadCloud className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Import Statement</span>
          </Link>

          <button
            onClick={handleExportCSV}
            title="Export filtered transactions to CSV"
            className="h-9 sm:h-10 px-2.5 sm:px-3 rounded-btn border border-border bg-surface text-slate-700 hover:bg-surface-muted text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Download className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <Button
            size="md"
            onClick={onOpenQuickAdd}
            className="h-9 sm:h-10 px-3 sm:px-4 shadow-sm font-semibold text-xs sm:text-sm whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-1.5" />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* ── Unified Filters (Single clear row with type, presets, accounts, categories, members) ── */}
      <TransactionFilters
        filters={filters}
        categories={categories}
        accounts={accounts}
        members={members}
        totalResults={pagination.totalCount}
        onChange={(newFilters) => setFilters(newFilters)}
        onReset={() => setFilters(initialFilters)}
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
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No transactions found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search filters or record a new daily expense.
          </p>
          <button
            onClick={onOpenQuickAdd}
            className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold rounded-btn shadow-sm transition-all"
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
