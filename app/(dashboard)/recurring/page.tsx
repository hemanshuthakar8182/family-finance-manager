"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatShortDate } from "@/lib/utils/formatters";
import {
  Repeat,
  Plus,
  Trash2,
  Play,
  Calendar,
  CreditCard,
  CheckCircle2,
  PauseCircle,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function RecurringPage() {
  const { showToast } = useToast();

  const [recurringList, setRecurringList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit recurring state
  const [editItem, setEditItem] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    type: "EXPENSE",
    categoryId: "",
    accountId: "",
    amount: "",
    frequency: "MONTHLY",
    startDate: new Date().toISOString().split("T")[0],
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const handleOpenEdit = (item: any) => {
    setEditItem(item);
    setEditFormData({
      type: item.type,
      categoryId: item.categoryId,
      accountId: item.accountId || "",
      amount: String(item.amount),
      frequency: item.frequency,
      startDate: item.startDate
        ? new Date(item.startDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
    });
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !editItem ||
      !editFormData.categoryId ||
      !editFormData.amount ||
      Number(editFormData.amount) <= 0
    ) {
      showToast({ type: "error", title: "Please fill all required fields" });
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/recurring/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editFormData,
          amount: Number(editFormData.amount),
          accountId: editFormData.accountId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update schedule");

      showToast({
        type: "success",
        title: "Schedule Updated",
        message: "Recurring schedule saved",
      });
      setEditItem(null);
      fetchData();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    } finally {
      setEditSubmitting(false);
    }
  };

  const [formData, setFormData] = useState({
    type: "EXPENSE",
    categoryId: "",
    accountId: "",
    amount: "",
    frequency: "MONTHLY",
    startDate: new Date().toISOString().split("T")[0],
  });

  const fetchData = () => {
    setIsLoading(true);
    fetch("/api/recurring")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRecurringList(data);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/accounts").then((r) => r.json()),
    ]).then(([catData, accData]) => {
      if (Array.isArray(catData)) setCategories(catData);
      if (Array.isArray(accData)) setAccounts(accData);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.amount || Number(formData.amount) <= 0) {
      showToast({ type: "error", title: "Please select category and enter valid amount" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create recurring rule");

      showToast({ type: "success", title: "Recurring Rule Saved" });
      setIsAddOpen(false);
      setFormData({
        type: "EXPENSE",
        categoryId: "",
        accountId: "",
        amount: "",
        frequency: "MONTHLY",
        startDate: new Date().toISOString().split("T")[0],
      });
      fetchData();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/recurring/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      showToast({
        type: "success",
        title: !currentStatus ? "Schedule Activated" : "Schedule Paused",
      });
      fetchData();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this recurring schedule?")) return;
    try {
      const res = await fetch(`/api/recurring/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete schedule");
      showToast({ type: "success", title: "Schedule Removed" });
      fetchData();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    }
  };

  const handleRunDue = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/cron/process-recurring", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Execution failed");
      showToast({
        type: "success",
        title: "Processed Schedules",
        message: data.message,
      });
      fetchData();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3">
        <div>
          <h1 className="h4 fw-bold text-foreground mb-1">
            Recurring Bills &amp; Subscriptions
          </h1>
          <p className="small text-muted mb-0">
            Automate monthly rent, utilities, SIPs, and OTT subscriptions
          </p>
        </div>

        <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 w-100 w-sm-auto">
          <Button
            variant="outline"
            size="md"
            isLoading={isProcessing}
            onClick={handleRunDue}
            className="small fw-semibold justify-content-center"
          >
            <Play style={{ width: "14px", height: "14px" }} className="me-1 text-primary" />
            Check &amp; Run Due Now
          </Button>

          <Button
            size="md"
            onClick={() => setIsAddOpen(true)}
            className="fw-semibold shadow-sm small justify-content-center"
          >
            <Plus style={{ width: "16px", height: "16px" }} className="me-1" />
            New Schedule
          </Button>
        </div>
      </div>

      {/* Grid of Recurring Rules */}
      {isLoading ? (
        <div className="row g-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="col-12 col-sm-6">
              <div className="card border rounded-card p-4 shadow-sm" style={{ minHeight: "120px" }}>
                <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
                <span className="small text-muted">Loading schedule...</span>
              </div>
            </div>
          ))}
        </div>
      ) : recurringList.length === 0 ? (
        <div className="text-center py-5 bg-surface rounded-card border border-border shadow-sm">
          <Repeat style={{ width: "40px", height: "40px" }} className="text-secondary opacity-50 mx-auto mb-3" />
          <h3 className="h6 fw-bold text-foreground mb-1">No recurring schedules set</h3>
          <p className="small text-muted mb-3 mx-auto" style={{ maxWidth: "380px" }}>
            Automate recurring household bills like electricity, maid salary, school fees, and rent.
          </p>
          <Button
            onClick={() => setIsAddOpen(true)}
            variant="primary"
            size="sm"
            className="fw-semibold shadow-sm"
          >
            + Set First Recurring Rule
          </Button>
        </div>
      ) : (
        <div className="row g-3">
          {recurringList.map((item) => (
            <div key={item.id} className="col-12 col-sm-6">
              <div
                className={cn(
                  "card rounded-card border bg-surface shadow-sm p-3 h-100 transition",
                  item.isActive ? "border-border" : "border-secondary-subtle opacity-75 bg-light"
                )}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm"
                      style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: item.category?.color || "#0F766E",
                      }}
                    >
                      <CategoryIcon name={item.category?.icon || "tag"} size={18} />
                    </div>
                    <div>
                      <h4 className="h6 fw-bold text-foreground mb-0">
                        {item.category?.name}
                      </h4>
                      <span className="badge bg-primary-subtle text-primary fw-bold text-uppercase mt-1" style={{ fontSize: "10px", letterSpacing: "0.05em" }}>
                        {item.frequency}
                      </span>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="fs-6 fw-bold font-amount text-foreground">
                      {formatCurrency(item.amount)}
                    </div>
                    <Badge variant={item.type === "INCOME" ? "income" : "expense"}>
                      {item.type}
                    </Badge>
                  </div>
                </div>

                {/* Meta information */}
                <div className="pt-2 border-top d-flex align-items-center justify-content-between small text-muted mt-auto">
                  <div className="d-flex align-items-center gap-1.5">
                    <CreditCard style={{ width: "14px", height: "14px" }} className="text-secondary" />
                    <span>{item.account?.name || "Unassigned"}</span>
                  </div>

                  <div className="d-flex align-items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="btn btn-sm btn-light border-0 text-secondary p-1 rounded-circle"
                      title="Edit schedule"
                      type="button"
                    >
                      <Pencil style={{ width: "14px", height: "14px" }} />
                    </button>

                    <button
                      onClick={() => handleToggle(item.id, item.isActive)}
                      className="btn btn-sm btn-light border-0 text-secondary p-1 rounded-circle"
                      title={item.isActive ? "Pause schedule" : "Resume schedule"}
                      type="button"
                    >
                      {item.isActive ? (
                        <PauseCircle style={{ width: "16px", height: "16px" }} className="text-warning" />
                      ) : (
                        <CheckCircle2 style={{ width: "16px", height: "16px" }} className="text-success" />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-sm btn-light border-0 text-danger p-1 rounded-circle"
                      title="Delete schedule"
                      type="button"
                    >
                      <Trash2 style={{ width: "14px", height: "14px" }} />
                    </button>
                  </div>
                </div>

                {item.lastRunAt && (
                  <p className="small text-secondary mb-0 mt-2" style={{ fontSize: "10px" }}>
                    Last recorded: {formatShortDate(item.lastRunAt)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Recurring Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="New Recurring Schedule"
        description="Automatically log repeated earnings or expenses"
      >
        <form onSubmit={handleCreate} className="d-flex flex-column gap-3 pt-1">
          {/* Type Toggle */}
          <div className="btn-group w-100 p-1 bg-light rounded-btn border" role="group">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "EXPENSE", categoryId: "" })}
              className={cn(
                "btn btn-sm py-1.5 rounded-btn fw-bold small transition",
                formData.type === "EXPENSE"
                  ? "btn-danger text-white shadow-sm"
                  : "btn-link text-secondary text-decoration-none"
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "INCOME", categoryId: "" })}
              className={cn(
                "btn btn-sm py-1.5 rounded-btn fw-bold small transition",
                formData.type === "INCOME"
                  ? "btn-success text-white shadow-sm"
                  : "btn-link text-secondary text-decoration-none"
              )}
            >
              Income
            </button>
          </div>

          <div>
            <label className="form-label small fw-semibold text-foreground mb-1">
              Category *
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="form-select form-select-sm rounded-input"
            >
              <option value="">Select category</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label small fw-semibold text-foreground mb-1">
              Amount (₹) *
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 15000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="form-control form-control-sm rounded-input fw-bold font-amount"
            />
          </div>

          <div className="row g-2">
            <div className="col-6">
              <label className="form-label small fw-semibold text-foreground mb-1">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="form-select form-select-sm rounded-input"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>

            <div className="col-6">
              <label className="form-label small fw-semibold text-foreground mb-1">
                Account
              </label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="form-select form-select-sm rounded-input"
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer px-0 pb-0 pt-3 border-top mt-2 d-flex gap-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
              className="flex-grow-1 fw-bold small"
            >
              Save Schedule
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddOpen(false)}
              className="small"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Recurring Modal */}
      <Modal
        isOpen={Boolean(editItem)}
        onClose={() => setEditItem(null)}
        title="Edit Recurring Schedule"
        description="Update recurring payment details and schedule"
      >
        <form onSubmit={handleUpdateSchedule} className="d-flex flex-column gap-3 pt-1">
          {/* Type Toggle */}
          <div className="btn-group w-100 p-1 bg-light rounded-btn border" role="group">
            <button
              type="button"
              onClick={() =>
                setEditFormData({
                  ...editFormData,
                  type: "EXPENSE",
                  categoryId: "",
                })
              }
              className={cn(
                "btn btn-sm py-1.5 rounded-btn fw-bold small transition",
                editFormData.type === "EXPENSE"
                  ? "btn-danger text-white shadow-sm"
                  : "btn-link text-secondary text-decoration-none"
              )}
            >
              Expense Schedule
            </button>
            <button
              type="button"
              onClick={() =>
                setEditFormData({
                  ...editFormData,
                  type: "INCOME",
                  categoryId: "",
                })
              }
              className={cn(
                "btn btn-sm py-1.5 rounded-btn fw-bold small transition",
                editFormData.type === "INCOME"
                  ? "btn-success text-white shadow-sm"
                  : "btn-link text-secondary text-decoration-none"
              )}
            >
              Income Schedule
            </button>
          </div>

          <div className="row g-2">
            <div className="col-6">
              <label className="form-label small fw-semibold text-foreground mb-1">
                Category *
              </label>
              <select
                required
                value={editFormData.categoryId}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    categoryId: e.target.value,
                  })
                }
                className="form-select form-select-sm rounded-input"
              >
                <option value="">Select category</option>
                {categories
                  .filter((c) => c.type === editFormData.type)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="col-6">
              <label className="form-label small fw-semibold text-foreground mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={editFormData.amount}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, amount: e.target.value })
                }
                placeholder="0"
                className="form-control form-control-sm rounded-input fw-bold font-amount"
              />
            </div>
          </div>

          <div className="row g-2">
            <div className="col-6">
              <label className="form-label small fw-semibold text-foreground mb-1">
                Frequency *
              </label>
              <select
                value={editFormData.frequency}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    frequency: e.target.value,
                  })
                }
                className="form-select form-select-sm rounded-input"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>

            <div className="col-6">
              <label className="form-label small fw-semibold text-foreground mb-1">
                Account / Wallet
              </label>
              <select
                value={editFormData.accountId}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, accountId: e.target.value })
                }
                className="form-select form-select-sm rounded-input"
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer px-0 pb-0 pt-3 border-top mt-2 d-flex gap-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={editSubmitting}
              className="flex-grow-1 fw-bold small"
            >
              Update Schedule
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setEditItem(null)}
              className="small"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
