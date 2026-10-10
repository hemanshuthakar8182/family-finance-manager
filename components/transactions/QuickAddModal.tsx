"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useToast } from "@/components/ui/Toast";
import { 
  ArrowRight, 
  Clock, 
  ArrowRightLeft, 
  Plus, 
  Calendar,
  Receipt,
  Users,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatCurrency } from "@/lib/utils/formatters";
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
  const [showReceiptSection, setShowReceiptSection] = useState<boolean>(false);
  const [showSplitSection, setShowSplitSection] = useState<boolean>(false);
  const [showNotesSection, setShowNotesSection] = useState<boolean>(false);

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
          .catch((err) => {
            console.error("Failed to load reference data", err);
            setError("Could not load categories or accounts");
          });
      }
    }
  }, [isOpen, categories.length, accounts.length, selectedCategoryId, selectedAccountId, selectedToAccountId]);

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

  const handleOcrExtracted = (ocr: {
    amount?: number;
    date?: string;
    merchant?: string;
  }) => {
    if (ocr.amount && (!amount || Number(amount) === 0)) {
      setAmount(String(ocr.amount));
    }
    if (ocr.date) {
      setDate(ocr.date);
    }
    if (ocr.merchant && !description) {
      setDescription(ocr.merchant);
      const match = categories.find((c) =>
        c.type === "EXPENSE" &&
        (ocr.merchant?.toLowerCase().includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(ocr.merchant?.toLowerCase() || ""))
      );
      if (match) setSelectedCategoryId(match.id);
    }
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setNotes("");
    setReceiptUrl(null);
    setSplitData({ isSplit: false, shares: [] });
    setShowReceiptSection(false);
    setShowSplitSection(false);
    setShowNotesSection(false);
    setError("");
    setDate(new Date().toISOString().split("T")[0]);
    setTime(getCurrentTimeStr());
    if (categories.length > 0) {
      const defaultCat = categories.find((c) => c.type === type);
      if (defaultCat) setSelectedCategoryId(defaultCat.id);
    }
  };

  const handleSubmit = async (addAnother: boolean = false) => {
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
        setError("Please select source account");
        return;
      }
      if (!selectedToAccountId) {
        setError("Please select destination account");
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
      const [year, month, day] = date.split("-").map(Number);
      const [hours, minutes] = (time || "12:00").split(":").map(Number);
      const txDate = new Date(year, month - 1, day, hours, minutes);

      const payload = {
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

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

  const isToday = date === todayStr;
  const isYesterday = date === yesterdayStr;

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
      <div className="d-flex flex-column gap-3 min-vh-0">
        {/* Type Toggle: Expense / Income / Transfer */}
        <div className="row g-1 p-1 bg-light rounded-btn border text-center">
          <div className="col-4">
            <button
              type="button"
              onClick={() => handleTypeChange("EXPENSE")}
              className={cn(
                "btn btn-sm w-100 py-1.5 rounded-btn small fw-bold transition",
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
                "btn btn-sm w-100 py-1.5 rounded-btn small fw-bold transition",
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
                "btn btn-sm w-100 py-1.5 rounded-btn small fw-bold transition",
                type === "TRANSFER"
                  ? "btn-primary text-white shadow-sm"
                  : "btn-link text-secondary text-decoration-none"
              )}
            >
              Transfer
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <div className="d-flex align-items-center justify-content-between mb-1">
            <label className="form-label small fw-semibold text-secondary mb-0">
              Amount (INR)
            </label>
            {amount && Number(amount) > 0 && (
              <span className="small fw-bold text-dark font-amount">
                {formatCurrency(Number(amount))}
              </span>
            )}
          </div>
          <div className="position-relative d-flex align-items-center">
            <span
              className={cn(
                "position-absolute start-0 ps-3 fs-3 fw-bold select-none",
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
              autoFocus
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-control form-control-lg rounded-input ps-5 fs-3 fw-bold font-amount text-dark bg-surface border-2"
            />
          </div>
          {error && <div className="text-danger small fw-semibold mt-1">{error}</div>}
        </div>

        {/* Date & Time Picker */}
        <div className="d-flex flex-column gap-1">
          <div className="d-flex align-items-center justify-content-between">
            <label className="form-label small fw-semibold text-dark mb-0">
              Transaction Date &amp; Time
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
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="form-control form-control-sm rounded-input ps-4 small text-dark bg-surface border"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Conditional View: TRANSFER vs EXPENSE/INCOME */}
        {type === "TRANSFER" ? (
          accounts.length < 2 ? (
            <div className="p-3 bg-warning-subtle border border-warning-subtle rounded-card text-center d-flex flex-column gap-2">
              <div 
                className="rounded-circle bg-warning bg-opacity-25 text-warning-emphasis d-flex align-items-center justify-content-center mx-auto"
                style={{ width: "40px", height: "40px" }}
              >
                <ArrowRightLeft style={{ width: "20px", height: "20px" }} />
              </div>
              <div>
                <p className="small fw-bold text-dark mb-0">
                  {accounts.length === 0
                    ? "No accounts found"
                    : "At least 2 accounts required for transfer"}
                </p>
                <p className="text-secondary small mb-0 mt-1" style={{ fontSize: "11px" }}>
                  A fund transfer moves balance between two accounts. Please create your family accounts first.
                </p>
              </div>
              <div>
                <a
                  href="/accounts"
                  className="btn btn-sm btn-primary rounded-btn px-3 py-1 small fw-semibold text-decoration-none"
                >
                  <Plus style={{ width: "14px", height: "14px" }} className="me-1" />
                  Add Accounts Now
                </a>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-light rounded-card border d-flex flex-column gap-2">
              {/* From Account */}
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
                        onClick={() => {
                          setSelectedAccountId(acc.id);
                          if (selectedToAccountId === acc.id) setSelectedToAccountId("");
                        }}
                        className={cn(
                          "btn btn-sm rounded-pill px-3 py-1 text-nowrap fw-semibold small flex-shrink-0",
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

              {/* To Account */}
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
                            "btn btn-sm rounded-pill px-3 py-1 text-nowrap fw-semibold small flex-shrink-0",
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
          )
        ) : (
          <>
            {/* Category Grid */}
            <div>
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="form-label small fw-semibold text-dark mb-0">
                  Select Category
                </label>
                <span className="text-secondary small" style={{ fontSize: "11px" }}>
                  {filteredCategories.length} available
                </span>
              </div>
              <div className="row g-2 p-2 border rounded-card bg-light overflow-y-auto" style={{ maxHeight: "190px" }}>
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <div key={cat.id} className="col-4 col-sm-3">
                      <button
                        key={cat.id}
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
                          style={{ width: "30px", height: "30px", backgroundColor: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} size={15} />
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

            {/* Single Account Selector */}
            {accounts.length > 0 && (
              <div>
                <label className="form-label small fw-semibold text-dark mb-1">
                  Paid With / Deposited In
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
                          "btn btn-sm rounded-pill px-3 py-1 text-nowrap fw-semibold small flex-shrink-0",
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

        {/* ── Quick Tools Bar ── */}
        <div className="pt-1">
          <div className="row g-1 p-1 bg-light rounded-btn border text-center">
            <div className="col-4">
              <button
                type="button"
                onClick={() => setShowReceiptSection(!showReceiptSection)}
                className={cn(
                  "btn btn-sm w-100 py-1.5 px-1 rounded-btn d-flex flex-column align-items-center justify-content-center gap-1 transition",
                  showReceiptSection || receiptUrl
                    ? "btn-primary text-white shadow-sm"
                    : "btn-light border text-dark"
                )}
              >
                <Receipt style={{ width: "16px", height: "16px" }} />
                <span style={{ fontSize: "10px", fontWeight: "bold" }}>
                  {receiptUrl ? "Receipt ✓" : "Scan Bill"}
                </span>
              </button>
            </div>

            <div className="col-4">
              {type === "EXPENSE" ? (
                <button
                  type="button"
                  onClick={() => setShowSplitSection(!showSplitSection)}
                  className={cn(
                    "btn btn-sm w-100 py-1.5 px-1 rounded-btn d-flex flex-column align-items-center justify-content-center gap-1 transition",
                    showSplitSection || splitData.isSplit
                      ? "btn-success text-white shadow-sm"
                      : "btn-light border text-dark"
                  )}
                >
                  <Users style={{ width: "16px", height: "16px" }} />
                  <span style={{ fontSize: "10px", fontWeight: "bold" }}>
                    {splitData.isSplit ? "Split ✓" : "Split Bill"}
                  </span>
                </button>
              ) : (
                <div 
                  className="w-100 py-1.5 px-1 rounded-btn d-flex flex-column align-items-center justify-content-center gap-1 bg-light text-secondary border opacity-50"
                  style={{ cursor: "not-allowed" }}
                >
                  <Users style={{ width: "16px", height: "16px" }} />
                  <span style={{ fontSize: "10px" }}>Expense Only</span>
                </div>
              )}
            </div>

            <div className="col-4">
              <button
                type="button"
                onClick={() => setShowNotesSection(!showNotesSection)}
                className={cn(
                  "btn btn-sm w-100 py-1.5 px-1 rounded-btn d-flex flex-column align-items-center justify-content-center gap-1 transition",
                  showNotesSection || description || notes
                    ? "btn-dark text-white shadow-sm"
                    : "btn-light border text-dark"
                )}
              >
                <FileText style={{ width: "16px", height: "16px" }} />
                <span style={{ fontSize: "10px", fontWeight: "bold" }}>
                  {description || notes ? "Notes ✓" : "Notes"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 1: Receipt Uploader */}
        {(showReceiptSection || receiptUrl) && (
          <div className="p-3 bg-light border rounded-card d-flex flex-column gap-2">
            <div className="d-flex align-items-center justify-content-between">
              <span className="small fw-bold text-dark d-flex align-items-center gap-1.5">
                <Receipt style={{ width: "14px", height: "14px" }} className="text-primary" />
                <span>Attach Bill or Receipt (Camera / OCR)</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowReceiptSection(false);
                  if (!receiptUrl) setReceiptUrl(null);
                }}
                className="btn btn-sm btn-link text-secondary p-0 small text-decoration-none"
                style={{ fontSize: "11px" }}
              >
                Hide
              </button>
            </div>
            <ReceiptUploader
              receiptUrl={receiptUrl}
              onReceiptChange={setReceiptUrl}
              onOcrExtracted={handleOcrExtracted}
            />
          </div>
        )}

        {/* Section 2: Split with Family */}
        {type === "EXPENSE" && (showSplitSection || splitData.isSplit) && (
          <div className="p-3 bg-success-subtle border border-success-subtle rounded-card d-flex flex-column gap-2">
            <div className="d-flex align-items-center justify-content-between">
              <span className="small fw-bold text-success-emphasis d-flex align-items-center gap-1.5">
                <Users style={{ width: "14px", height: "14px" }} />
                <span>Split Expense Among Members</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSplitSection(false)}
                className="btn btn-sm btn-link text-success-emphasis p-0 small text-decoration-none"
                style={{ fontSize: "11px" }}
              >
                Hide
              </button>
            </div>
            <SplitExpenseForm
              totalAmount={Number(amount) || 0}
              onSplitChange={setSplitData}
            />
          </div>
        )}

        {/* Section 3: Description & Notes */}
        {(showNotesSection || description || notes) && (
          <div className="p-3 bg-light border rounded-card d-flex flex-column gap-2">
            <div className="d-flex align-items-center justify-content-between">
              <span className="small fw-bold text-dark d-flex align-items-center gap-1.5">
                <FileText style={{ width: "14px", height: "14px" }} className="text-secondary" />
                <span>Description &amp; Notes</span>
              </span>
              <button
                type="button"
                onClick={() => setShowNotesSection(false)}
                className="btn btn-sm btn-link text-secondary p-0 small text-decoration-none"
                style={{ fontSize: "11px" }}
              >
                Hide
              </button>
            </div>
            <div>
              <label className="form-label small fw-semibold text-secondary mb-1">
                Merchant / Store / Reference
              </label>
              <input
                type="text"
                placeholder={
                  type === "TRANSFER"
                    ? "e.g. ATM withdrawal, Card settlement"
                    : "e.g. Blinkit, Fuel, Hospital, Restaurant"
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-control form-control-sm rounded-input py-1.5 px-3 small border bg-white"
              />
            </div>
            <div>
              <label className="form-label small fw-semibold text-secondary mb-1">
                Additional Notes
              </label>
              <textarea
                rows={2}
                placeholder="Additional notes for family records..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-control form-control-sm rounded-input p-2 small border bg-white"
                style={{ resize: "none" }}
              />
            </div>
          </div>
        )}

        {/* Footer Buttons */}
        <div 
          className="position-sticky bottom-0 bg-surface border-top pt-2.5 pb-2 mt-auto d-flex align-items-center gap-2"
          style={{ zIndex: 20, paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 12px))" }}
        >
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
            className="flex-fill small fw-bold shadow-sm"
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
              className="small px-3 text-nowrap fw-semibold"
              title="Save transaction and add another"
            >
              + Another
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
