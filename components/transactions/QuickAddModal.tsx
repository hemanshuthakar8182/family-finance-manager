"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils/formatters";
import { Calendar, CheckCircle2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface CategoryItem {
  id: string;
  name: string;
  type: "EXPENSE" | "INCOME";
  icon: string;
  color: string;
}

interface AccountItem {
  id: string;
  name: string;
  type: string;
  currentBalance: number | string;
}

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function QuickAddModal({ isOpen, onClose, onSuccess }: QuickAddModalProps) {
  const { showToast } = useToast();

  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [showMoreFields, setShowMoreFields] = useState<boolean>(false);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Fetch categories and accounts only when opened and not already loaded
  useEffect(() => {
    if (isOpen) {
      if (categories.length === 0 || accounts.length === 0) {
        setIsLoadingData(true);
        setError("");
        Promise.all([
          fetch("/api/categories").then((r) => r.json()),
          fetch("/api/accounts").then((r) => r.json()),
        ])
          .then(([catData, accData]) => {
            if (Array.isArray(catData)) {
              setCategories(catData);
              const filtered = catData.filter((c: any) => c.type === type);
              if (filtered.length > 0 && !selectedCategoryId) {
                setSelectedCategoryId(filtered[0].id);
              }
            }
            if (Array.isArray(accData)) {
              setAccounts(accData);
              if (accData.length > 0 && !selectedAccountId) {
                setSelectedAccountId(accData[0].id);
              }
            }
          })
          .catch(() => setError("Failed to load options"))
          .finally(() => setIsLoadingData(false));
      } else {
        // Categories already in memory, ensure selection matches current type
        const filtered = categories.filter((c) => c.type === type);
        if (filtered.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(filtered[0].id);
        }
      }
    }
  }, [isOpen]);

  // Update selected category if type changes
  const handleTypeChange = (newType: "EXPENSE" | "INCOME") => {
    setType(newType);
    const matching = categories.filter((c) => c.type === newType);
    if (matching.length > 0) {
      setSelectedCategoryId(matching[0].id);
    } else {
      setSelectedCategoryId("");
    }
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setNotes("");
    setError("");
  };

  const handleSubmit = async (addAnother = false) => {
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }
    if (!selectedCategoryId) {
      setError("Please select a category");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          categoryId: selectedCategoryId,
          accountId: selectedAccountId || null,
          date: new Date(date).toISOString(),
          description: description || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record transaction");
      }

      const categoryObj = categories.find((c) => c.id === selectedCategoryId);
      const catName = categoryObj ? categoryObj.name : "Transaction";
      const formattedAmt = formatCurrency(Number(amount));

      showToast({
        type: "success",
        title: `✓ ${type === "EXPENSE" ? "Expense" : "Income"} Added`,
        message: `${catName} • ${formattedAmt}`,
        actionText: addAnother ? undefined : "+ Add Another",
        onAction: () => {
          resetForm();
        },
      });

      onSuccess?.();

      if (addAnother) {
        resetForm();
      } else {
        resetForm();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  // Quick date helper values
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

  const isToday = date === todayStr;
  const isYesterday = date === yesterdayStr;
  const isCustomDate = !isToday && !isYesterday;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === "EXPENSE" ? "Add Expense" : "Add Income"}
      description="Record family transaction in seconds"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1 flex flex-col">
        {/* Type Toggle: Expense / Income */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-btn">
          <button
            type="button"
            onClick={() => handleTypeChange("EXPENSE")}
            className={cn(
              "py-2 rounded-btn font-semibold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-1.5",
              type === "EXPENSE"
                ? "bg-expense text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("INCOME")}
            className={cn(
              "py-2 rounded-btn font-semibold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-1.5",
              type === "INCOME"
                ? "bg-income text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <span>Income</span>
          </button>
        </div>

        {/* Large Amount Input + Indian Currency Display */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-500">
              Amount (INR)
            </label>
            {amount && Number(amount) > 0 && (
              <span className="text-xs font-bold text-slate-700 font-amount">
                {formatCurrency(Number(amount))}
              </span>
            )}
          </div>
          <div className="relative flex items-center">
            <span
              className={cn(
                "absolute left-4 font-bold text-2xl sm:text-3xl select-none",
                type === "EXPENSE" ? "text-expense" : "text-income"
              )}
            >
              ₹
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              autoFocus
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={cn(
                "w-full h-14 sm:h-16 pl-11 pr-4 rounded-input border-2 bg-white text-2xl sm:text-3xl font-bold font-amount text-slate-900 focus:outline-none transition-all placeholder:text-slate-300",
                type === "EXPENSE"
                  ? "border-red-200 focus:border-expense focus:ring-2 focus:ring-red-100"
                  : "border-green-200 focus:border-income focus:ring-2 focus:ring-green-100"
              )}
            />
          </div>
          {error && <p className="text-xs text-expense font-semibold mt-1">{error}</p>}
        </div>

        {/* One-Tap Date Shortcuts (Today / Yesterday / Custom) */}
        <div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDate(todayStr)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border",
                isToday
                  ? "bg-teal-50 border-primary text-primary shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              )}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setDate(yesterdayStr)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border",
                isYesterday
                  ? "bg-teal-50 border-primary text-primary shadow-xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              )}
            >
              Yesterday
            </button>
            <div className="relative inline-flex items-center">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[11px] font-medium border bg-white focus:outline-none focus:ring-1 focus:ring-primary",
                  isCustomDate
                    ? "border-primary text-primary bg-teal-50/50 font-semibold"
                    : "border-slate-200 text-slate-500"
                )}
              />
            </div>
          </div>
        </div>

        {/* Touch-Friendly Category Grid */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Select Category
            </label>
            <span className="text-[11px] text-slate-400">
              {filteredCategories.length} available
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 sm:max-h-52 overflow-y-auto p-1.5 border border-border/70 rounded-card bg-slate-50/60">
            {filteredCategories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-btn border text-center transition-all duration-150 active:scale-95",
                    isSelected
                      ? "bg-white border-primary ring-2 ring-primary/20 shadow-sm"
                      : "bg-surface border-border/70 hover:border-slate-300 text-slate-700"
                  )}
                >
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={15} />
                  </div>
                  <span className="text-[11px] font-medium leading-tight line-clamp-1">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Touch-Friendly Account Selector Chips */}
        {accounts.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Paid With / Deposited In
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {accounts.map((acc) => {
                const isSelected = selectedAccountId === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setSelectedAccountId(acc.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 shrink-0",
                      isSelected
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-white text-slate-700 border-border hover:bg-slate-50"
                    )}
                  >
                    <span>{acc.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Expandable Optional Details (Description, Notes) */}
        <div>
          <button
            type="button"
            onClick={() => setShowMoreFields(!showMoreFields)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1"
          >
            {showMoreFields ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" /> Less options
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" /> Add merchant name or notes
              </>
            )}
          </button>

          {showMoreFields && (
            <div className="mt-2 space-y-3 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Description / Merchant (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Blinkit, Shell Petrol, Reliance Fresh"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-10 px-3 rounded-input border border-border text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context for family..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-input border border-border text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sticky Submit Actions Footer */}
        <div className="sticky bottom-0 bg-surface/95 backdrop-blur-md pt-3 pb-1 border-t border-slate-100 -mx-1 px-1 flex flex-col sm:flex-row gap-2 mt-auto">
          <Button
            type="button"
            variant={type === "EXPENSE" ? "expense" : "income"}
            size="lg"
            isLoading={isSubmitting}
            onClick={() => handleSubmit(false)}
            className="w-full text-sm sm:text-base font-bold shadow-md"
          >
            {type === "EXPENSE" ? "Save Expense" : "Save Income"}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto text-xs font-semibold whitespace-nowrap"
          >
            Save & Add Another
          </Button>
        </div>
      </div>
    </Modal>
  );
}
