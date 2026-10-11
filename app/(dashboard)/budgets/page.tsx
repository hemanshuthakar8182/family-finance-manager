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
        return { icon: XCircle, color: "text-danger", bg: "bg-danger-subtle", border: "border-danger-subtle", barColor: "#DC2626" };
      case "WARNING":
        return { icon: AlertTriangle, color: "text-warning", bg: "bg-warning-subtle", border: "border-warning-subtle", barColor: "#D97706" };
      default:
        return { icon: CheckCircle2, color: "text-success", bg: "bg-success-subtle", border: "border-success-subtle", barColor: "#16A34A" };
    }
  };

  // Aggregate totals for the summary gauge
  const totalBudgeted = budgets.reduce((s: number, b: any) => s + Number(b.budgetAmount), 0);
  const totalSpent = budgets.reduce((s: number, b: any) => s + Number(b.spent), 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
  const overallPct = totalBudgeted > 0 ? Math.min(100, Math.round((totalSpent / totalBudgeted) * 100)) : 0;
  const overallStatus = overallPct >= 100 ? "EXCEEDED" : overallPct >= 80 ? "WARNING" : "SAFE";

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">
            Monthly Budgets
          </h1>
          <p className="small text-secondary mb-0">
            Set category spending limits and track progress
          </p>
        </div>
        <Button size="md" onClick={() => setIsAddOpen(true)} className="fw-semibold shadow-sm gap-2">
          <Plus style={{ width: "16px", height: "16px" }} />
          <span>Set Budget</span>
        </Button>
      </div>

      {/* Month-Year Selector */}
      <div className="card rounded-card border bg-surface p-3 shadow-sm d-flex flex-row align-items-center gap-2 flex-wrap">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="form-select form-select-sm rounded-btn fw-bold text-dark"
          style={{ width: "140px" }}
        >
          {MONTH_NAMES.map((m, idx) => (
            <option key={idx} value={idx + 1}>{m}</option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="form-select form-select-sm rounded-btn fw-bold text-dark"
          style={{ width: "100px" }}
        >
          {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <span className="small text-secondary fw-medium ms-auto">
          {budgets.length} budget{budgets.length !== 1 ? "s" : ""} set
        </span>
      </div>

      {/* ── Household Budget Aggregate Summary ── */}
      {!isLoading && budgets.length > 0 && (
        <div className={cn(
          "card rounded-card border shadow-sm p-3 p-sm-4",
          overallStatus === "EXCEEDED" ? "border-danger-subtle bg-danger-subtle" :
          overallStatus === "WARNING" ? "border-warning-subtle bg-warning-subtle" :
          "border-primary-subtle bg-primary-subtle"
        )}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="small fw-bold text-dark">
              Household Budget — {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </span>
            <span className={cn(
              "badge rounded-pill fw-bold",
              overallStatus === "EXCEEDED" ? "bg-danger text-white" :
              overallStatus === "WARNING" ? "bg-warning text-dark" :
              "bg-primary text-white"
            )}>
              {overallPct}% used
            </span>
          </div>

          {/* Bootstrap Progress bar */}
          <div className="progress mb-3" style={{ height: "10px" }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${overallPct}%`,
                backgroundColor: overallStatus === "EXCEEDED" ? "#DC2626" : overallStatus === "WARNING" ? "#D97706" : "var(--primary)",
              }}
              aria-valuenow={overallPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Three KPI chips */}
          <div className="row g-2 text-center">
            <div className="col-4">
              <p className="small text-secondary fw-semibold text-uppercase mb-0" style={{ fontSize: "10px" }}>Total Budget</p>
              <p className="h6 fw-bold text-dark mb-0">{formatCurrency(totalBudgeted)}</p>
            </div>
            <div className="col-4">
              <p className="small text-secondary fw-semibold text-uppercase mb-0" style={{ fontSize: "10px" }}>Spent</p>
              <p className={cn("h6 fw-bold mb-0", overallStatus === "EXCEEDED" ? "text-danger" : "text-dark")}>{formatCurrency(totalSpent)}</p>
            </div>
            <div className="col-4">
              <p className="small text-secondary fw-semibold text-uppercase mb-0" style={{ fontSize: "10px" }}>Remaining</p>
              <p className={cn("h6 fw-bold mb-0", totalRemaining > 0 ? "text-success" : "text-danger")}>{formatCurrency(totalRemaining)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Budget Cards */}
      {isLoading ? (
        <div className="row g-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="col-12 col-md-6">
              <div className="card rounded-card border p-4 bg-light placeholder-glow" style={{ height: "120px" }}>
                <span className="placeholder col-6"></span>
                <span className="placeholder col-8 mt-2"></span>
              </div>
            </div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="card rounded-card border p-5 text-center bg-surface shadow-sm">
          <Target className="text-secondary mx-auto mb-3" style={{ width: "40px", height: "40px" }} />
          <h3 className="h6 fw-bold text-dark mb-1">No budgets set for this period</h3>
          <p className="small text-secondary mb-3">
            Set spending limits for your most common expense categories.
          </p>
          <div>
            <button
              onClick={() => setIsAddOpen(true)}
              className="btn btn-sm btn-primary rounded-btn fw-bold px-3 py-2 shadow-sm"
            >
              + Create First Budget
            </button>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {budgets.map((budget) => {
            const statusCfg = getStatusConfig(budget.status);
            const StatusIcon = statusCfg.icon;

            return (
              <div key={budget.id} className="col-12 col-md-6">
                <div className={cn("card-elevated rounded-card border bg-surface p-3.5 shadow-xs hover-lift h-100", statusCfg.border)}>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-2.5">
                      <div
                        className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-xs"
                        style={{ width: "38px", height: "38px", backgroundColor: budget.category.color || "#0F766E" }}
                      >
                        <CategoryIcon name={budget.category.icon} size={18} />
                      </div>
                      <div>
                        <h4 className="h6 fw-bold text-dark mb-0">
                          {budget.category.name}
                        </h4>
                        <p className="small text-secondary mb-0" style={{ fontSize: "11px" }}>
                          {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                        </p>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-1">
                      <StatusIcon style={{ width: "16px", height: "16px" }} className={statusCfg.color} />
                      <button
                        type="button"
                        onClick={() => {
                          setEditBudget(budget);
                          setEditAmount(String(budget.budgetAmount));
                        }}
                        className="btn btn-sm btn-link text-secondary p-1 text-decoration-none"
                        title="Edit Budget Limit"
                      >
                        <Pencil style={{ width: "14px", height: "14px" }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(budget.id)}
                        className="btn btn-sm btn-link text-danger p-1 text-decoration-none"
                        title="Delete Budget"
                      >
                        <Trash2 style={{ width: "14px", height: "14px" }} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress mb-2" style={{ height: "8px" }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${Math.min(100, budget.percentage)}%`,
                        backgroundColor: statusCfg.barColor,
                      }}
                      aria-valuenow={budget.percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>

                  {/* Stats Row */}
                  <div className="d-flex align-items-center justify-content-between small">
                    <span className="text-secondary fw-medium">
                      Spent{" "}
                      <strong className="text-dark">
                        {formatCurrency(budget.spent)}
                      </strong>
                      {" "}of{" "}
                      <span>{formatCurrency(budget.budgetAmount)}</span>
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
                    <p className="small text-secondary mt-1 mb-0" style={{ fontSize: "11px" }}>
                      {formatCurrency(budget.remaining)} remaining
                    </p>
                  )}
                  {budget.status === "EXCEEDED" && (
                    <p className="small text-danger fw-semibold mt-1 mb-0" style={{ fontSize: "11px" }}>
                      Over budget by {formatCurrency(budget.spent - budget.budgetAmount)}
                    </p>
                  )}
                </div>
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
        <form onSubmit={handleSaveBudget} className="d-flex flex-column gap-3 pt-2">
          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              Expense Category *
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="form-select rounded-input py-2 small"
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
            <label className="form-label small fw-semibold text-dark mb-1">
              Monthly Budget Limit (₹) *
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light fw-bold text-secondary">
                ₹
              </span>
              <input
                required
                type="number"
                step="any"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g. 8000"
                className="form-control rounded-end-2 py-2 fw-semibold"
              />
            </div>
          </div>

          <p className="small text-secondary mb-0" style={{ fontSize: "11px" }}>
            You&apos;ll get a visual warning when spending reaches 80% and an alert when exceeded.
          </p>

          <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top mt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
              className="fw-bold px-4"
            >
              Save Budget
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
        <form onSubmit={handleUpdateBudget} className="d-flex flex-column gap-3 pt-2">
          {editBudget && (
            <div className="d-flex align-items-center gap-3 p-3 rounded-card border bg-light">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: "38px", height: "38px", backgroundColor: editBudget.category?.color || "#0F766E" }}
              >
                <CategoryIcon
                  name={editBudget.category?.icon || "tag"}
                  categoryName={editBudget.category?.name}
                  size={18}
                />
              </div>
              <div>
                <p className="small fw-bold text-dark mb-0">
                  {editBudget.category?.name}
                </p>
                <p className="small text-secondary mb-0" style={{ fontSize: "11px" }}>
                  Spent so far: {formatCurrency(editBudget.spent)}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              Monthly Limit Amount (₹) *
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light fw-bold text-secondary">
                ₹
              </span>
              <input
                type="number"
                step="any"
                required
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="10000"
                className="form-control rounded-end-2 py-2 fw-semibold"
              />
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top mt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setEditBudget(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={editSubmitting}
              className="fw-bold px-4 shadow-sm"
            >
              Update Budget
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

