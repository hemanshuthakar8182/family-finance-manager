"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils/formatters";

interface MemberSpendingItem {
  name: string;
  amount: number;
}

interface MemberSpendingListProps {
  data: MemberSpendingItem[];
  totalExpense: number;
}

export function MemberSpendingList({ data, totalExpense }: MemberSpendingListProps) {
  if (!data || data.length === 0) {
    return (
      <div className="py-4 text-center text-secondary small">
        No family member spending recorded this month
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {data.map((member, idx) => {
        const percentage =
          totalExpense > 0 ? Math.round((member.amount / totalExpense) * 100) : 0;
        return (
          <div key={idx} className="d-flex flex-column gap-1">
            <div className="d-flex align-items-center justify-content-between small">
              <div className="d-flex align-items-center gap-2 overflow-hidden">
                <div
                  className="rounded-circle bg-light border text-dark fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "24px", height: "24px", fontSize: "11px" }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <span className="fw-semibold text-dark text-truncate">{member.name}</span>
              </div>
              <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-2">
                <span className="fw-bold text-dark">
                  {formatCurrency(member.amount)}
                </span>
                <span className="text-secondary small fw-medium text-end" style={{ width: "36px" }}>
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Bootstrap Progress bar */}
            <div className="progress" style={{ height: "6px" }}>
              <div
                className="progress-bar bg-primary"
                role="progressbar"
                style={{ width: `${Math.min(100, percentage)}%` }}
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

