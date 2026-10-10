"use client";

import React from "react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatTransactionDate } from "@/lib/utils/formatters";
import { ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TransactionTableProps {
  transactions: any[];
  onSelectTransaction: (transaction: any) => void;
}

export function TransactionTable({ transactions, onSelectTransaction }: TransactionTableProps) {
  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="table-responsive rounded-card border bg-surface shadow-sm">
      <table className="table table-hover align-middle mb-0 small">
        <thead className="table-light border-bottom">
          <tr className="text-secondary text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
            <th className="py-3 px-3">Date & Time</th>
            <th className="py-3 px-3">Category / Direction</th>
            <th className="py-3 px-3">Description</th>
            <th className="py-3 px-3">Member</th>
            <th className="py-3 px-3">Account</th>
            <th className="py-3 px-3">Type</th>
            <th className="py-3 px-3 text-end">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const isIncome = t.type === "INCOME";
            const isTransfer = t.type === "TRANSFER";

            return (
              <tr
                key={t.id}
                onClick={() => onSelectTransaction(t)}
                style={{ cursor: "pointer" }}
              >
                <td className="py-3 px-3 text-secondary text-nowrap" style={{ fontSize: "11px" }}>
                  {formatTransactionDate(t.date)}
                </td>
                <td className="py-3 px-3 text-nowrap">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm"
                      style={{
                        width: "28px",
                        height: "28px",
                        backgroundColor: isTransfer
                          ? "#0284C7"
                          : t.category?.color || "#0F766E",
                      }}
                    >
                      {isTransfer ? (
                        <ArrowRightLeft style={{ width: "14px", height: "14px" }} />
                      ) : (
                        <CategoryIcon name={t.category?.icon || "tag"} size={14} />
                      )}
                    </div>
                    <span className="fw-semibold text-dark">
                      {isTransfer
                        ? `${t.account?.name || "Account"} → ${t.toAccount?.name || "Account"}`
                        : t.category?.name || "Uncategorized"}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-dark text-truncate" style={{ maxWidth: "220px" }}>
                  {t.description || <span className="text-secondary fst-italic">None</span>}
                </td>
                <td className="py-3 px-3 text-dark text-nowrap">
                  <span className="d-inline-flex align-items-center gap-1.5 fw-medium">
                    <span 
                      className="rounded-circle bg-primary d-inline-block"
                      style={{ width: "8px", height: "8px" }}
                    />
                    {t.member.user.name}
                  </span>
                </td>
                <td className="py-3 px-3 text-secondary text-nowrap" style={{ fontSize: "11px" }}>
                  {isTransfer ? (
                    <span className="fw-medium text-dark">
                      {t.account?.name} → {t.toAccount?.name}
                    </span>
                  ) : (
                    t.account?.name || <span className="text-secondary">—</span>
                  )}
                </td>
                <td className="py-3 px-3 text-nowrap">
                  <Badge
                    variant={
                      isIncome ? "income" : isTransfer ? "info" : "expense"
                    }
                  >
                    {isIncome ? "Income" : isTransfer ? "Transfer" : "Expense"}
                  </Badge>
                </td>
                <td className="py-3 px-3 text-end text-nowrap">
                  <span
                    className={cn(
                      "fw-bold font-amount fs-6",
                      isIncome
                        ? "text-income"
                        : isTransfer
                        ? "text-primary"
                        : "text-dark"
                    )}
                  >
                    {isIncome ? "+" : isTransfer ? "⇄ " : "- "}
                    {formatCurrency(t.amount)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
