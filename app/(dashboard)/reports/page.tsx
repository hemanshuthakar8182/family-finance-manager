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
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Download,
  FileText,
} from "lucide-react";
import { generateMonthlyPDFReport } from "@/lib/utils/pdf-generator";
import { cn } from "@/lib/utils/cn";

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
    <div className="d-flex flex-column gap-4">
      {/* Header & Period Selector */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-foreground mb-1">
            Financial Reports
          </h1>
          <p className="small text-muted mb-0">
            Deep dive into family spending trends, savings rate, and category distribution
          </p>
        </div>

        <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 flex-shrink-0">
          {/* Period Selector Tabs */}
          <div className="d-flex align-items-center gap-1 bg-surface-muted p-1 rounded-btn overflow-x-auto text-nowrap">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                type="button"
                className={cn(
                  "btn btn-sm py-1 px-2.5 rounded-btn small fw-semibold transition",
                  period === p.value
                    ? "btn-primary text-white shadow-sm fw-bold"
                    : "btn-link text-secondary text-decoration-none"
                )}
                style={{ fontSize: "11px" }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="d-flex align-items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDownloadPDF}
              disabled={!report || isLoading}
              title="Download formatted PDF financial statement"
              type="button"
              className="btn btn-sm btn-outline-success d-flex align-items-center justify-content-center gap-1.5 shadow-sm fw-semibold flex-grow-1 flex-sm-grow-0"
            >
              <FileText style={{ width: "14px", height: "14px" }} />
              <span>PDF Statement</span>
            </button>

            <button
              onClick={handleExportCSV}
              title="Download CSV report"
              type="button"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center gap-1.5 shadow-sm fw-semibold flex-grow-1 flex-sm-grow-0"
            >
              <Download style={{ width: "14px", height: "14px" }} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range Picker Bar */}
      {period === "CUSTOM" && (
        <div className="p-3 bg-light rounded-card border d-flex flex-wrap align-items-center gap-3">
          <div className="d-flex align-items-center gap-2 small text-secondary">
            <span className="fw-semibold">Start:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="form-control form-control-sm rounded-input py-1 px-2.5 small"
              style={{ width: "140px" }}
            />
          </div>
          <div className="d-flex align-items-center gap-2 small text-secondary">
            <span className="fw-semibold">End:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="form-control form-control-sm rounded-input py-1 px-2.5 small"
              style={{ width: "140px" }}
            />
          </div>
          <button
            onClick={handleApplyCustomDates}
            type="button"
            className="btn btn-sm btn-primary rounded-btn fw-semibold shadow-sm"
          >
            Apply Range
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="row g-3">
        <div className="col-6 col-lg-3">
          <div className="card-elevated hover-lift border-success-subtle bg-surface p-3 h-100">
            <div className="d-flex align-items-center justify-content-between text-secondary small mb-1">
              <span className="fw-semibold" style={{ fontSize: "11px" }}>Total Income</span>
              <div className="rounded-circle bg-success-soft d-flex align-items-center justify-content-center" style={{ width: "26px", height: "26px" }}>
                <TrendingUp style={{ width: "14px", height: "14px" }} />
              </div>
            </div>
            <div className="fs-5 fs-sm-4 fw-bold font-amount text-income">
              {formatCurrency(report?.totalIncome || 0)}
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card-elevated hover-lift border-danger-subtle bg-surface p-3 h-100">
            <div className="d-flex align-items-center justify-content-between text-secondary small mb-1">
              <span className="fw-semibold" style={{ fontSize: "11px" }}>Total Expense</span>
              <div className="rounded-circle bg-danger-soft d-flex align-items-center justify-content-center" style={{ width: "26px", height: "26px" }}>
                <TrendingDown style={{ width: "14px", height: "14px" }} />
              </div>
            </div>
            <div className="fs-5 fs-sm-4 fw-bold font-amount text-expense">
              {formatCurrency(report?.totalExpense || 0)}
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card-elevated hover-lift bg-surface p-3 h-100">
            <div className="d-flex align-items-center justify-content-between text-secondary small mb-1">
              <span className="fw-semibold" style={{ fontSize: "11px" }}>Net Savings</span>
              <div className="rounded-circle bg-primary-soft d-flex align-items-center justify-content-center" style={{ width: "26px", height: "26px" }}>
                <PiggyBank style={{ width: "14px", height: "14px" }} />
              </div>
            </div>
            <div className="fs-5 fs-sm-4 fw-bold font-amount text-foreground">
              {formatCurrency(report?.netSavings || 0)}
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card-elevated hover-lift bg-surface p-3 h-100">
            <div className="d-flex align-items-center justify-content-between text-secondary small mb-1">
              <span className="fw-semibold" style={{ fontSize: "11px" }}>Savings Rate</span>
              <Badge variant={report?.savingsRate >= 20 ? "income" : "warning"}>
                {report?.savingsRate || 0}%
              </Badge>
            </div>
            <div className="fs-5 fs-sm-4 fw-bold font-amount text-foreground">
              {report?.savingsRate || 0}%
            </div>
            <p className="small text-secondary mb-0 mt-1" style={{ fontSize: "10px" }}>
              {report?.transactionCount || 0} recorded transactions
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="row g-3">
        {/* Timeline Bar Chart */}
        <div className="col-12 col-lg-8">
          <Card className="h-100">
            <CardHeader>
              <CardTitle>Income &amp; Expense Timeline</CardTitle>
            </CardHeader>
            <div className="w-100" style={{ height: "300px" }}>
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
                      border: "none",
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
        </div>

        {/* Category Breakdown Table */}
        <div className="col-12 col-lg-4">
          <Card className="h-100">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <div className="d-flex flex-column gap-3">
              {report?.categoryBreakdown && report.categoryBreakdown.length > 0 ? (
                report.categoryBreakdown.map((cat: any, idx: number) => (
                  <div key={idx} className="d-flex flex-column gap-1">
                    <div className="d-flex align-items-center justify-content-between small">
                      <span className="fw-semibold text-foreground text-truncate">
                        {cat.name}
                      </span>
                      <span className="fw-bold font-amount text-foreground">
                        {formatCurrency(cat.amount)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="progress rounded-pill bg-light" style={{ height: "6px" }}>
                      <div
                        className="progress-bar rounded-pill"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color || "#0F766E",
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center small text-secondary py-4 mb-0">
                  No expense data in this period
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Member and Account Breakdown Grid */}
      <div className="row g-3">
        {/* Spending by Member */}
        <div className="col-12 col-md-6">
          <Card className="h-100">
            <CardHeader>
              <CardTitle>Spending by Family Member</CardTitle>
            </CardHeader>
            <div className="d-flex flex-column gap-3">
              {report?.memberBreakdown && report.memberBreakdown.length > 0 ? (
                report.memberBreakdown.map((m: any, idx: number) => (
                  <div key={idx} className="d-flex flex-column gap-1">
                    <div className="d-flex align-items-center justify-content-between small">
                      <span className="fw-semibold text-foreground">{m.name}</span>
                      <span className="fw-bold font-amount text-foreground">
                        {formatCurrency(m.amount)} ({m.percentage}%)
                      </span>
                    </div>
                    <div className="progress rounded-pill bg-light" style={{ height: "6px" }}>
                      <div
                        className="progress-bar rounded-pill bg-primary"
                        style={{ width: `${m.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center small text-secondary py-4 mb-0">
                  No member spending in this period
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Spending by Account */}
        <div className="col-12 col-md-6">
          <Card className="h-100">
            <CardHeader>
              <CardTitle>Spending by Account / Wallet</CardTitle>
            </CardHeader>
            <div className="d-flex flex-column gap-2">
              {report?.accountBreakdown && report.accountBreakdown.length > 0 ? (
                report.accountBreakdown.map((acc: any, idx: number) => (
                  <div
                    key={idx}
                    className="d-flex align-items-center justify-content-between p-2.5 rounded-btn bg-light border small"
                  >
                    <span className="fw-semibold text-foreground">{acc.name}</span>
                    <span className="fw-bold font-amount text-foreground">
                      {formatCurrency(acc.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center small text-secondary py-4 mb-0">
                  No account spending in this period
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
