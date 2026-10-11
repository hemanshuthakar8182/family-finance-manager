"use client";

import React from "react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { formatTransactionDate } from "@/lib/utils/formatters";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { ArrowRightLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface TransactionCardProps {
  transaction: {
    id: string;
    type: "INCOME" | "EXPENSE" | "TRANSFER";
    amount: number | string;
    date: Date | string;
    description?: string | null;
    notes?: string | null;
    category?: {
      name: string;
      icon: string;
      color: string;
    } | null;
    account?: {
      name: string;
    } | null;
    toAccount?: {
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
  const isTransfer = transaction.type === "TRANSFER";

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      className="card-elevated d-flex align-items-center justify-content-between p-2.5 p-sm-3 rounded-card border bg-surface hover-lift text-start"
      style={{ cursor: "pointer" }}
    >
      <div className="d-flex align-items-center gap-2.5 gap-sm-3 overflow-hidden">
        {/* Category or Transfer Icon */}
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-white shadow-sm"
          style={{
            width: "36px",
            height: "36px",
            backgroundColor: isTransfer
              ? "#0284C7"
              : transaction.category?.color || "#0F766E",
          }}
        >
          {isTransfer ? (
            <ArrowRightLeft style={{ width: "16px", height: "16px" }} />
          ) : (
            <CategoryIcon name={transaction.category?.icon || "tag"} size={17} />
          )}
        </div>

        {/* Details */}
        <div className="overflow-hidden">
          <div className="d-flex align-items-center gap-2">
            <h4 className="small fw-bold text-foreground text-truncate mb-0" style={{ fontSize: "13px" }}>
              {isTransfer
                ? `${transaction.account?.name || "Account"} → ${transaction.toAccount?.name || "Account"}`
                : transaction.category?.name || "Uncategorized"}
            </h4>
            {transaction.description && (
              <span className="small text-secondary text-truncate d-none d-sm-inline" style={{ fontSize: "11px" }}>
                • {transaction.description}
              </span>
            )}
          </div>

          <div className="d-flex align-items-center gap-1.5 text-secondary small mt-0.5 flex-wrap" style={{ fontSize: "11px" }}>
            <span className="badge bg-surface-muted text-foreground border rounded-pill py-0.5 px-1.5 fw-semibold d-inline-flex align-items-center gap-1">
              <span 
                className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center fw-bold" 
                style={{ width: "13px", height: "13px", fontSize: "8px" }}
              >
                {transaction.member?.user?.name?.charAt(0).toUpperCase() || "M"}
              </span>
              <span className="text-truncate" style={{ maxWidth: "80px" }}>{transaction.member?.user?.name}</span>
            </span>
            {!isTransfer && transaction.account && (
              <>
                <span>•</span>
                <span className="text-secondary text-truncate" style={{ maxWidth: "85px" }}>{transaction.account.name}</span>
              </>
            )}
            <span>•</span>
            <span className="text-nowrap">{formatTransactionDate(transaction.date)}</span>
          </div>

          {transaction.description && (
            <p className="small text-secondary text-truncate d-sm-none mb-0 mt-0.5" style={{ fontSize: "11px" }}>
              {transaction.description}
            </p>
          )}
        </div>
      </div>

      {/* Amount with tabular formatting and badge */}
      <div className="text-end flex-shrink-0 ps-2 ps-sm-3">
        <div className="text-nowrap">
          <CurrencyDisplay
            amount={transaction.amount}
            showSign={true}
            type={transaction.type}
            size="sm"
          />
        </div>
        <span
          className={cn(
            "badge rounded-pill fw-bold mt-0.5",
            isIncome
              ? "bg-success-subtle text-success"
              : isTransfer
              ? "bg-primary-subtle text-primary"
              : "bg-danger-subtle text-danger"
          )}
          style={{ fontSize: "9px" }}
        >
          {isIncome ? "Income" : isTransfer ? "Transfer" : "Expense"}
        </span>
      </div>
    </div>
  );
}
