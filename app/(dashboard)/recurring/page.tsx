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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Recurring Bills & Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Automate monthly rent, utilities, SIPs, and OTT subscriptions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            isLoading={isProcessing}
            onClick={handleRunDue}
            className="text-xs font-semibold"
          >
            <Play className="w-3.5 h-3.5 mr-1 text-primary" />
            Check & Run Due Now
          </Button>

          <Button
            size="md"
            onClick={() => setIsAddOpen(true)}
            className="font-semibold shadow-sm text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Schedule
          </Button>
        </div>
      </div>

      {/* Grid of Recurring Rules */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-card" />
          ))}
        </div>
      ) : recurringList.length === 0 ? (
        <div className="py-14 text-center bg-surface rounded-card border border-border shadow-soft">
          <Repeat className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No recurring schedules set</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Automate recurring household bills like electricity, maid salary, school fees, and rent.
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-btn shadow-sm hover:bg-primary-hover transition-colors"
          >
            + Set First Recurring Rule
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recurringList.map((item) => (
            <div
              key={item.id}
              className={cn(
                "p-4 rounded-card border bg-surface shadow-soft transition-all",
                item.isActive ? "border-border" : "border-slate-200 opacity-60 bg-slate-50/50"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: item.category?.color || "#0F766E" }}
                  >
                    <CategoryIcon name={item.category?.icon || "tag"} size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {item.category?.name}
                    </h4>
                    <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                      {item.frequency}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold font-amount text-slate-900">
                    {formatCurrency(item.amount)}
                  </div>
                  <Badge variant={item.type === "INCOME" ? "income" : "expense"}>
                    {item.type}
                  </Badge>
                </div>
              </div>

              {/* Meta information */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.account?.name || "Unassigned"}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-btn hover:bg-slate-100 text-slate-400 hover:text-primary transition-colors"
                    title="Edit schedule"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggle(item.id, item.isActive)}
                    className="p-1.5 rounded-btn hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                    title={item.isActive ? "Pause schedule" : "Resume schedule"}
                  >
                    {item.isActive ? (
                      <PauseCircle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-btn hover:bg-red-50 text-slate-400 hover:text-expense transition-colors"
                    title="Delete schedule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {item.lastRunAt && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Last recorded: {formatShortDate(item.lastRunAt)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="New Recurring Schedule"
        description="Automatically log repeated earnings or expenses"
      >
        <form onSubmit={handleCreate} className="space-y-4 pt-1">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-btn">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "EXPENSE", categoryId: "" })}
              className={cn(
                "py-2 rounded-btn font-semibold text-xs transition-all",
                formData.type === "EXPENSE"
                  ? "bg-expense text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "INCOME", categoryId: "" })}
              className={cn(
                "py-2 rounded-btn font-semibold text-xs transition-all",
                formData.type === "INCOME"
                  ? "bg-income text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category *
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full h-10 px-3 rounded-input border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Amount (₹) *
            </label>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 15000"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full h-10 px-3 rounded-input border border-border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full h-10 px-2 rounded-input border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account
              </label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full h-10 px-2 rounded-input border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
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

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={submitting}
              className="flex-1 font-bold text-xs"
            >
              Save Schedule
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setIsAddOpen(false)}
              className="text-xs"
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
        <form onSubmit={handleUpdateSchedule} className="space-y-4 pt-2">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-btn">
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
                "py-2 rounded-btn text-xs font-semibold transition-all",
                editFormData.type === "EXPENSE"
                  ? "bg-expense text-white shadow-xs"
                  : "text-slate-600"
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
                "py-2 rounded-btn text-xs font-semibold transition-all",
                editFormData.type === "INCOME"
                  ? "bg-income text-white shadow-xs"
                  : "text-slate-600"
              )}
            >
              Income Schedule
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                className="w-full h-10 px-2 rounded-input border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                className="w-full h-10 px-3 rounded-input border border-border text-xs font-amount font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                className="w-full h-10 px-2 rounded-input border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account / Wallet
              </label>
              <select
                value={editFormData.accountId}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, accountId: e.target.value })
                }
                className="w-full h-10 px-2 rounded-input border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
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

          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={editSubmitting}
              className="flex-1 font-bold text-xs"
            >
              Update Schedule
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setEditItem(null)}
              className="text-xs"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
