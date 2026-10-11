"use client";

import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { formatCurrency } from "@/lib/utils/formatters";

interface CategoryBreakdownItem {
  name: string;
  color: string;
  icon: string;
  amount: number;
}

interface CategoryExpenseChartProps {
  data: CategoryBreakdownItem[];
}

export function CategoryExpenseChart({ data }: CategoryExpenseChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-secondary small" style={{ height: "256px" }}>
        <span>No expense categories this month</span>
      </div>
    );
  }

  const total = data.reduce((acc, curr) => acc + curr.amount, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = total > 0 ? Math.round((item.amount / total) * 100) : 0;
      return (
        <div className="p-2 bg-surface border rounded-card shadow-sm small">
          <p className="fw-bold text-dark mb-0">{item.name}</p>
          <p className="text-secondary small mb-0">
            {formatCurrency(item.amount)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div className="w-100" style={{ height: "210px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || "#0F766E"} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category legend list */}
      <div className="d-flex flex-column gap-2 overflow-y-auto pe-1" style={{ maxHeight: "160px" }}>
        {data.slice(0, 5).map((item, idx) => {
          const percentage = total > 0 ? Math.round((item.amount / total) * 100) : 0;
          return (
            <div key={idx} className="d-flex align-items-center justify-content-between small">
              <div className="d-flex align-items-center gap-2 overflow-hidden">
                <span
                  className="rounded-circle flex-shrink-0"
                  style={{ width: "12px", height: "12px", backgroundColor: item.color || "#0F766E" }}
                />
                <span className="fw-medium text-dark text-truncate">{item.name}</span>
              </div>
              <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-2">
                <span className="fw-bold text-dark">
                  {formatCurrency(item.amount)}
                </span>
                <span className="text-secondary fw-medium text-end" style={{ width: "36px" }}>
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

