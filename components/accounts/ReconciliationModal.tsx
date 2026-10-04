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
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Tracked vs Actual Comparison */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-card bg-slate-50 border border-border">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              App Tracked Balance
            </span>
            <div className="text-lg font-bold font-amount text-slate-900 mt-0.5">
              {formatCurrency(currentBalance)}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Difference
            </span>
            <div
              className={cn(
                "text-lg font-bold font-amount mt-0.5",
                isBalanced
                  ? "text-emerald-600"
                  : diff > 0
                  ? "text-emerald-600"
                  : "text-expense"
              )}
            >
              {isBalanced ? "Balanced ✓" : `${diff > 0 ? "+" : ""}${formatCurrency(diff)}`}
            </div>
          </div>
        </div>

        {/* Input Actual Balance */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Actual Balance from Bank Statement / Cash (₹) *
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
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
              className="w-full h-11 pl-8 pr-3 rounded-input border border-border text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Enter the exact balance currently shown in your bank mobile app or physical wallet.
          </p>
          {error && <p className="text-xs text-expense font-semibold mt-1">{error}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Adjustment Reason / Notes (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Bank SMS charge, interest credit, cash rounding"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-9 px-3 rounded-input border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="flex-1 font-bold text-xs"
          >
            <Sliders className="w-3.5 h-3.5 mr-1" />
            Adjust & Reconcile
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            disabled={isSubmitting}
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
