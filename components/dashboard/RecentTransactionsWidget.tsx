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
      <div className="card rounded-card border p-4 text-center bg-surface shadow-sm">
        <div
          className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center mx-auto mb-3"
          style={{ width: "48px", height: "48px" }}
        >
          <Receipt style={{ width: "24px", height: "24px" }} />
        </div>
        <h4 className="h6 fw-bold text-dark mb-1">No transactions yet</h4>
        <p className="small text-secondary mx-auto mb-3" style={{ maxWidth: "320px" }}>
          Start tracking your family daily income and expenses in a few seconds.
        </p>
        <div>
          <button
            onClick={onOpenQuickAdd}
            className="btn btn-sm btn-primary rounded-btn fw-bold px-3 py-2 shadow-sm"
          >
            + Add First Transaction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-2">
      <div className="d-flex align-items-center justify-content-between px-1">
        <h3 className="h6 fw-bold text-dark mb-0">
          Recent Transactions
        </h3>
        <Link
          href="/transactions"
          className="small fw-semibold text-primary text-decoration-none d-flex align-items-center gap-1"
        >
          <span>View All</span>
          <ChevronRight style={{ width: "14px", height: "14px" }} />
        </Link>
      </div>

      <div className="d-flex flex-column gap-2">
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

