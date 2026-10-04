"use client";

import React, { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@/lib/utils/formatters";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Receipt,
  Calendar,
  Download,
  FileText,
} from "lucide-react";
import { generateMonthlyPDFReport } from "@/lib/utils/pdf-generator";

export default function ReportsPage() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const todayStr = now.toISOString().split("T")[0];

  const [period, setPeriod] = useState<string>("THIS_MONTH");
  const [customStart, setCustomStart] = useState<string>(firstDayOfMonth);
  const [customEnd, setCustomEnd] = useState<string>(todayStr);
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = useCallback((p: string, start?: string, end?: string) => {
    setIsLoading(true);
    let url = `/api/reports?period=${p}`;
    if (p === "CUSTOM" && start && end) {
      url += `&customStart=${start}&customEnd=${end}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => setReport(data))
      .catch((err) => console.error("Error loading report:", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchReport(period, customStart, customEnd);
  }, [period, customStart, customEnd, fetchReport]);

  const handleApplyCustomDates = () => {
    fetchReport("CUSTOM", customStart, customEnd);
  };

  const handleExportCSV = () => {
    let url = `/api/transactions/export?`;
    if (period === "CUSTOM") {
      url += `startDate=${customStart}&endDate=${customEnd}`;
    } else if (report?.startDate && report?.endDate) {
      const s = new Date(report.startDate).toISOString().split("T")[0];
      const e = new Date(report.endDate).toISOString().split("T")[0];
      url += `startDate=${s}&endDate=${e}`;
    }
    window.location.href = url;
  };

  const handleDownloadPDF = () => {
    if (!report) return;
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const rDate = report.startDate ? new Date(report.startDate) : new Date();
    const monthName = monthNames[rDate.getMonth()];
    const year = rDate.getFullYear();

    generateMonthlyPDFReport({
      familyName: report.familyName || "Family",
      monthName,
      year,
      generatedAt: new Date(),
      summary: {
        totalIncome: report.totalIncome || 0,
        totalExpense: report.totalExpense || 0,
        netSavings: report.netSavings || 0,
        savingsRate: report.savingsRate || 0,
      },
      categories: (report.categoryBreakdown || []).map((c: any) => ({
        name: c.name,
        amount: c.amount,
        percentage: c.percentage,
      })),
      members: (report.memberBreakdown || []).map((m: any) => ({
        name: m.name,
        role: "Member",
        amount: m.amount,
        percentage: m.percentage,
      })),
      topTransactions: report.topTransactions || [],
    });
  };

  const periods = [
    { label: "This Week", value: "THIS_WEEK" },
    { label: "This Month", value: "THIS_MONTH" },
    { label: "Last Month", value: "LAST_MONTH" },
    { label: "This Year", value: "THIS_YEAR" },
    { label: "Custom Range", value: "CUSTOM" },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Financial Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Deep dive into family spending trends, savings rate, and category distribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-btn overflow-x-auto">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 rounded-btn text-xs font-semibold whitespace-nowrap transition-all ${
                  period === p.value
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={!report || isLoading}
            title="Download formatted PDF financial statement"
            className="px-3 py-1.5 rounded-btn border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">PDF Statement</span>
          </button>

          <button
            onClick={handleExportCSV}
            title="Download CSV report"
            className="px-3 py-1.5 rounded-btn border border-border bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker Bar */}
      {period === "CUSTOM" && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 rounded-card border border-border">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">Start:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="h-8 px-2.5 rounded-btn border border-border text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">End:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="h-8 px-2.5 rounded-btn border border-border text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            />
          </div>
          <button
            onClick={handleApplyCustomDates}
            className="px-3 h-8 bg-primary text-primary-foreground rounded-btn text-xs font-semibold hover:bg-primary-hover transition-colors shadow-xs"
          >
            Apply Range
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-card border border-green-100 bg-surface shadow-soft">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold">Total Income</span>
            <TrendingUp className="w-4 h-4 text-income" />
          </div>
          <div className="text-lg sm:text-2xl font-bold font-amount text-income">
            {formatCurrency(report?.totalIncome || 0)}
          </div>
        </div>

        <div className="p-4 rounded-card border border-red-100 bg-surface shadow-soft">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold">Total Expense</span>
            <TrendingDown className="w-4 h-4 text-expense" />
          </div>
          <div className="text-lg sm:text-2xl font-bold font-amount text-expense">
            {formatCurrency(report?.totalExpense || 0)}
          </div>
        </div>

        <div className="p-4 rounded-card border border-teal-100 bg-surface shadow-soft">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold">Net Savings</span>
            <PiggyBank className="w-4 h-4 text-primary" />
          </div>
          <div className="text-lg sm:text-2xl font-bold font-amount text-slate-900">
            {formatCurrency(report?.netSavings || 0)}
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-soft">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
            <span className="font-semibold">Savings Rate</span>
            <Badge variant={report?.savingsRate >= 20 ? "income" : "warning"}>
              {report?.savingsRate || 0}%
            </Badge>
          </div>
          <div className="text-lg sm:text-2xl font-bold font-amount text-slate-900">
            {report?.savingsRate || 0}%
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {report?.transactionCount || 0} recorded transactions
          </p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income & Expense Timeline</CardTitle>
          </CardHeader>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={report?.timeline || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                />
                <Tooltip
                  formatter={(val: any) => [formatCurrency(val), ""]}
                  contentStyle={{
                    backgroundColor: "#0F172A",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: "10px", fontSize: "12px" }}
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#16A34A"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#DC2626"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown Table & Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {report?.categoryBreakdown && report.categoryBreakdown.length > 0 ? (
              report.categoryBreakdown.map((cat: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate">
                      {cat.name}
                    </span>
                    <span className="font-bold text-slate-900 font-amount">
                      {formatCurrency(cat.amount)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color || "#0F766E",
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-slate-400 py-8">
                No expense data in this period
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Member and Account Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spending by Member */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Family Member</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {report?.memberBreakdown && report.memberBreakdown.length > 0 ? (
              report.memberBreakdown.map((m: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{m.name}</span>
                    <span className="font-bold text-slate-900 font-amount">
                      {formatCurrency(m.amount)} ({m.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${m.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-slate-400 py-6">
                No member spending in this period
              </p>
            )}
          </div>
        </Card>

        {/* Spending by Account */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Account / Wallet</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {report?.accountBreakdown && report.accountBreakdown.length > 0 ? (
              report.accountBreakdown.map((acc: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-btn bg-slate-50 border border-slate-100 text-xs"
                >
                  <span className="font-semibold text-slate-800">{acc.name}</span>
                  <span className="font-bold text-slate-900 font-amount">
                    {formatCurrency(acc.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-slate-400 py-6">
                No account spending in this period
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
