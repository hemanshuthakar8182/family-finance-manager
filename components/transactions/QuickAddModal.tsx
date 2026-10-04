"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils/formatters";
import { ArrowRight, ChevronDown, ChevronUp, Clock, ArrowRightLeft, Plus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ReceiptUploader } from "@/components/transactions/ReceiptUploader";
import { SplitExpenseForm } from "@/components/splits/SplitExpenseForm";

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

  const [type, setType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">("EXPENSE");
  const [amount, setAmount] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedToAccountId, setSelectedToAccountId] = useState<string>("");
  const getCurrentTimeStr = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState<string>(getCurrentTimeStr);
  const [description, setDescription] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [splitData, setSplitData] = useState<{
    isSplit: boolean;
    shares: Array<{ memberId: string; amount: number }>;
  }>({ isSplit: false, shares: [] });
  const [showMoreFields, setShowMoreFields] = useState<boolean>(false);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      if (categories.length === 0 || accounts.length === 0) {
        setError("");
        Promise.all([
          fetch("/api/categories").then((r) => r.json()),
          fetch("/api/accounts").then((r) => r.json()),
        ])
          .then(([catData, accData]) => {
            if (Array.isArray(catData)) {
              setCategories(catData);
              const filtered = catData.filter((c: any) => c.type === "EXPENSE");
              if (filtered.length > 0 && !selectedCategoryId) {
                setSelectedCategoryId(filtered[0].id);
              }
            }
            if (Array.isArray(accData)) {
              setAccounts(accData);
              if (accData.length > 0) {
                if (!selectedAccountId) setSelectedAccountId(accData[0].id);
                if (accData.length > 1 && !selectedToAccountId) {
                  setSelectedToAccountId(accData[1].id);
                }
              }
            }
          })
          .catch(() => setError("Failed to load options"));
      } else {
        if (type !== "TRANSFER") {
          const filtered = categories.filter((c) => c.type === type);
          if (filtered.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(filtered[0].id);
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleTypeChange = (newType: "EXPENSE" | "INCOME" | "TRANSFER") => {
    setType(newType);
    if (newType !== "TRANSFER") {
      const matching = categories.filter((c) => c.type === newType);
      if (matching.length > 0) {
        setSelectedCategoryId(matching[0].id);
      } else {
        setSelectedCategoryId("");
      }
    } else {
      setSelectedCategoryId("");
      if (accounts.length > 1 && (!selectedToAccountId || selectedToAccountId === selectedAccountId)) {
        const other = accounts.find((a) => a.id !== selectedAccountId);
        if (other) setSelectedToAccountId(other.id);
      }
    }
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setNotes("");
    setReceiptUrl(null);
    setSplitData({ isSplit: false, shares: [] });
    setTime(getCurrentTimeStr());
    setError("");
  };

  const handleOcrExtracted = (ocr: { amount?: number; date?: string; merchant?: string }) => {
    if (ocr.amount && (!amount || Number(amount) <= 0)) {
      setAmount(ocr.amount.toString());
    }
    if (ocr.date) {
      setDate(ocr.date);
    }
    if (ocr.merchant && !description) {
      setDescription(ocr.merchant);
    }
    setShowMoreFields(true);
  };

  const handleSubmit = async (addAnother = false) => {
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (type !== "TRANSFER" && !selectedCategoryId) {
      setError("Please select a category");
      return;
    }

    if (type === "TRANSFER") {
      if (!selectedAccountId) {
        setError("Please select the source account");
        return;
      }
      if (!selectedToAccountId) {
        setError("Please select the destination account");
        return;
      }
      if (selectedAccountId === selectedToAccountId) {
        setError("Source and destination accounts must be different");
        return;
      }
    }

    setIsSubmitting(true);
    setError("");

    try {
      const [hh, mm] = (time || "12:00").split(":").map(Number);
      const txDate = new Date(date);
      txDate.setHours(hh || 0, mm || 0, 0, 0);

      const payload: any = {
        type,
        amount: Number(amount),
        categoryId: type === "TRANSFER" ? null : selectedCategoryId,
        accountId: selectedAccountId || null,
        toAccountId: type === "TRANSFER" ? selectedToAccountId : null,
        date: txDate.toISOString(),
        description: description || undefined,
        notes: notes || undefined,
        receiptUrl: receiptUrl || null,
      };

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to record transaction");
      }

      // If split configured on expense, record split
      if (type === "EXPENSE" && splitData.isSplit && splitData.shares.length > 0 && data.id) {
        try {
          await fetch("/api/splits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transactionId: data.id,
              totalAmount: Number(amount),
              shares: splitData.shares,
              notes: description || "Shared household expense",
            }),
          });
        } catch (splitErr) {
          console.warn("Failed to create split shares:", splitErr);
        }
      }

      const formattedAmt = formatCurrency(Number(amount));
      if (type === "TRANSFER") {
        const fromName = accounts.find((a) => a.id === selectedAccountId)?.name || "Account";
        const toName = accounts.find((a) => a.id === selectedToAccountId)?.name || "Account";
        showToast({
          type: "success",
          title: "✓ Transfer Recorded",
          message: `${fromName} → ${toName} • ${formattedAmt}`,
        });
      } else {
        const categoryObj = categories.find((c) => c.id === selectedCategoryId);
        const catName = categoryObj ? categoryObj.name : "Transaction";
        showToast({
          type: "success",
          title: `✓ ${type === "EXPENSE" ? "Expense" : "Income"} Added`,
          message: `${catName} • ${formattedAmt}`,
          actionText: addAnother ? undefined : "+ Add Another",
          onAction: () => {
            resetForm();
          },
        });

        // Trigger budget warning alert if present
        if (data.budgetAlert) {
          setTimeout(() => {
            showToast({
              type: data.budgetAlert.status === "EXCEEDED" ? "error" : "warning",
              title:
                data.budgetAlert.status === "EXCEEDED"
                  ? "⚠️ Budget Exceeded"
                  : "⚠️ Budget Alert",
              message: `${data.budgetAlert.categoryName} is at ${data.budgetAlert.percentage}% (${formatCurrency(data.budgetAlert.spent)} / ${formatCurrency(data.budgetAlert.limit)})`,
            });
          }, 350);
        }
      }

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
      title={
        type === "EXPENSE"
          ? "Add Expense"
          : type === "INCOME"
          ? "Add Income"
          : "Transfer Funds"
      }
      description={
        type === "TRANSFER"
          ? "Move money between family accounts or wallets"
          : "Record family transaction in seconds"
      }
      maxWidth="md"
    >
      <div className="space-y-4 flex flex-col min-h-full">
        {/* Type Toggle: Expense / Income / Transfer */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-btn">
          <button
            type="button"
            onClick={() => handleTypeChange("EXPENSE")}
            className={cn(
              "py-2 rounded-btn font-semibold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-1",
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
              "py-2 rounded-btn font-semibold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-1",
              type === "INCOME"
                ? "bg-income text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <span>Income</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("TRANSFER")}
            className={cn(
              "py-2 rounded-btn font-semibold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-1",
              type === "TRANSFER"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            <span>Transfer</span>
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
                type === "EXPENSE"
                  ? "text-expense"
                  : type === "INCOME"
                  ? "text-income"
                  : "text-primary"
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
                  : type === "INCOME"
                  ? "border-green-200 focus:border-income focus:ring-2 focus:ring-green-100"
                  : "border-primary/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
              )}
            />
          </div>
          {error && <p className="text-xs text-expense font-semibold mt-1">{error}</p>}
        </div>

        {/* Date & Time Picker */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700">
              Transaction Date &amp; Time
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all",
                  isToday
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-surface-muted border-border text-slate-600 hover:bg-slate-100"
                )}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDate(yesterdayStr)}
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all",
                  isYesterday
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-surface-muted border-border text-slate-600 hover:bg-slate-100"
                )}
              >
                Yesterday
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="relative flex items-center">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 pl-8 pr-2 rounded-input border border-border text-xs text-slate-800 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="relative flex items-center">
              <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-10 pl-8 pr-2 rounded-input border border-border text-xs text-slate-800 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Conditional View: TRANSFER vs EXPENSE/INCOME */}
        {type === "TRANSFER" ? (
          accounts.length < 2 ? (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-card text-center space-y-2.5">
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">
                  {accounts.length === 0
                    ? "No accounts found"
                    : "At least 2 accounts required for transfer"}
                </p>
                <p className="text-[11px] text-amber-700 mt-1 max-w-sm mx-auto leading-relaxed">
                  A fund transfer moves balance between two accounts (e.g. Bank to Cash or HDFC to ICICI). Please create your family accounts first.
                </p>
              </div>
              <div className="pt-0.5">
                <a
                  href="/accounts"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-btn shadow-xs hover:bg-primary-hover transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Accounts Now
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-3 bg-slate-50 rounded-card border border-border">
              {/* From Account */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transfer From (Source Account) *
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {accounts.map((acc) => {
                    const isSelected = selectedAccountId === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setSelectedAccountId(acc.id);
                          if (selectedToAccountId === acc.id) setSelectedToAccountId("");
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all shrink-0",
                          isSelected
                            ? "bg-expense text-white border-expense shadow-xs"
                            : "bg-white text-slate-700 border-border hover:bg-slate-50"
                        )}
                      >
                        {acc.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-center text-slate-400 py-0.5">
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* To Account */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transfer To (Destination Account) *
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {accounts
                    .filter((acc) => acc.id !== selectedAccountId)
                    .map((acc) => {
                      const isSelected = selectedToAccountId === acc.id;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => setSelectedToAccountId(acc.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all shrink-0",
                            isSelected
                              ? "bg-income text-white border-income shadow-xs"
                              : "bg-white text-slate-700 border-border hover:bg-slate-50"
                          )}
                        >
                          {acc.name}
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>
          )
        ) : (
          <>
            {/* Category Grid */}
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

            {/* Single Account Selector */}
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
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-surface text-slate-700 border-border hover:bg-surface-muted"
                        )}
                      >
                        <span>{acc.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Description & Notes */}
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
                <ChevronDown className="w-3.5 h-3.5" /> Add description or notes
              </>
            )}
          </button>

          {showMoreFields && (
            <div className="mt-2 space-y-3 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Description / Reference
                </label>
                <input
                  type="text"
                  placeholder={
                    type === "TRANSFER"
                      ? "e.g. ATM withdrawal, Card settlement"
                      : "e.g. Blinkit, Fuel refill"
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-10 px-3 rounded-input border border-border text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

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

              {/* Receipt Uploader with OCR */}
              <div className="pt-1">
                <ReceiptUploader
                  receiptUrl={receiptUrl}
                  onReceiptChange={setReceiptUrl}
                  onOcrExtracted={handleOcrExtracted}
                />
              </div>

              {/* Split with Family for Expenses */}
              {type === "EXPENSE" && Number(amount) > 0 && (
                <div className="pt-1">
                  <SplitExpenseForm
                    totalAmount={Number(amount)}
                    onSplitChange={setSplitData}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="sticky bottom-0 -mx-4 -mb-3.5 sm:-mx-6 sm:-mb-4 px-4 sm:px-6 py-3 bg-surface/95 backdrop-blur-md border-t border-border mt-auto flex flex-col sm:flex-row gap-2 z-20">
          <Button
            type="button"
            variant={
              type === "EXPENSE"
                ? "expense"
                : type === "INCOME"
                ? "income"
                : "primary"
            }
            size="lg"
            isLoading={isSubmitting}
            onClick={() => handleSubmit(false)}
            className="w-full text-sm sm:text-base font-bold shadow-md"
          >
            {type === "EXPENSE"
              ? "Save Expense"
              : type === "INCOME"
              ? "Save Income"
              : "Record Transfer"}
          </Button>

          {type !== "TRANSFER" && (
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
          )}
        </div>
      </div>
    </Modal>
  );
}
