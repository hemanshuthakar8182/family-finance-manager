"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils/formatters";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import {
  Plus,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  Building2,
  Archive,
  Sliders,
  Pencil,
} from "lucide-react";
import { ReconciliationModal } from "@/components/accounts/ReconciliationModal";
import { cn } from "@/lib/utils/cn";

const ACCOUNT_TYPE_CONFIG: Record<string, { label: string; icon: any; badgeClass: string }> = {
  CASH: { label: "Cash Wallet", icon: Banknote, badgeClass: "bg-warning-soft text-warning" },
  BANK: { label: "Bank Account", icon: Building2, badgeClass: "bg-primary-soft text-primary" },
  UPI: { label: "UPI Digital", icon: Smartphone, badgeClass: "bg-info-soft text-info" },
  CREDIT_CARD: { label: "Credit Card", icon: CreditCard, badgeClass: "bg-danger-soft text-danger" },
  WALLET: { label: "Digital Wallet", icon: Wallet, badgeClass: "bg-success-soft text-success" },
};

const ACCOUNT_AMBIENT_BG: Record<string, string> = {
  CASH: "linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, var(--surface) 100%)",
  BANK: "linear-gradient(180deg, rgba(79, 70, 229, 0.05) 0%, var(--surface) 100%)",
  UPI: "linear-gradient(180deg, rgba(6, 182, 212, 0.05) 0%, var(--surface) 100%)",
  CREDIT_CARD: "linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, var(--surface) 100%)",
  WALLET: "linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, var(--surface) 100%)",
};

export default function AccountsPage() {
  const { showToast } = useToast();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    type: "BANK",
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [reconcileAccount, setReconcileAccount] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "BANK",
    openingBalance: "",
  });

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccount || !editFormData.name.trim()) {
      showToast({ type: "error", title: "Account name is required" });
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/accounts/${editAccount.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update account");

      showToast({ type: "success", title: "Account Updated", message: editFormData.name });
      setEditAccount(null);
      fetchAccounts();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    } finally {
      setEditSubmitting(false);
    }
  };

  const fetchAccounts = () => {
    setIsLoading(true);
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAccounts(data);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast({ type: "error", title: "Account name is required" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          openingBalance: Number(formData.openingBalance) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");

      showToast({ type: "success", title: "Account Created", message: formData.name });
      setFormData({ name: "", type: "BANK", openingBalance: "" });
      setIsAddOpen(false);
      fetchAccounts();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Archive "${name}"? It won't appear in new transactions.`)) return;

    try {
      const res = await fetch(`/api/accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive" }),
      });
      if (!res.ok) throw new Error("Failed to archive account");

      showToast({ type: "success", title: "Account Archived", message: name });
      fetchAccounts();
    } catch (err: any) {
      showToast({ type: "error", title: "Error", message: err.message });
    }
  };

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.currentBalance || 0),
    0
  );

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">
            Accounts & Wallets
          </h1>
          <p className="small text-secondary mb-0">
            Manage family bank accounts, UPI wallets and cash
          </p>
        </div>
        <Button size="md" onClick={() => setIsAddOpen(true)} className="fw-semibold shadow-sm gap-2">
          <Plus style={{ width: "16px", height: "16px" }} />
          <span>Add Account</span>
        </Button>
      </div>

      {/* Total Balance Banner */}
      <div
        className="card rounded-card p-4 text-white shadow-card border-0 position-relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 60%, var(--accent) 100%)" }}
      >
        <p className="small fw-semibold opacity-85 mb-1 text-uppercase" style={{ fontSize: "11px", letterSpacing: "0.05em" }}>
          Total Family Balance
        </p>
        <div className="my-1">
          <CurrencyDisplay amount={totalBalance} size="2xl" className="text-white" />
        </div>
        <p className="small opacity-75 mb-0" style={{ fontSize: "11px" }}>
          Across {accounts.length} active account{accounts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Account Grid */}
      {isLoading ? (
        <div className="row g-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-4">
              <div className="card rounded-card border p-4 bg-surface shadow-xs" style={{ height: "130px" }}>
                <div className="skeleton-shimmer mb-2" style={{ width: "120px", height: "16px" }} />
                <div className="skeleton-shimmer" style={{ width: "160px", height: "24px" }} />
              </div>
            </div>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="card rounded-card border p-5 text-center bg-surface shadow-sm">
          <CreditCard className="text-secondary mx-auto mb-3" style={{ width: "40px", height: "40px" }} />
          <h3 className="h6 fw-bold text-dark mb-1">No accounts yet</h3>
          <p className="small text-secondary mb-0">
            Add your first bank account or wallet to get started.
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {accounts.map((acc) => {
            const config = ACCOUNT_TYPE_CONFIG[acc.type] || ACCOUNT_TYPE_CONFIG.BANK;
            const Icon = config.icon;
            const displayName = acc.name.toLowerCase() === "case" ? "Cash" : acc.name;
            const isCreditCard = acc.type === "CREDIT_CARD";

            const bal = Number(acc.currentBalance || 0);
            const isOverdrawn = !isCreditCard && bal < 0;
            const balanceLabel = isCreditCard
              ? "Total Due"
              : isOverdrawn
              ? "Current Deficit"
              : "Available Balance";

            const ambientBg = ACCOUNT_AMBIENT_BG[acc.type] || "var(--surface)";
            const colSpanClass =
              accounts.length === 1
                ? "col-12"
                : accounts.length === 2
                ? "col-12 col-sm-6"
                : accounts.length === 3
                ? "col-12 col-sm-6 col-md-4"
                : "col-12 col-sm-6 col-lg-4";

            return (
              <div key={acc.id} className={colSpanClass}>
                <div 
                  className="card-elevated p-3 h-100 hover-lift d-flex flex-column justify-content-between border"
                  style={{ background: ambientBg }}
                >
                  <div>
                    {/* Top Row: Icon + Type Pill + Overdraft Tag + Action Buttons */}
                    <div className="d-flex align-items-center justify-content-between mb-2.5">
                      <div className="d-flex align-items-center gap-1.5 flex-wrap">
                        <div
                          className={cn("rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs", config.badgeClass)}
                          style={{ width: "34px", height: "34px" }}
                        >
                          <Icon style={{ width: "17px", height: "17px" }} />
                        </div>
                        <span className="badge rounded-pill bg-light border text-secondary fw-semibold px-2 py-0.5" style={{ fontSize: "10px" }}>
                          {config.label}
                        </span>
                        {isOverdrawn && (
                          <span className="badge rounded-pill bg-danger-soft text-danger fw-semibold px-2 py-0.5" style={{ fontSize: "10px" }}>
                            Overdrawn
                          </span>
                        )}
                      </div>

                      <div className="d-flex align-items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditAccount(acc);
                            setEditFormData({ name: displayName, type: acc.type });
                          }}
                          title="Edit Account Details"
                          className="btn btn-sm btn-link text-secondary p-1 text-decoration-none"
                        >
                          <Pencil style={{ width: "14px", height: "14px" }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setReconcileAccount(acc)}
                          title="Reconcile balance with statement"
                          className="btn btn-sm btn-link text-secondary p-1 text-decoration-none"
                        >
                          <Sliders style={{ width: "14px", height: "14px" }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleArchive(acc.id, displayName)}
                          title="Archive Account"
                          className="btn btn-sm btn-link text-secondary p-1 text-decoration-none"
                        >
                          <Archive style={{ width: "14px", height: "14px" }} />
                        </button>
                      </div>
                    </div>

                    <h3 className="h6 fw-bold text-foreground text-truncate mb-0" style={{ fontSize: "14px" }}>
                      {displayName}
                    </h3>
                    <p className={cn("small mb-0", isOverdrawn ? "text-danger fw-medium" : "text-secondary")} style={{ fontSize: "11px" }}>
                      {isOverdrawn ? "Overdrawn Reserve" : isCreditCard ? "Credit Facility" : "Liquid Asset Account"}
                    </p>
                  </div>

                  {/* Bottom Row: Balance & Meta */}
                  <div className="mt-2.5 pt-2 border-top border-light-subtle">
                    <span 
                      className={cn("small fw-semibold text-uppercase d-block", isOverdrawn ? "text-danger" : "text-secondary")} 
                      style={{ fontSize: "10px", letterSpacing: "0.04em" }}
                    >
                      {balanceLabel}
                    </span>
                    <div className="mt-0.5">
                      <CurrencyDisplay
                        amount={acc.currentBalance}
                        size="lg"
                        type={isCreditCard || isOverdrawn ? "EXPENSE" : "DEFAULT"}
                      />
                    </div>
                    <p className="small text-secondary mb-0 mt-1" style={{ fontSize: "11px" }}>
                      {acc._count?.transactions || 0} transactions &bull; Opening: {formatCurrency(acc.openingBalance)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Account Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Account"
        description="Connect a bank account, UPI wallet or cash record"
      >
        <form onSubmit={handleAdd} className="d-flex flex-column gap-3 pt-2">
          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              Account Name *
            </label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. HDFC Savings, SBI, GPay UPI"
              className="form-control rounded-input py-2"
            />
          </div>

          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              Account Type
            </label>
            <div className="row g-2">
              {Object.entries(ACCOUNT_TYPE_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isSelected = formData.type === key;
                return (
                  <div key={key} className="col-6 col-sm-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: key })}
                      className={`btn btn-sm w-100 p-2.5 rounded-btn border text-center transition d-flex flex-column align-items-center justify-content-center ${
                        isSelected
                          ? "btn-primary text-white shadow-sm"
                          : "btn-light border text-dark"
                      }`}
                    >
                      <Icon style={{ width: "20px", height: "20px" }} className="mb-1" />
                      <span className="small fw-semibold">{cfg.label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              Opening Balance (₹)
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light fw-bold text-secondary">
                ₹
              </span>
              <input
                type="number"
                step="any"
                value={formData.openingBalance}
                onChange={(e) =>
                  setFormData({ ...formData, openingBalance: e.target.value })
                }
                placeholder="0"
                className="form-control rounded-end-2 py-2 fw-semibold"
              />
            </div>
            <p className="small text-secondary mt-1 mb-0" style={{ fontSize: "11px" }}>
              Enter your current balance to start tracking from today.
            </p>
          </div>

          <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top mt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={submitting}
              className="fw-bold px-4"
            >
              Add Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Account Modal */}
      <Modal
        isOpen={Boolean(editAccount)}
        onClose={() => setEditAccount(null)}
        title="Edit Account"
        description="Update account name and category type"
      >
        <form onSubmit={handleEdit} className="d-flex flex-column gap-3 pt-2">
          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              Account Name *
            </label>
            <input
              required
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData({ ...editFormData, name: e.target.value })
              }
              placeholder="e.g. HDFC Salary, Emergency Cash"
              className="form-control rounded-input py-2"
            />
          </div>

          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              Account Type *
            </label>
            <div className="row g-2">
              {Object.entries(ACCOUNT_TYPE_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isSelected = editFormData.type === key;
                return (
                  <div key={key} className="col-6">
                    <button
                      type="button"
                      onClick={() =>
                        setEditFormData({ ...editFormData, type: key })
                      }
                      className={`btn btn-sm w-100 p-2.5 rounded-btn border text-start transition d-flex align-items-center gap-2 ${
                        isSelected
                          ? "btn-primary text-white shadow-sm"
                          : "btn-light border text-dark"
                      }`}
                    >
                      <Icon style={{ width: "16px", height: "16px" }} />
                      <span className="small fw-semibold">{cfg.label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top mt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setEditAccount(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={editSubmitting}
              className="fw-bold px-4 shadow-sm"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reconciliation Modal */}
      <ReconciliationModal
        account={reconcileAccount}
        isOpen={!!reconcileAccount}
        onClose={() => setReconcileAccount(null)}
        onSuccess={() => fetchAccounts()}
      />
    </div>
  );
}

