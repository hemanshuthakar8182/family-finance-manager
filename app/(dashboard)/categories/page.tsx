"use client";

import React, { useState, useEffect } from "react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { Plus, Archive, Tags, Tag } from "lucide-react";

export default function CategoriesPage() {
  const { showToast } = useToast();

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "EXPENSE",
    icon: "Tag",
    color: "#0F766E",
  });

  const fetchCategories = () => {
    setIsLoading(true);
    fetch("/api/categories?includeArchived=false")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = categories.filter((c) => c.type === "INCOME");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast({ type: "error", title: "Category name is required" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");

      showToast({ type: "success", title: "Category Created", message: formData.name });
      setFormData({ name: "", type: "EXPENSE", icon: "Tag", color: "#0F766E" });
      setIsAddOpen(false);
      fetchCategories();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Archive category "${name}"? Existing transactions will be preserved.`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive" }),
      });
      if (!res.ok) throw new Error("Failed to archive category");

      showToast({ type: "success", title: "Category Archived", message: name });
      fetchCategories();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    }
  };

  const CategoryList = ({ items, type }: { items: any[]; type: string }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.length === 0 ? (
        <div className="col-span-2 py-6 text-center text-xs text-slate-400">
          No {type.toLowerCase()} categories yet.
        </div>
      ) : (
        items.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between p-3 rounded-card border border-border bg-surface shadow-soft hover:shadow-card transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: cat.color }}
              >
                <CategoryIcon name={cat.icon} size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{cat.name}</p>
                <p className="text-[11px] text-slate-400">
                  {cat._count?.transactions || 0} transactions
                </p>
              </div>
            </div>
            {!cat.isDefault && (
              <button
                onClick={() => handleArchive(cat.id, cat.name)}
                title="Archive Category"
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-btn hover:bg-slate-100 transition-colors"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}
            {cat.isDefault && (
              <Badge variant="secondary" className="text-[10px]">
                Default
              </Badge>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage family expense and income categories
          </p>
        </div>
        <Button size="md" onClick={() => setIsAddOpen(true)} className="font-semibold shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          New Category
        </Button>
      </div>

      {/* Expense Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
          <Badge variant="expense">{expenseCategories.length}</Badge>
        </CardHeader>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-200 rounded-card" />
            ))}
          </div>
        ) : (
          <CategoryList items={expenseCategories} type="EXPENSE" />
        )}
      </Card>

      {/* Income Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Income Categories</CardTitle>
          <Badge variant="income">{incomeCategories.length}</Badge>
        </CardHeader>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2 animate-pulse">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-slate-200 rounded-card" />
            ))}
          </div>
        ) : (
          <CategoryList items={incomeCategories} type="INCOME" />
        )}
      </Card>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create New Category"
        description="Add a custom expense or income category"
      >
        <form onSubmit={handleAdd} className="space-y-4 pt-2">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-btn">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "EXPENSE" })}
              className={`py-2 rounded-btn text-xs font-semibold transition-all ${
                formData.type === "EXPENSE"
                  ? "bg-expense text-white shadow-xs"
                  : "text-slate-600"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "INCOME" })}
              className={`py-2 rounded-btn text-xs font-semibold transition-all ${
                formData.type === "INCOME"
                  ? "bg-income text-white shadow-xs"
                  : "text-slate-600"
              }`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Pet Care, Gym, OTT Subscriptions"
              className="w-full h-11 px-3 rounded-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Icon Name (Lucide)
              </label>
              <input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="e.g. Heart, Car, Home"
                className="w-full h-10 px-3 rounded-input border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 rounded-input border border-border cursor-pointer"
              />
            </div>
          </div>

          {/* Icon Preview */}
          <div className="flex items-center gap-3 p-3 rounded-card border border-border bg-slate-50">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: formData.color }}
            >
              <CategoryIcon name={formData.icon} size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-700">{formData.name || "Preview"}</p>
              <p className="text-[11px] text-slate-400">
                {formData.type === "EXPENSE" ? "Expense" : "Income"} Category
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={submitting}
              className="flex-1 font-bold"
            >
              Create Category
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
    </div>
  );
}
