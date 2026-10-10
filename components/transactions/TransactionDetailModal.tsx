"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatTransactionDate } from "@/lib/utils/formatters";
import {
  Calendar,
  CreditCard,
  User,
  ArrowRightLeft,
  Edit3,
  Trash2,
  FileText,
  AlertTriangle,
  Receipt,
  ExternalLink,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { TransactionEditModal } from "@/components/transactions/TransactionEditModal";

interface TransactionDetailModalProps {
  transaction: any | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
  onUpdated: () => void;
}

export function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
  onDeleted,
  onUpdated,
}: TransactionDetailModalProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!transaction) return null;

  const isIncome = transaction.type === "INCOME";
  const isTransfer = transaction.type === "TRANSFER";
  const isExpense = transaction.type === "EXPENSE";

  const user = session?.user as any;
  const canModify =
    user?.role === "ADMIN" ||
    transaction.member?.userId === user?.id;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete transaction");
      }

      showToast({
        type: "info",
        title: "Transaction Deleted",
        message: "The transaction has been removed and account balance restored.",
      });

      onDeleted();
      onClose();
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Delete Failed",
        message: err.message || "Could not delete transaction",
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen && !isEditOpen}
        onClose={onClose}
        title="Transaction Details"
        description="View financial record information"
        maxWidth="md"
      >
        <div className="d-flex flex-column gap-3 pt-1">
          {/* Top Header Card */}
          <div className="p-3 rounded-card border bg-light d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3 overflow-hidden">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm flex-shrink-0"
                style={{
                  width: "44px",
                  height: "44px",
                  backgroundColor: isTransfer
                    ? "#0284C7"
                    : transaction.category?.color || "#0F766E",
                }}
              >
                {isTransfer ? (
                  <ArrowRightLeft style={{ width: "20px", height: "20px" }} />
                ) : (
                  <CategoryIcon name={transaction.category?.icon || "Tag"} size={20} />
                )}
              </div>
              <div className="overflow-hidden">
                <h3 className="h6 fw-bold text-dark text-truncate mb-0">
                  {isTransfer
                    ? `${transaction.account?.name || "Account"} → ${transaction.toAccount?.name || "Account"}`
                    : transaction.category?.name || "Transaction"}
                </h3>
                <p className="small text-secondary text-truncate mb-0 mt-1" style={{ fontSize: "11px" }}>
                  {transaction.description || (isTransfer ? "Account transfer" : "No description provided")}
                </p>
              </div>
            </div>

            <div className="d-flex align-items-center flex-sm-column align-items-sm-end justify-content-between gap-1 flex-shrink-0">
              <div
                className={`fs-5 fw-bold font-amount ${
                  isIncome ? "text-income" : isTransfer ? "text-primary" : "text-dark"
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
          <div className="row g-2 small">
            <div className="col-6">
              <div className="p-2.5 p-sm-3 rounded-card border bg-surface h-100">
                <span className="text-secondary fw-semibold d-flex align-items-center gap-1 mb-1" style={{ fontSize: "11px" }}>
                  <Calendar style={{ width: "13px", height: "13px" }} /> Date & Time
                </span>
                <span className="fw-semibold text-dark">
                  {formatTransactionDate(transaction.date)}
                </span>
              </div>
            </div>

            <div className="col-6">
              <div className="p-2.5 p-sm-3 rounded-card border bg-surface h-100">
                <span className="text-secondary fw-semibold d-flex align-items-center gap-1 mb-1" style={{ fontSize: "11px" }}>
                  <User style={{ width: "13px", height: "13px" }} /> Added By
                </span>
                <span className="fw-semibold text-dark text-truncate d-block">
                  {transaction.member?.user?.name || "Family Member"}
                </span>
              </div>
            </div>

            {isTransfer ? (
              <>
                <div className="col-6">
                  <div className="p-2.5 p-sm-3 rounded-card border bg-surface h-100">
                    <span className="text-secondary fw-semibold d-flex align-items-center gap-1 mb-1" style={{ fontSize: "11px" }}>
                      <CreditCard style={{ width: "13px", height: "13px" }} /> From (Source)
                    </span>
                    <span className="fw-semibold text-dark">
                      {transaction.account?.name || "None"}
                    </span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2.5 p-sm-3 rounded-card border bg-surface h-100">
                    <span className="text-secondary fw-semibold d-flex align-items-center gap-1 mb-1" style={{ fontSize: "11px" }}>
                      <CreditCard style={{ width: "13px", height: "13px" }} /> To (Destination)
                    </span>
                    <span className="fw-semibold text-dark">
                      {transaction.toAccount?.name || "None"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-12">
                <div className="p-2.5 p-sm-3 rounded-card border bg-surface">
                  <span className="text-secondary fw-semibold d-flex align-items-center gap-1 mb-1" style={{ fontSize: "11px" }}>
                    <CreditCard style={{ width: "13px", height: "13px" }} /> Account / Wallet
                  </span>
                  <span className="fw-semibold text-dark">
                    {transaction.account?.name || "None (Unassigned)"}
                  </span>
                </div>
              </div>
            )}

            {transaction.notes && (
              <div className="col-12">
                <div className="p-2.5 p-sm-3 rounded-card border bg-surface">
                  <span className="text-secondary fw-semibold d-block mb-1" style={{ fontSize: "11px" }}>
                    Notes
                  </span>
                  <p className="text-dark mb-0" style={{ whiteSpace: "pre-wrap" }}>
                    {transaction.notes}
                  </p>
                </div>
              </div>
            )}

            {transaction.receiptUrl && (
              <div className="col-12">
                <div className="p-2.5 p-sm-3 rounded-card border bg-surface d-flex flex-column gap-2">
                  <span className="text-secondary fw-semibold d-flex align-items-center gap-1" style={{ fontSize: "11px" }}>
                    <Receipt style={{ width: "13px", height: "13px" }} className="text-primary" /> Attached Bill / Receipt
                  </span>
                  <div className="d-flex align-items-center gap-3">
                    <a
                      href={transaction.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border overflow-hidden d-block position-relative"
                    >
                      {transaction.receiptUrl.toLowerCase().endsWith(".pdf") ? (
                        <div className="bg-danger-subtle text-danger d-flex align-items-center justify-content-center rounded" style={{ width: "54px", height: "54px" }}>
                          <FileText style={{ width: "24px", height: "24px" }} />
                        </div>
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={transaction.receiptUrl}
                          alt="Receipt thumbnail"
                          className="rounded object-fit-cover"
                          style={{ width: "54px", height: "54px" }}
                        />
                      )}
                    </a>
                    <div>
                      <p className="fw-semibold text-dark small mb-0">Verified Receipt Document</p>
                      <a
                        href={transaction.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary fw-semibold small text-decoration-none d-inline-flex align-items-center gap-1 mt-1"
                      >
                        Open Document <ExternalLink style={{ width: "12px", height: "12px" }} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions Footer */}
          {canModify && (
            <div className="position-sticky bottom-0 bg-surface border-top pt-3 pb-2 mt-auto" style={{ zIndex: 10 }}>
              {confirmDelete ? (
                <div className="p-3 rounded-card bg-danger-subtle border border-danger-subtle d-flex flex-column gap-2">
                  <div className="d-flex align-items-center gap-2 text-danger">
                    <AlertTriangle style={{ width: "18px", height: "18px" }} />
                    <span className="small fw-bold">Are you sure you want to delete?</span>
                  </div>
                  <p className="text-secondary small mb-1" style={{ fontSize: "11px" }}>
                    This action will reverse the account balance adjustment.
                  </p>
                  <div className="d-flex gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      isLoading={isDeleting}
                      onClick={handleDelete}
                      className="flex-fill"
                    >
                      Yes, Delete Record
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setConfirmDelete(false)}
                      className="small"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setIsEditOpen(true)}
                    className="flex-fill small fw-semibold gap-1"
                  >
                    <Edit3 style={{ width: "14px", height: "14px" }} className="text-primary" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setConfirmDelete(true)}
                    className="flex-fill text-danger border-danger-subtle small fw-semibold gap-1"
                  >
                    <Trash2 style={{ width: "14px", height: "14px" }} />
                    <span>Delete</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={onClose}
                    className="small fw-semibold px-4"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* Edit Modal rendered separately - zero double backdrop / scroll locks */}
      <TransactionEditModal
        transaction={transaction}
        isOpen={isOpen && isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => {
          setIsEditOpen(false);
          onUpdated();
          onClose();
        }}
      />
    </>
  );
}
