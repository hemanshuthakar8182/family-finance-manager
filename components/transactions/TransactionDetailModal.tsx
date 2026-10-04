"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatTransactionDate } from "@/lib/utils/formatters";
import { Trash2, Edit3, Calendar, Clock, User, CreditCard, ArrowRightLeft, Receipt, ExternalLink, FileText } from "lucide-react";
import { useSession } from "next-auth/react";
import { TransactionEditModal } from "./TransactionEditModal";

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
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!transaction) return null;

  const isIncome = transaction.type === "INCOME";
  const isTransfer = transaction.type === "TRANSFER";
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

      const deletedId = transaction.id;
      showToast({
        type: "success",
        title: "Transaction Deleted",
        message: "The balance has been adjusted automatically.",
        actionText: "Undo",
        onAction: async () => {
          try {
            const restoreRes = await fetch(`/api/transactions/${deletedId}/restore`, {
              method: "POST",
            });
            if (restoreRes.ok) {
              showToast({ type: "success", title: "Transaction Restored" });
              onUpdated();
            }
          } catch (e) {
            console.error(e);
          }
        },
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
              style={{
                backgroundColor: isTransfer
                  ? "#0284C7"
                  : transaction.category?.color || "#0F766E",
              }}
            >
              {isTransfer ? (
                <ArrowRightLeft className="w-5 h-5" />
              ) : (
                <CategoryIcon name={transaction.category?.icon || "Tag"} size={22} />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isTransfer
                  ? `${transaction.account?.name || "Account"} → ${transaction.toAccount?.name || "Account"}`
                  : transaction.category?.name || "Transaction"}
              </h3>
              <p className="text-xs text-slate-500">
                {transaction.description || (isTransfer ? "Account transfer" : "No description provided")}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div
              className={`text-xl sm:text-2xl font-bold font-amount tracking-tight ${
                isIncome ? "text-income" : isTransfer ? "text-blue-600" : "text-slate-900"
              }`}
            >
              {isIncome ? "+" : isTransfer ? "⇄ " : "-"} {formatCurrency(transaction.amount)}
            </div>
            <Badge variant={isIncome ? "income" : isTransfer ? "info" : "expense"}>
              {isIncome ? "Income" : isTransfer ? "Transfer" : "Expense"}
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

          {isTransfer ? (
            <>
              <div className="p-3 rounded-card border border-border bg-surface">
                <span className="text-slate-400 font-semibold flex items-center gap-1 mb-1">
                  <CreditCard className="w-3.5 h-3.5" /> From (Source)
                </span>
                <span className="font-semibold text-slate-800">
                  {transaction.account?.name || "None"}
                </span>
              </div>
              <div className="p-3 rounded-card border border-border bg-surface">
                <span className="text-slate-400 font-semibold flex items-center gap-1 mb-1">
                  <CreditCard className="w-3.5 h-3.5" /> To (Destination)
                </span>
                <span className="font-semibold text-slate-800">
                  {transaction.toAccount?.name || "None"}
                </span>
              </div>
            </>
          ) : (
            <div className="p-3 rounded-card border border-border bg-surface col-span-2">
              <span className="text-slate-400 font-semibold flex items-center gap-1 mb-1">
                <CreditCard className="w-3.5 h-3.5" /> Account / Wallet
              </span>
              <span className="font-semibold text-slate-800">
                {transaction.account?.name || "None (Unassigned)"}
              </span>
            </div>
          )}

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

          {transaction.receiptUrl && (
            <div className="p-3 rounded-card border border-border bg-surface col-span-2 space-y-2">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-primary" /> Attached Bill / Receipt
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={transaction.receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block overflow-hidden rounded-lg border border-slate-200"
                >
                  {transaction.receiptUrl.toLowerCase().endsWith(".pdf") ? (
                    <div className="w-16 h-16 bg-red-100 text-red-600 flex items-center justify-center rounded-lg">
                      <FileText className="w-8 h-8" />
                    </div>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={transaction.receiptUrl}
                      alt="Receipt thumbnail"
                      className="w-16 h-16 object-cover group-hover:scale-105 transition-transform rounded-lg"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                    View
                  </div>
                </a>
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">Verified Receipt Document</p>
                  <a
                    href={transaction.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline font-semibold text-xs inline-flex items-center gap-1 mt-1"
                  >
                    Open Document <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
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
                  onClick={() => setIsEditOpen(true)}
                  className="flex-1 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50"
                >
                  <Edit3 className="w-3.5 h-3.5 text-primary" />
                  <span>Edit</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setConfirmDelete(true)}
                  className="flex-1 text-expense border-red-200 hover:bg-red-50 font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={onClose}
                  className="text-xs font-semibold px-4"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <TransactionEditModal
        transaction={transaction}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => {
          onUpdated();
          onClose();
        }}
      />
    </Modal>
  );
}
