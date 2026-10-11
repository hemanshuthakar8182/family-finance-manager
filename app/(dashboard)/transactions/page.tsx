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
    <div className="d-flex flex-column gap-4">
      {/* ── Title & Add CTA ── */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">
            Family Transactions
          </h1>
          <p className="small text-secondary mb-0">
            Search, filter, and audit all family spending &amp; earnings
          </p>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Link
            href="/import"
            title="Import bank statement (CSV/Excel)"
            className="btn btn-sm btn-light border text-dark fw-semibold d-inline-flex align-items-center gap-1.5 py-1.5 px-3 rounded-btn text-decoration-none"
          >
            <UploadCloud style={{ width: "16px", height: "16px" }} className="text-primary" />
            <span className="d-none d-sm-inline">Import Statement</span>
          </Link>

          <button
            onClick={handleExportCSV}
            title="Export filtered transactions to CSV"
            type="button"
            className="btn btn-sm btn-light border text-dark fw-semibold d-inline-flex align-items-center gap-1.5 py-1.5 px-3 rounded-btn"
          >
            <Download style={{ width: "16px", height: "16px" }} className="text-primary" />
            <span className="d-none d-sm-inline">Export CSV</span>
          </button>

          <Button
            size="md"
            onClick={onOpenQuickAdd}
            className="btn-primary text-white fw-semibold small d-inline-flex align-items-center gap-1.5 py-1.5 px-3 rounded-btn shadow-sm"
          >
            <Plus style={{ width: "16px", height: "16px" }} />
            <span>Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* ── Unified Filters ── */}
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
        <div className="d-flex flex-column gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card rounded-card border bg-surface p-3 d-flex flex-row align-items-center justify-content-between shadow-xs">
              <div className="d-flex align-items-center gap-3">
                <div className="skeleton-shimmer rounded-circle" style={{ width: "38px", height: "38px" }} />
                <div className="d-flex flex-column gap-1.5">
                  <div className="skeleton-shimmer" style={{ width: "130px", height: "14px" }} />
                  <div className="skeleton-shimmer" style={{ width: "90px", height: "11px" }} />
                </div>
              </div>
              <div className="d-flex flex-column align-items-end gap-1.5">
                <div className="skeleton-shimmer" style={{ width: "70px", height: "16px" }} />
                <div className="skeleton-shimmer rounded-pill" style={{ width: "45px", height: "12px" }} />
              </div>
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-5 text-center bg-surface rounded-card border shadow-sm p-4">
          <div 
            className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: "54px", height: "54px" }}
          >
            <Receipt style={{ width: "26px", height: "26px" }} />
          </div>
          <h3 className="h6 fw-bold text-dark mb-1">No transactions found</h3>
          <p className="small text-secondary mb-3 mx-auto" style={{ maxWidth: "360px" }}>
            Try adjusting your search filters or record a new daily expense.
          </p>
          <button
            onClick={onOpenQuickAdd}
            type="button"
            className="btn btn-sm btn-primary text-white fw-semibold rounded-btn px-4 py-2"
          >
            + Add New Expense
          </button>
        </div>
      ) : (
        <>
          {/* ── MOBILE: Date-grouped cards ── */}
          <div className="d-flex flex-column gap-4 d-lg-none">
            {Object.entries(grouped).map(([label, txs]) => {
              const totals = dayTotals[label];
              return (
                <div key={label}>
                  {/* Date group header */}
                  <div className="d-flex align-items-center justify-content-between mb-2 px-1">
                    <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
                      {label}
                    </span>
                    <div className="d-flex align-items-center gap-2 small fw-semibold" style={{ fontSize: "11px" }}>
                      {totals.income > 0 && (
                        <span className="text-income">+{formatCurrency(totals.income)}</span>
                      )}
                      {totals.expense > 0 && (
                        <span className="text-expense">−{formatCurrency(totals.expense)}</span>
                      )}
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2">
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
          <div className="d-none d-lg-block">
            <TransactionTable
              transactions={transactions}
              onSelectTransaction={onSelectTransaction}
            />
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex align-items-center justify-content-between pt-3 border-top small text-secondary">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} total)
              </span>
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchTransactions(pagination.page - 1)}
                  className="small"
                >
                  <ChevronLeft style={{ width: "14px", height: "14px" }} className="me-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchTransactions(pagination.page + 1)}
                  className="small"
                >
                  Next <ChevronRight style={{ width: "14px", height: "14px" }} className="ms-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
