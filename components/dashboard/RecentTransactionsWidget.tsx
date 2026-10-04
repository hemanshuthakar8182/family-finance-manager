"use client";

import React from "react";
import Link from "next/link";
import { TransactionCard } from "@/components/transactions/TransactionCard";
import { ChevronRight, Receipt } from "lucide-react";

interface RecentTransactionsWidgetProps {
  transactions: any[];
  onSelectTransaction: (t: any) => void;
  onOpenQuickAdd: () => void;
}

export function RecentTransactionsWidget({
  transactions,
  onSelectTransaction,
  onOpenQuickAdd,
}: RecentTransactionsWidgetProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="py-8 text-center bg-surface rounded-card border border-border p-6 shadow-soft">
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
          <Receipt className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No transactions yet</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Start tracking your family daily income and expenses in a few seconds.
        </p>
        <button
          onClick={onOpenQuickAdd}
          className="mt-4 px-4 py-2 bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-semibold rounded-btn shadow-sm transition-all"
        >
          + Add First Transaction
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          Recent Transactions
        </h3>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-2">
        {transactions.map((t) => (
          <TransactionCard
            key={t.id}
            transaction={t}
            onClick={() => onSelectTransaction(t)}
          />
        ))}
      </div>
    </div>
  );
}
