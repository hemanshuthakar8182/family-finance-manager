"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils/formatters";
import { Target, Plus, Trash2, AlertTriangle, CheckCircle2, XCircle, Pencil } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function BudgetsPage() {
  const { showToast } = useToast();

  const [budgets, setBudgets] = useState<any[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit Budget state
  const [editBudget, setEditBudget] = useState<any | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [editSubmitting, setEditSubmitting] = useState<boolean>(false);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
  });

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBudget || !editAmount || Number(editAmount) <= 0) {
      showToast({ type: "error", title: "Please enter a valid amount greater than 0" });
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: editBudget.category.id,
          amount: Number(editAmount),
          month: selectedMonth,
          year: selectedYear,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update budget");

      showToast({
        type: "success",
        title: "Budget Updated",
        message: `${editBudget.category.name}: ${formatCurrency(Number(editAmount))}`,
      });
      setEditBudget(null);
      fetchBudgets();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    } finally {
      setEditSubmitting(false);
    }
  };

  const fetchBudgets = useCallback(() => {
    setIsLoading(true);
    fetch(`/api/budgets?month=${selectedMonth}&year=${selectedYear}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBudgets(data);
      })
      .finally(() => setIsLoading(false));
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setExpenseCategories(data.filter((c: any) => c.type === "EXPENSE"));
        }
      });
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.amount || Number(formData.amount) <= 0) {
      showToast({ type: "error", title: "Please select a category and enter a valid amount" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: formData.categoryId,
          amount: Number(formData.amount),
          month: selectedMonth,
          year: selectedYear,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save budget");

      showToast({ type: "success", title: "Budget Saved", message: `For ${MONTH_NAMES[selectedMonth - 1]}` });
      setFormData({ categoryId: "", amount: "" });
      setIsAddOpen(false);
      fetchBudgets();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (budgetId: string) => {
    if (!confirm("Delete this budget?")) return;

    try {
      const res = await fetch(`/api/budgets/${budgetId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete budget");
      showToast({ type: "success", title: "Budget Removed" });
      fetchBudgets();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "EXCEEDED":
        return { icon: XCircle, color: "text-expense", bg: "bg-red-50", border: "border-red-200", barColor: "#DC2626" };
      case "WARNING":
        return { icon: AlertTriangle, color: "text-warning", bg: "bg-amber-50", border: "border-amber-200", barColor: "#D97706" };
      default:
        return { icon: CheckCircle2, color: "text-income", bg: "bg-green-50", border: "border-green-100", barColor: "#16A34A" };
    }
  };

  // Aggregate totals for the summary gauge
  const totalBudgeted = budgets.reduce((s: number, b: any) => s + Number(b.budgetAmount), 0);
  const totalSpent = budgets.reduce((s: number, b: any) => s + Number(b.spent), 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
  const overallPct = totalBudgeted > 0 ? Math.min(100, Math.round((totalSpent / totalBudgeted) * 100)) : 0;
  const overallStatus = overallPct >= 100 ? "EXCEEDED" : overallPct >= 80 ? "WARNING" : "SAFE";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Monthly Budgets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Set category spending limits and track progress
          </p>
        </div>
        <Button size="md" onClick={() => setIsAddOpen(true)} className="font-semibold shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Set Budget
        </Button>
      </div>

      {/* Month-Year Selector */}
      <div className="flex items-center gap-3 p-3 rounded-card border border-border bg-surface shadow-soft">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="h-9 px-3 rounded-btn border border-border text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {MONTH_NAMES.map((m, idx) => (
            <option key={idx} value={idx + 1}>{m}</option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="h-9 px-3 rounded-btn border border-border text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <span className="text-xs text-slate-400 font-medium ml-auto">
          {budgets.length} budget{budgets.length !== 1 ? "s" : ""} set
        </span>
      </div>

      {/* ── Household Budget Aggregate Summary ── */}
      {!isLoading && budgets.length > 0 && (
        <div className={cn(
          "p-4 rounded-card border shadow-soft",
          overallStatus === "EXCEEDED" ? "border-red-200 bg-red-50/50" :
          overallStatus === "WARNING" ? "border-amber-200 bg-amber-50/50" :
          "border-primary/20 bg-primary/5"
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">
              Household Budget — {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </span>
            <span className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full",
              overallStatus === "EXCEEDED" ? "bg-red-100 text-expense" :
              overallStatus === "WARNING" ? "bg-amber-100 text-amber-700" :
              "bg-primary/10 text-primary"
            )}>
              {overallPct}% used
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 rounded-full bg-surface-muted overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${overallPct}%`,
                backgroundColor: overallStatus === "EXCEEDED" ? "#DC2626" : overallStatus === "WARNING" ? "#D97706" : "var(--primary)",
              }}
            />
          </div>

          {/* Three KPI chips */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Budget</p>
              <p className="text-sm font-bold font-amount text-slate-900">{formatCurrency(totalBudgeted)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Spent</p>
              <p className={cn("text-sm font-bold font-amount", overallStatus === "EXCEEDED" ? "text-expense" : "text-slate-900")}>{formatCurrency(totalSpent)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Remaining</p>
              <p className={cn("text-sm font-bold font-amount", totalRemaining > 0 ? "text-primary" : "text-expense")}>{formatCurrency(totalRemaining)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Budget Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-card" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="py-14 text-center bg-surface rounded-card border border-border shadow-soft">
          <Target className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No budgets set for this period</h3>
          <p className="text-xs text-slate-400 mt-1">
            Set spending limits for your most common expense categories.
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-btn shadow-sm hover:bg-primary-hover transition-colors"
          >
            + Create First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {budgets.map((budget) => {
            const statusCfg = getStatusConfig(budget.status);
            const StatusIcon = statusCfg.icon;

            return (
              <div
                key={budget.id}
                className={`p-4 rounded-card border ${statusCfg.border} bg-surface shadow-soft`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: budget.category.color || "#0F766E" }}
                    >
                      <CategoryIcon name={budget.category.icon} size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {budget.category.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <StatusIcon className={cn("w-4 h-4", statusCfg.color)} />
                    <button
                      onClick={() => {
                        setEditBudget(budget);
                        setEditAmount(String(budget.budgetAmount));
                      }}
                      className="text-slate-400 hover:text-primary p-1 rounded-btn hover:bg-slate-100 transition-colors"
                      title="Edit Budget Limit"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-slate-400 hover:text-expense p-1 rounded-btn hover:bg-red-50 transition-colors"
                      title="Delete Budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 mb-2 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, budget.percentage)}%`,
                      backgroundColor: statusCfg.barColor,
                    }}
                  />
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    Spent{" "}
                    <span className="font-bold text-slate-900">
                      {formatCurrency(budget.spent)}
                    </span>
                    {" "}of{" "}
                    <span className="font-medium">{formatCurrency(budget.budgetAmount)}</span>
                  </span>

                  <Badge
                    variant={
                      budget.status === "EXCEEDED"
                        ? "expense"
                        : budget.status === "WARNING"
                        ? "warning"
                        : "income"
                    }
                  >
                    {budget.percentage}%
                  </Badge>
                </div>

                {budget.status !== "EXCEEDED" && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    {formatCurrency(budget.remaining)} remaining
                  </p>
                )}
                {budget.status === "EXCEEDED" && (
                  <p className="text-[11px] text-expense font-semibold mt-1">
                    Over budget by {formatCurrency(budget.spent - budget.budgetAmount)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Set Budget Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Set Monthly Budget"
        description={`Budget limit for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
      >
        <form onSubmit={handleSaveBudget} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Expense Category *
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full h-11 px-3 rounded-input border border-border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a category</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Budget Limit (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₹
              </span>
              <input
                required
                type="number"
                step="any"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g. 8000"
                className="w-full h-11 pl-8 pr-3 rounded-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            You&apos;ll get a visual warning when spending reaches 80% and an alert when exceeded.
          </p>

          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={submitting}
              className="flex-1 font-bold"
            >
              Save Budget
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal
        isOpen={Boolean(editBudget)}
        onClose={() => setEditBudget(null)}
        title="Edit Monthly Budget"
        description={`Adjust spending limit for ${editBudget?.category?.name || "category"} in ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
      >
        <form onSubmit={handleUpdateBudget} className="space-y-4 pt-2">
          {editBudget && (
            <div className="flex items-center gap-3 p-3 rounded-card border border-border bg-slate-50">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                style={{ backgroundColor: editBudget.category?.color || "#0F766E" }}
              >
                <CategoryIcon
                  name={editBudget.category?.icon || "tag"}
                  categoryName={editBudget.category?.name}
                  size={18}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {editBudget.category?.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  Spent so far: {formatCurrency(editBudget.spent)}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Monthly Limit Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="10000"
                className="w-full h-11 pl-8 pr-3 rounded-input border border-border text-sm font-semibold font-amount focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={editSubmitting}
              className="flex-1 font-bold shadow-xs"
            >
              Update Budget
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setEditBudget(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
