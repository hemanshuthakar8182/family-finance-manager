"use client";

import React from "react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { formatCurrency, formatTransactionDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

export interface TransactionCardProps {
  transaction: {
    id: string;
    type: "INCOME" | "EXPENSE";
    amount: number | string;
    date: Date | string;
    description?: string | null;
    notes?: string | null;
    category: {
      name: string;
      icon: string;
      color: string;
    };
    account?: {
      name: string;
    } | null;
    member: {
      user: {
        name: string;
      };
    };
  };
  onClick?: () => void;
}

export function TransactionCard({ transaction, onClick }: TransactionCardProps) {
  const isIncome = transaction.type === "INCOME";

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="flex items-center justify-between p-3.5 sm:p-4 rounded-card border border-border bg-surface hover:bg-slate-50/80 transition-all active:scale-[0.99] cursor-pointer shadow-soft text-left"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Category Icon */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm"
          style={{ backgroundColor: transaction.category.color || "#0F766E" }}
        >
          <CategoryIcon name={transaction.category.icon} size={18} />
        </div>

        {/* Details */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900 truncate">
              {transaction.category.name}
            </h4>
            {transaction.description && (
              <span className="text-xs text-slate-500 truncate hidden sm:inline">
                • {transaction.description}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 flex-wrap">
            <span className="font-medium text-slate-700">
              {transaction.member.user.name}
            </span>
            {transaction.account && (
              <>
                <span>•</span>
                <span className="text-slate-600 truncate">{transaction.account.name}</span>
              </>
            )}
            <span>•</span>
            <span>{formatTransactionDate(transaction.date)}</span>
          </div>

          {transaction.description && (
            <p className="text-xs text-slate-600 truncate sm:hidden mt-0.5">
              {transaction.description}
            </p>
          )}
        </div>
      </div>

      {/* Amount with sign and color */}
      <div className="text-right shrink-0 pl-3">
        <div
          className={cn(
            "text-base sm:text-lg font-bold font-amount tracking-tight",
            isIncome ? "text-income" : "text-slate-900"
          )}
        >
          {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
        </div>
        <span
          className={cn(
            "text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded",
            isIncome ? "bg-green-50 text-income" : "bg-red-50 text-expense"
          )}
        >
          {isIncome ? "Income" : "Expense"}
        </span>
      </div>
    </div>
  );
}
