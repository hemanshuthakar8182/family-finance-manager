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
    <div className="overflow-x-auto rounded-card border border-border bg-surface shadow-soft">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3 px-4">Date & Time</th>
            <th className="py-3 px-4">Category / Direction</th>
            <th className="py-3 px-4">Description</th>
            <th className="py-3 px-4">Member</th>
            <th className="py-3 px-4">Account</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {transactions.map((t) => {
            const isIncome = t.type === "INCOME";
            const isTransfer = t.type === "TRANSFER";

            return (
              <tr
                key={t.id}
                onClick={() => onSelectTransaction(t)}
                className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                  {formatTransactionDate(t.date)}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{
                        backgroundColor: isTransfer
                          ? "#0284C7"
                          : t.category?.color || "#0F766E",
                      }}
                    >
                      {isTransfer ? (
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      ) : (
                        <CategoryIcon name={t.category?.icon || "tag"} size={14} />
                      )}
                    </div>
                    <span className="font-semibold text-slate-900">
                      {isTransfer
                        ? `${t.account?.name || "Account"} → ${t.toAccount?.name || "Account"}`
                        : t.category?.name || "Uncategorized"}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                  {t.description || <span className="text-slate-400 italic">None</span>}
                </td>
                <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {t.member.user.name}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-xs">
                  {isTransfer ? (
                    <span className="font-medium text-slate-700">
                      {t.account?.name} → {t.toAccount?.name}
                    </span>
                  ) : (
                    t.account?.name || <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <Badge
                    variant={
                      isIncome ? "income" : isTransfer ? "info" : "expense"
                    }
                  >
                    {isIncome ? "Income" : isTransfer ? "Transfer" : "Expense"}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <span
                    className={cn(
                      "font-bold font-amount text-base",
                      isIncome
                        ? "text-income"
                        : isTransfer
                        ? "text-blue-600"
                        : "text-slate-900"
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
