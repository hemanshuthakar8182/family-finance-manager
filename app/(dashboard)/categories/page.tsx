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
    <div className="row g-2">
      {items.length === 0 ? (
        <div className="col-12 py-4 text-center small text-secondary">
          No {type.toLowerCase()} categories yet.
        </div>
      ) : (
        items.map((cat) => (
          <div key={cat.id} className="col-12 col-sm-6">
            <div className="card-elevated rounded-card border bg-surface p-3 shadow-xs hover-lift d-flex flex-row align-items-center justify-content-between h-100">
              <div className="d-flex align-items-center gap-3 overflow-hidden">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-xs"
                  style={{ width: "38px", height: "38px", backgroundColor: cat.color }}
                >
                  <CategoryIcon name={cat.icon} categoryName={cat.name} size={18} />
                </div>
                <div className="overflow-hidden">
                  <p className="h6 fw-bold text-dark text-truncate mb-0">{cat.name}</p>
                  <p className="small text-secondary text-truncate mb-0" style={{ fontSize: "11px" }}>
                    {cat._count?.transactions || 0} transactions
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-center gap-1 flex-shrink-0 ms-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditCategory(cat);
                    setEditFormData({
                      name: cat.name,
                      icon: cat.icon || "Tag",
                      color: cat.color || "#0F766E",
                    });
                  }}
                  title="Edit Category"
                  className="btn btn-sm btn-link text-secondary p-1 text-decoration-none"
                >
                  <Pencil style={{ width: "14px", height: "14px" }} />
                </button>
                {!cat.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleArchive(cat.id, cat.name)}
                    title="Archive Category"
                    className="btn btn-sm btn-link text-secondary p-1 text-decoration-none"
                  >
                    <Archive style={{ width: "14px", height: "14px" }} />
                  </button>
                )}
                {cat.isDefault && (
                  <Badge variant="secondary" style={{ fontSize: "10px" }}>
                    Default
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">
            Categories
          </h1>
          <p className="small text-secondary mb-0">
            Manage family expense and income categories
          </p>
        </div>
        <Button size="md" onClick={openAddModal} className="fw-semibold shadow-sm gap-2">
          <Plus style={{ width: "16px", height: "16px" }} />
          <span>New Category</span>
        </Button>
      </div>

      {/* Expense Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
          <Badge variant="expense">{expenseCategories.length}</Badge>
        </CardHeader>
        {isLoading ? (
          <div className="row g-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-12 col-sm-6">
                <div className="card rounded-card border p-3 bg-light placeholder-glow" style={{ height: "60px" }}>
                  <span className="placeholder col-6"></span>
                </div>
              </div>
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
          <div className="row g-2">
            {[1, 2].map((i) => (
              <div key={i} className="col-12 col-sm-6">
                <div className="card rounded-card border p-3 bg-light placeholder-glow" style={{ height: "60px" }}>
                  <span className="placeholder col-6"></span>
                </div>
              </div>
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
        <form onSubmit={handleAdd} className="d-flex flex-column gap-3 pt-2">
          {/* Type Toggle */}
          <div className="btn-group w-100">
            <button
              type="button"
              onClick={() => handleTypeChange("EXPENSE")}
              className={`btn btn-sm fw-bold py-2 ${
                formData.type === "EXPENSE"
                  ? "btn-danger shadow-sm text-white"
                  : "btn-light border text-secondary"
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("INCOME")}
              className={`btn btn-sm fw-bold py-2 ${
                formData.type === "INCOME"
                  ? "btn-success shadow-sm text-white"
                  : "btn-light border text-secondary"
              }`}
            >
              Income
            </button>
          </div>

          {/* Category Name */}
          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              Category Name *
            </label>
            <input
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Pet Care, Gym, Electricity, Grocery, Uber"
              className="form-control rounded-input py-2"
            />
            {!isIconCustom && formData.name.trim().length > 0 && (
              <p className="d-flex align-items-center gap-1 text-primary mt-1 mb-0 small fw-medium" style={{ fontSize: "11px" }}>
                <Sparkles style={{ width: "14px", height: "14px" }} />
                <span>Icon & color auto-detected from name</span>
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
          <div className="card rounded-card border bg-light p-3 d-flex flex-row align-items-center gap-3 shadow-none">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm"
              style={{ width: "40px", height: "40px", backgroundColor: formData.color }}
            >
              <CategoryIcon name={formData.icon} categoryName={formData.name} size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="small fw-bold text-dark text-truncate mb-0">
                {formData.name || "Category Preview"}
              </p>
              <div className="d-flex align-items-center gap-1 mt-0.5 small text-secondary" style={{ fontSize: "11px" }}>
                <span>
                  {formData.type === "EXPENSE" ? "Expense" : "Income"} Category
                </span>
                <span>•</span>
                <span>
                  Icon: {formData.icon}
                </span>
              </div>
            </div>
          </div>

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
              className="fw-bold px-4 shadow-sm"
            >
              Create Category
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
        <form onSubmit={handleUpdate} className="d-flex flex-column gap-3 pt-2">
          {/* Category Name */}
          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              Category Name *
            </label>
            <input
              required
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData({ ...editFormData, name: e.target.value })
              }
              placeholder="Category name"
              className="form-control rounded-input py-2"
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
          <div className="card rounded-card border bg-light p-3 d-flex flex-row align-items-center gap-3 shadow-none">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0 shadow-sm"
              style={{ width: "40px", height: "40px", backgroundColor: editFormData.color }}
            >
              <CategoryIcon
                name={editFormData.icon}
                categoryName={editFormData.name}
                size={18}
              />
            </div>
            <div className="overflow-hidden">
              <p className="small fw-bold text-dark text-truncate mb-0">
                {editFormData.name || "Category Preview"}
              </p>
              <div className="d-flex align-items-center gap-1 mt-0.5 small text-secondary" style={{ fontSize: "11px" }}>
                <span>
                  {editCategory?.type === "EXPENSE" ? "Expense" : "Income"} Category
                </span>
                <span>•</span>
                <span>
                  Icon: {editFormData.icon}
                </span>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top mt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setEditCategory(null)}
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
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

