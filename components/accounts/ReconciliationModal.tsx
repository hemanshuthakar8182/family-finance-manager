"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils/formatters";
import { Sliders, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ReconciliationModalProps {
  account: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ReconciliationModal({
  account,
  isOpen,
  onClose,
  onSuccess,
}: ReconciliationModalProps) {
  const { showToast } = useToast();

  const [actualBalance, setActualBalance] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!account) return null;

  const currentBalance = Number(account.currentBalance || 0);
  const actualNum = actualBalance !== "" ? Number(actualBalance) : currentBalance;
  const diff = actualNum - currentBalance;
  const isBalanced = Math.abs(diff) < 0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actualBalance === "" || isNaN(Number(actualBalance))) {
      setError("Please enter your actual balance");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/accounts/${account.id}/reconcile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actualBalance: Number(actualBalance),
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reconcile balance");

      showToast({
        type: "success",
        title: "Account Reconciled",
        message: data.message,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to reconcile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reconcile ${account.name}`}
      description="Compare actual bank statement or cash in hand against app records"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="d-flex flex-column gap-3 pt-1">
        {/* Tracked vs Actual Comparison */}
        <div className="row g-2 p-3 rounded-card bg-light border mx-0">
          <div className="col-6">
            <span className="small fw-semibold text-secondary text-uppercase d-block" style={{ fontSize: "11px" }}>
              App Tracked Balance
            </span>
            <div className="h6 fw-bold text-dark mt-1 mb-0">
              {formatCurrency(currentBalance)}
            </div>
          </div>

          <div className="col-6">
            <span className="small fw-semibold text-secondary text-uppercase d-block" style={{ fontSize: "11px" }}>
              Difference
            </span>
            <div
              className={cn(
                "h6 fw-bold mt-1 mb-0",
                isBalanced
                  ? "text-success"
                  : diff > 0
                  ? "text-success"
                  : "text-danger"
              )}
            >
              {isBalanced ? "Balanced ✓" : `${diff > 0 ? "+" : ""}${formatCurrency(diff)}`}
            </div>
          </div>
        </div>

        {/* Input Actual Balance */}
        <div>
          <label className="form-label small fw-semibold text-dark mb-1">
            Actual Balance from Bank Statement / Cash (₹) *
          </label>
          <div className="input-group">
            <span className="input-group-text bg-light fw-bold text-secondary">
              ₹
            </span>
            <input
              type="number"
              step="any"
              required
              autoFocus
              placeholder={String(currentBalance)}
              value={actualBalance}
              onChange={(e) => setActualBalance(e.target.value)}
              className="form-control rounded-end-2 py-2 fw-bold"
            />
          </div>
          <p className="small text-secondary mt-1 mb-0" style={{ fontSize: "11px" }}>
            Enter the exact balance currently shown in your bank mobile app or physical wallet.
          </p>
          {error && <p className="small text-danger fw-semibold mt-1 mb-0">{error}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="form-label small fw-semibold text-dark mb-1">
            Adjustment Reason / Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Bank SMS charge, interest credit, cash rounding"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="form-control form-control-sm rounded-input py-2"
          />
        </div>

        {/* Actions */}
        <div className="d-flex gap-2 pt-3 border-top mt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="flex-grow-1 fw-bold small gap-1"
          >
            <Sliders style={{ width: "14px", height: "14px" }} />
            <span>Adjust & Reconcile</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={isSubmitting}
            onClick={onClose}
            className="small"
          >
            Cancel
          </Button>
        </div>
      </form>

    </Modal>
  );
}
