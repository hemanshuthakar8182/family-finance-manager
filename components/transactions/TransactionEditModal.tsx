"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useToast } from "@/components/ui/Toast";
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
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 min-vh-0">
        {/* Type Toggle */}
        <div className="row g-1 p-1 bg-light rounded-btn border">
          <div className="col-4">
            <button
              type="button"
              onClick={() => handleTypeChange("EXPENSE")}
              className={cn(
                "btn btn-sm w-100 py-1.5 rounded-btn fw-bold small transition",
                type === "EXPENSE"
                  ? "btn-danger text-white shadow-sm"
                  : "btn-link text-secondary text-decoration-none"
              )}
            >
              Expense
            </button>
          </div>
          <div className="col-4">
            <button
              type="button"
              onClick={() => handleTypeChange("INCOME")}
              className={cn(
                "btn btn-sm w-100 py-1.5 rounded-btn fw-bold small transition",
                type === "INCOME"
                  ? "btn-success text-white shadow-sm"
                  : "btn-link text-secondary text-decoration-none"
              )}
            >
              Income
            </button>
          </div>
          <div className="col-4">
            <button
              type="button"
              onClick={() => handleTypeChange("TRANSFER")}
              className={cn(
                "btn btn-sm w-100 py-1.5 rounded-btn fw-bold small transition",
                type === "TRANSFER"
                  ? "btn-primary text-white shadow-sm"
                  : "btn-link text-secondary text-decoration-none"
              )}
            >
              Transfer
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="form-label small fw-semibold text-secondary mb-1">
            Amount (INR) *
          </label>
          <div className="position-relative d-flex align-items-center">
            <span
              className={cn(
                "position-absolute start-0 ps-3 fs-4 fw-bold select-none",
                type === "EXPENSE"
                  ? "text-danger"
                  : type === "INCOME"
                  ? "text-success"
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
              className="form-control form-control-lg rounded-input ps-5 fs-4 fw-bold font-amount text-dark bg-surface border-2"
            />
          </div>
          {error && <div className="text-danger small fw-semibold mt-1">{error}</div>}
        </div>

        {/* Date & Time Picker */}
        <div className="d-flex flex-column gap-1">
          <div className="d-flex align-items-center justify-content-between">
            <label className="form-label small fw-semibold text-dark mb-0">
              Transaction Date &amp; Time *
            </label>
            <div className="d-flex align-items-center gap-1">
              <button
                type="button"
                onClick={() => setDate(todayStr)}
                className={cn(
                  "badge rounded-pill border py-1 px-2 text-decoration-none fw-semibold",
                  isToday
                    ? "bg-primary-subtle text-primary border-primary-subtle"
                    : "bg-light text-secondary border"
                )}
                style={{ fontSize: "10px" }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDate(yesterdayStr)}
                className={cn(
                  "badge rounded-pill border py-1 px-2 text-decoration-none fw-semibold",
                  isYesterday
                    ? "bg-primary-subtle text-primary border-primary-subtle"
                    : "bg-light text-secondary border"
                )}
                style={{ fontSize: "10px" }}
              >
                Yesterday
              </button>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-6">
              <div className="position-relative d-flex align-items-center">
                <Calendar style={{ width: "14px", height: "14px" }} className="position-absolute start-0 ms-2 text-secondary pointer-events-none" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-control form-control-sm rounded-input ps-4 small text-dark bg-surface border"
                />
              </div>
            </div>
            <div className="col-6">
              <div className="position-relative d-flex align-items-center">
                <Clock style={{ width: "14px", height: "14px" }} className="position-absolute start-0 ms-2 text-secondary pointer-events-none" />
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="form-control form-control-sm rounded-input ps-4 small text-dark bg-surface border"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Conditional View: TRANSFER vs CATEGORY */}
        {type === "TRANSFER" ? (
          <div className="p-3 bg-light rounded-card border d-flex flex-column gap-2">
            <div>
              <label className="form-label small fw-semibold text-dark mb-1">
                Transfer From (Source Account) *
              </label>
              <div className="d-flex gap-1 overflow-x-auto pb-1">
                {accounts.map((acc) => {
                  const isSelected = selectedAccountId === acc.id;
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={cn(
                        "btn btn-sm rounded-pill px-3 py-1 text-nowrap fw-semibold small",
                        isSelected
                          ? "btn-danger text-white shadow-sm"
                          : "btn-light border text-dark"
                      )}
                    >
                      {acc.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="d-flex justify-content-center text-secondary py-1">
              <ArrowRight style={{ width: "16px", height: "16px" }} />
            </div>

            <div>
              <label className="form-label small fw-semibold text-dark mb-1">
                Transfer To (Destination Account) *
              </label>
              <div className="d-flex gap-1 overflow-x-auto pb-1">
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
                          "btn btn-sm rounded-pill px-3 py-1 text-nowrap fw-semibold small",
                          isSelected
                            ? "btn-success text-white shadow-sm"
                            : "btn-light border text-dark"
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
              <label className="form-label small fw-semibold text-dark mb-1">
                Category *
              </label>
              <div className="row g-2 p-2 border rounded-card bg-light overflow-y-auto" style={{ maxHeight: "170px" }}>
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <div key={cat.id} className="col-4 col-sm-3">
                      <button
                        type="button"
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={cn(
                          "btn btn-sm w-100 d-flex flex-column align-items-center justify-content-center p-2 rounded-btn border text-center transition h-100",
                          isSelected
                            ? "btn-light border-primary bg-primary-subtle shadow-sm"
                            : "btn-light border text-dark"
                        )}
                      >
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center mb-1 text-white flex-shrink-0"
                          style={{ width: "28px", height: "28px", backgroundColor: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} size={14} />
                        </div>
                        <span className="small fw-medium text-truncate w-100" style={{ fontSize: "11px" }}>
                          {cat.name}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {accounts.length > 0 && (
              <div>
                <label className="form-label small fw-semibold text-dark mb-1">
                  Account / Wallet
                </label>
                <div className="d-flex gap-1 overflow-x-auto pb-1">
                  {accounts.map((acc) => {
                    const isSelected = selectedAccountId === acc.id;
                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={cn(
                          "btn btn-sm rounded-pill px-3 py-1 text-nowrap fw-semibold small",
                          isSelected
                            ? "btn-primary text-white shadow-sm"
                            : "btn-light border text-dark"
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
          <label className="form-label small fw-semibold text-secondary mb-1">
            Description / Reference
          </label>
          <input
            type="text"
            placeholder="e.g. Reference notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-control form-control-sm rounded-input py-1.5 px-3 small border"
          />
        </div>

        <div>
          <label className="form-label small fw-semibold text-secondary mb-1">
            Notes
          </label>
          <textarea
            rows={2}
            placeholder="Additional context..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-control form-control-sm rounded-input p-2 small border"
            style={{ resize: "none" }}
          />
        </div>

        {/* Attached Receipt / Bill */}
        <div>
          <label className="form-label small fw-semibold text-secondary mb-1">
            Bill / Receipt
          </label>
          <ReceiptUploader
            receiptUrl={receiptUrl}
            onReceiptChange={setReceiptUrl}
          />
        </div>

        {/* Sticky Actions Footer */}
        <div 
          className="position-sticky bottom-0 bg-surface border-top pt-2.5 pb-2 mt-auto d-flex gap-2"
          style={{ zIndex: 20, paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 12px))" }}
        >
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="flex-fill fw-bold small shadow-sm"
          >
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isSubmitting}
            onClick={onClose}
            className="small px-4"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
