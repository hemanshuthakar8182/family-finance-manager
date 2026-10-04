"use client";

import React, { useState, useEffect } from "react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { Plus, Archive, Sparkles, Pencil } from "lucide-react";
import { IconPicker, ColorPicker } from "@/components/categories/IconPicker";
import {
  resolveCategoryIcon,
  PRESET_CATEGORY_COLORS,
} from "@/lib/utils/category-helper";

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
  const [isIconCustom, setIsIconCustom] = useState(false);
  const [isColorCustom, setIsColorCustom] = useState(false);

  // Edit Category state
  const [editCategory, setEditCategory] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    icon: "Tag",
    color: "#0F766E",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory || !editFormData.name.trim()) {
      showToast({ type: "error", title: "Category name is required" });
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/categories/${editCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update category");

      showToast({ type: "success", title: "Category Updated", message: editFormData.name });
      setEditCategory(null);
      fetchCategories();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    } finally {
      setEditSubmitting(false);
    }
  };

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

  const handleNameChange = (name: string) => {
    setFormData((prev) => {
      const updated = { ...prev, name };
      if (!isIconCustom || !isColorCustom) {
        const suggestion = resolveCategoryIcon(name, prev.type as any);
        if (!isIconCustom) updated.icon = suggestion.icon;
        if (!isColorCustom) updated.color = suggestion.color;
      }
      return updated;
    });
  };

  const handleTypeChange = (type: "EXPENSE" | "INCOME") => {
    setFormData((prev) => {
      const updated = { ...prev, type };
      if (!isIconCustom || !isColorCustom) {
        const suggestion = resolveCategoryIcon(prev.name, type);
        if (!isIconCustom) updated.icon = suggestion.icon;
        if (!isColorCustom) updated.color = suggestion.color;
      }
      return updated;
    });
  };

  const openAddModal = () => {
    setFormData({ name: "", type: "EXPENSE", icon: "Tag", color: "#0F766E" });
    setIsIconCustom(false);
    setIsColorCustom(false);
    setIsAddOpen(true);
  };

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
      setIsIconCustom(false);
      setIsColorCustom(false);
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
                className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                style={{ backgroundColor: cat.color }}
              >
                <CategoryIcon name={cat.icon} categoryName={cat.name} size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{cat.name}</p>
                <p className="text-[11px] text-slate-400">
                  {cat._count?.transactions || 0} transactions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setEditCategory(cat);
                  setEditFormData({
                    name: cat.name,
                    icon: cat.icon || "Tag",
                    color: cat.color || "#0F766E",
                  });
                }}
                title="Edit Category"
                className="text-slate-400 hover:text-primary p-1.5 rounded-btn hover:bg-slate-100 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              {!cat.isDefault && (
                <button
                  onClick={() => handleArchive(cat.id, cat.name)}
                  title="Archive Category"
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-btn hover:bg-slate-100 transition-colors"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              )}
              {cat.isDefault && (
                <Badge variant="secondary" className="text-[10px]">
                  Default
                </Badge>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Categories
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Manage family expense and income categories
          </p>
        </div>
        <Button size="md" onClick={openAddModal} className="w-full sm:w-auto justify-center font-semibold shadow-sm">
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
        description="Add a custom expense or income category with smart icon detection"
      >
        <form onSubmit={handleAdd} className="space-y-4 pt-2">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-btn">
            <button
              type="button"
              onClick={() => handleTypeChange("EXPENSE")}
              className={`py-2 rounded-btn text-xs font-semibold transition-all ${
                formData.type === "EXPENSE"
                  ? "bg-expense text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("INCOME")}
              className={`py-2 rounded-btn text-xs font-semibold transition-all ${
                formData.type === "INCOME"
                  ? "bg-income text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Income
            </button>
          </div>

          {/* Category Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Pet Care, Gym, Electricity, Grocery, Uber"
              className="w-full h-11 px-3 rounded-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-400"
            />
            {!isIconCustom && formData.name.trim().length > 0 && (
              <p className="flex items-center gap-1 text-[11px] text-teal-700 mt-1.5 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                Icon & color auto-detected from name
              </p>
            )}
          </div>

          {/* Visual Icon Picker */}
          <IconPicker
            value={formData.icon}
            onChange={(iconName) => {
              setFormData((prev) => ({ ...prev, icon: iconName }));
              setIsIconCustom(true);
            }}
            color={formData.color}
            isAutoDetected={!isIconCustom && Boolean(formData.name.trim())}
          />

          {/* Palette Color Picker */}
          <ColorPicker
            value={formData.color}
            onChange={(colorHex) => {
              setFormData((prev) => ({ ...prev, color: colorHex }));
              setIsColorCustom(true);
            }}
            presetColors={PRESET_CATEGORY_COLORS}
            isAutoDetected={!isColorCustom && Boolean(formData.name.trim())}
          />

          {/* Live Category Preview */}
          <div className="flex items-center gap-3 p-3 rounded-card border border-border/80 bg-slate-50/80">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: formData.color }}
            >
              <CategoryIcon name={formData.icon} categoryName={formData.name} size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {formData.name || "Category Preview"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-slate-500 font-medium">
                  {formData.type === "EXPENSE" ? "Expense" : "Income"} Category
                </span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Icon: {formData.icon}
                </span>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-4 -mb-3.5 sm:-mx-6 sm:-mb-4 px-4 sm:px-6 py-3 bg-surface/95 backdrop-blur-md border-t border-border mt-auto flex gap-2 z-20">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={submitting}
              className="flex-1 font-bold shadow-xs"
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

      {/* Edit Category Modal */}
      <Modal
        isOpen={Boolean(editCategory)}
        onClose={() => setEditCategory(null)}
        title="Edit Category"
        description="Update category name, icon, and theme color"
      >
        <form onSubmit={handleUpdate} className="space-y-4 pt-2">
          {/* Category Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              required
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData({ ...editFormData, name: e.target.value })
              }
              placeholder="Category name"
              className="w-full h-11 px-3 rounded-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Visual Icon Picker */}
          <IconPicker
            value={editFormData.icon}
            onChange={(iconName) =>
              setEditFormData((prev) => ({ ...prev, icon: iconName }))
            }
            color={editFormData.color}
            isAutoDetected={false}
          />

          {/* Palette Color Picker */}
          <ColorPicker
            value={editFormData.color}
            onChange={(colorHex) =>
              setEditFormData((prev) => ({ ...prev, color: colorHex }))
            }
            presetColors={PRESET_CATEGORY_COLORS}
            isAutoDetected={false}
          />

          {/* Live Preview */}
          <div className="flex items-center gap-3 p-3 rounded-card border border-border/80 bg-slate-50/80">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
              style={{ backgroundColor: editFormData.color }}
            >
              <CategoryIcon
                name={editFormData.icon}
                categoryName={editFormData.name}
                size={18}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {editFormData.name || "Category Preview"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-slate-500 font-medium">
                  {editCategory?.type === "EXPENSE" ? "Expense" : "Income"} Category
                </span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Icon: {editFormData.icon}
                </span>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-4 -mb-3.5 sm:-mx-6 sm:-mb-4 px-4 sm:px-6 py-3 bg-surface/95 backdrop-blur-md border-t border-border mt-auto flex gap-2 z-20">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={editSubmitting}
              className="flex-1 font-bold shadow-xs"
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setEditCategory(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
