"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatTransactionDate } from "@/lib/utils/formatters";
import { Trash2, Edit3, Calendar, Clock, User, CreditCard } from "lucide-react";
import { useSession } from "next-auth/react";

interface TransactionDetailModalProps {
  transaction: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
  onUpdated,
}: TransactionDetailModalProps) {
  const { data: session } = useSession();
  const currentUser = session?.user as any;
  const { showToast } = useToast();

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!transaction) return null;

  const isIncome = transaction.type === "INCOME";
  const canModify =
    currentUser?.role === "ADMIN" || transaction.memberId === currentUser?.memberId;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete transaction");
      }

      showToast({
        type: "success",
        title: "Transaction Deleted",
        message: "The balance has been adjusted automatically.",
      });

      onUpdated();
      onClose();
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Error",
        message: err.message,
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Details"
      description="View financial record information"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Top Header Card */}
        <div className="p-4 rounded-card border border-border bg-slate-50/75 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ backgroundColor: transaction.category?.color || "#0F766E" }}
            >
              <CategoryIcon name={transaction.category?.icon || "Tag"} size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {transaction.category?.name}
              </h3>
              <p className="text-xs text-slate-500">
                {transaction.description || "No description provided"}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div
              className={`text-xl sm:text-2xl font-bold font-amount tracking-tight ${
                isIncome ? "text-income" : "text-slate-900"
              }`}
            >
              {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
            </div>
            <Badge variant={isIncome ? "income" : "expense"}>
              {isIncome ? "Income" : "Expense"}
            </Badge>
          </div>
        </div>

        {/* Detailed Fields Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-card border border-border bg-surface">
            <span className="text-slate-400 font-semibold flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5" /> Date & Time
            </span>
            <span className="font-semibold text-slate-800">
              {formatTransactionDate(transaction.date)}
            </span>
          </div>

          <div className="p-3 rounded-card border border-border bg-surface">
            <span className="text-slate-400 font-semibold flex items-center gap-1 mb-1">
              <User className="w-3.5 h-3.5" /> Added By
            </span>
            <span className="font-semibold text-slate-800 truncate block">
              {transaction.member?.user?.name || "Family Member"}
            </span>
          </div>

          <div className="p-3 rounded-card border border-border bg-surface col-span-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1 mb-1">
              <CreditCard className="w-3.5 h-3.5" /> Account / Wallet
            </span>
            <span className="font-semibold text-slate-800">
              {transaction.account?.name || "None (Unassigned)"}
            </span>
          </div>

          {transaction.notes && (
            <div className="p-3 rounded-card border border-border bg-surface col-span-2">
              <span className="text-slate-400 font-semibold block mb-1">
                Notes
              </span>
              <p className="text-slate-700 whitespace-pre-wrap">
                {transaction.notes}
              </p>
            </div>
          )}
        </div>

        {/* Actions (Delete confirmation / Buttons) */}
        {canModify && (
          <div className="pt-2 border-t border-slate-100">
            {confirmDelete ? (
              <div className="p-3 rounded-card bg-red-50 border border-red-200 space-y-2">
                <p className="text-xs font-semibold text-red-900">
                  Are you sure you want to delete this transaction? This will revert account balances.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    isLoading={isDeleting}
                    onClick={handleDelete}
                    className="flex-1 font-bold text-xs"
                  >
                    Yes, Delete
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => setConfirmDelete(false)}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setConfirmDelete(true)}
                  className="flex-1 text-expense border-red-200 hover:bg-red-50 font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Transaction</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={onClose}
                  className="text-xs font-semibold"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
