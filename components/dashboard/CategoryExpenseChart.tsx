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
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
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
        <div className="p-2.5 bg-slate-900 text-white rounded-btn shadow-lg text-xs space-y-0.5">
          <p className="font-bold">{item.name}</p>
          <p className="text-slate-300 font-amount">
            {formatCurrency(item.amount)} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="w-full h-52">
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
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {data.slice(0, 5).map((item, idx) => {
          const percentage = total > 0 ? Math.round((item.amount / total) * 100) : 0;
          return (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color || "#0F766E" }}
                />
                <span className="font-medium text-slate-700 truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-bold text-slate-900 font-amount">
                  {formatCurrency(item.amount)}
                </span>
                <span className="text-slate-400 w-8 text-right font-medium">
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
