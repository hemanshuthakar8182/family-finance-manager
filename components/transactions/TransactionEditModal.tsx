"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils/formatters";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ReceiptUploader } from "@/components/transactions/ReceiptUploader";

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

interface TransactionEditModalProps {
  transaction: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransactionEditModal({
  transaction,
  isOpen,
  onClose,
  onSuccess,
}: TransactionEditModalProps) {
  const { showToast } = useToast();

  const [type, setType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">("EXPENSE");
  const [amount, setAmount] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedToAccountId, setSelectedToAccountId] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("12:00");
  const [description, setDescription] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (transaction && isOpen) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setSelectedCategoryId(transaction.categoryId || "");
      setSelectedAccountId(transaction.accountId || "");
      setSelectedToAccountId(transaction.toAccountId || "");
      
      const txDate = transaction.date ? new Date(transaction.date) : new Date();
      const y = txDate.getFullYear();
      const m = String(txDate.getMonth() + 1).padStart(2, "0");
      const d = String(txDate.getDate()).padStart(2, "0");
      const hr = String(txDate.getHours()).padStart(2, "0");
      const mn = String(txDate.getMinutes()).padStart(2, "0");
      setDate(`${y}-${m}-${d}`);
      setTime(`${hr}:${mn}`);

      setDescription(transaction.description || "");
      setNotes(transaction.notes || "");
      setReceiptUrl(transaction.receiptUrl || null);
      setError("");

      Promise.all([
        fetch("/api/categories").then((r) => r.json()),
        fetch("/api/accounts").then((r) => r.json()),
      ]).then(([catData, accData]) => {
        if (Array.isArray(catData)) setCategories(catData);
        if (Array.isArray(accData)) setAccounts(accData);
      });
    }
  }, [transaction, isOpen]);

  if (!transaction) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // Accurately combine Date and Time in local time
      const [yearNum, monthNum, dayNum] = (date || new Date().toISOString().split("T")[0]).split("-").map(Number);
      const [hoursNum, minsNum] = (time || "12:00").split(":").map(Number);
      const combinedDate = new Date(yearNum, monthNum - 1, dayNum, hoursNum || 0, minsNum || 0);

      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          categoryId: type === "TRANSFER" ? null : selectedCategoryId,
          accountId: selectedAccountId || null,
          toAccountId: type === "TRANSFER" ? selectedToAccountId : null,
          date: combinedDate.toISOString(),
          description: description || undefined,
          notes: notes || undefined,
          receiptUrl: receiptUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update transaction");
      }

      showToast({
        type: "success",
        title: "Transaction Updated",
        message: "Account balances have been adjusted automatically.",
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save changes");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const todayStr = new Date().toISOString().split("T")[0];
  const yDate = new Date();
  yDate.setDate(yDate.getDate() - 1);
  const yesterdayStr = yDate.toISOString().split("T")[0];

  const isToday = date === todayStr;
  const isYesterday = date === yesterdayStr;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Transaction"
      description="Update record details and account adjustments"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col min-h-full space-y-4">
        {/* Type Toggle */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-btn">
          <button
            type="button"
            onClick={() => handleTypeChange("EXPENSE")}
            className={cn(
              "py-2 rounded-btn font-semibold text-xs transition-all",
              type === "EXPENSE"
                ? "bg-expense text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("INCOME")}
            className={cn(
              "py-2 rounded-btn font-semibold text-xs transition-all",
              type === "INCOME"
                ? "bg-income text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Income
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("TRANSFER")}
            className={cn(
              "py-2 rounded-btn font-semibold text-xs transition-all",
              type === "TRANSFER"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Transfer
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Amount (INR) *
          </label>
          <div className="relative flex items-center">
            <span
              className={cn(
                "absolute left-4 font-bold text-2xl select-none",
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
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-input border-2 bg-white text-xl font-bold font-amount text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {error && <p className="text-xs text-expense font-semibold mt-1">{error}</p>}
        </div>

        {/* Date & Time Picker */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">
              Transaction Date &amp; Time *
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
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-10 pl-8 pr-2 rounded-input border border-border text-xs text-slate-800 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="relative flex items-center">
              <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-10 pl-8 pr-2 rounded-input border border-border text-xs text-slate-800 bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Conditional View: TRANSFER vs CATEGORY */}
        {type === "TRANSFER" ? (
          <div className="space-y-3 p-3 bg-slate-50 rounded-card border border-border">
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
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all",
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
                          "px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all",
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
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category *
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1.5 border border-border/70 rounded-card bg-slate-50/60">
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-2 rounded-btn border text-center transition-all",
                        isSelected
                          ? "bg-white border-primary ring-2 ring-primary/20 shadow-sm"
                          : "bg-surface border-border/70 hover:border-slate-300 text-slate-700"
                      )}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center mb-1 text-white shrink-0"
                        style={{ backgroundColor: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} size={14} />
                      </div>
                      <span className="text-[11px] font-medium leading-tight line-clamp-1">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {accounts.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account / Wallet
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
                          "px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-surface text-slate-700 border-border hover:bg-surface-muted"
                        )}
                      >
                        {acc.name}
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
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Description / Reference
          </label>
          <input
            type="text"
            placeholder="e.g. Reference notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-9 px-3 rounded-input border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Notes
          </label>
          <textarea
            rows={2}
            placeholder="Additional context..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-2.5 rounded-input border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Attached Receipt / Bill */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Bill / Receipt
          </label>
          <ReceiptUploader
            receiptUrl={receiptUrl}
            onReceiptChange={setReceiptUrl}
          />
        </div>

        {/* Sticky Actions Footer */}
        <div className="sticky bottom-0 -mx-4 -mb-3.5 sm:-mx-6 sm:-mb-4 px-4 sm:px-6 py-2.5 sm:py-3 bg-surface/95 backdrop-blur-md border-t border-border mt-auto flex gap-2 z-20 pb-[max(0.75rem,env(safe-area-inset-bottom,12px))]">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="flex-1 font-bold text-xs shadow-sm"
          >
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isSubmitting}
            onClick={onClose}
            className="text-xs px-4"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
