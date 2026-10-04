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
      <div className="py-6 text-center text-slate-400 text-xs">
        No family member spending recorded this month
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((member, idx) => {
        const percentage =
          totalExpense > 0 ? Math.round((member.amount / totalExpense) * 100) : 0;
        return (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-slate-800">{member.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 font-amount">
                  {formatCurrency(member.amount)}
                </span>
                <span className="text-slate-400 text-[11px] font-medium w-8 text-right">
                  {percentage}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-surface-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
