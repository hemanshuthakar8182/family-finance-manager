"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/utils/formatters";
import {
  Plus,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  Archive,
  Sliders,
  Pencil,
} from "lucide-react";
import { ReconciliationModal } from "@/components/accounts/ReconciliationModal";

const ACCOUNT_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  CASH: { label: "Cash", icon: Banknote, color: "text-amber-700", bg: "bg-amber-50" },
  BANK: { label: "Bank Account", icon: CreditCard, color: "text-blue-700", bg: "bg-blue-50" },
  UPI: { label: "UPI / Wallet", icon: Smartphone, color: "text-violet-700", bg: "bg-violet-50" },
  CREDIT_CARD: { label: "Credit Card", icon: CreditCard, color: "text-red-700", bg: "bg-red-50" },
  WALLET: { label: "Digital Wallet", icon: Wallet, color: "text-teal-700", bg: "bg-teal-50" },
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Accounts & Wallets
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Manage family bank accounts, UPI wallets and cash
          </p>
        </div>
        <Button size="md" onClick={() => setIsAddOpen(true)} className="w-full sm:w-auto justify-center font-semibold shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Account
        </Button>
      </div>

      {/* Total Balance Banner */}
      <div className="p-5 rounded-card bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md">
        <p className="text-xs font-semibold opacity-80">Total Family Balance</p>
        <div className="text-3xl font-bold font-amount mt-1">
          {formatCurrency(totalBalance)}
        </div>
        <p className="text-[11px] opacity-70 mt-0.5">
          Across {accounts.length} active account{accounts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Account Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-card" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="py-12 text-center bg-surface rounded-card border border-border shadow-soft">
          <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No accounts yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Add your first bank account or wallet to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((acc) => {
            const config = ACCOUNT_TYPE_CONFIG[acc.type] || ACCOUNT_TYPE_CONFIG.BANK;
            const Icon = config.icon;
            return (
              <div
                key={acc.id}
                className="p-4 rounded-card border border-border bg-surface shadow-soft hover:shadow-card transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-btn flex items-center justify-center ${config.bg} ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditAccount(acc);
                        setEditFormData({ name: acc.name, type: acc.type });
                      }}
                      title="Edit Account Details"
                      className="text-slate-400 hover:text-primary p-1.5 rounded-btn hover:bg-slate-100 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setReconcileAccount(acc)}
                      title="Reconcile balance with statement"
                      className="text-slate-400 hover:text-primary p-1.5 rounded-btn hover:bg-primary/10 transition-colors"
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleArchive(acc.id, acc.name)}
                      title="Archive Account"
                      className="text-slate-400 hover:text-slate-700 p-1.5 rounded-btn hover:bg-slate-100 transition-colors"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm truncate">{acc.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{config.label}</p>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-xl font-bold font-amount text-slate-900">
                    {formatCurrency(acc.currentBalance)}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {acc._count?.transactions || 0} transactions •{" "}
                    Opening: {formatCurrency(acc.openingBalance)}
                  </p>
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
        <form onSubmit={handleAdd} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Name *
            </label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. HDFC Savings, SBI, GPay UPI"
              className="w-full h-11 px-3 rounded-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(ACCOUNT_TYPE_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: key })}
                    className={`flex flex-col items-center p-2.5 rounded-btn border text-center transition-all ${
                      formData.type === key
                        ? "bg-primary border-primary text-primary-foreground shadow-xs"
                        : "bg-surface border-border text-slate-700 hover:bg-surface-muted"
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-[11px] font-semibold">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Opening Balance (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
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
                className="w-full h-11 pl-8 pr-3 rounded-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Enter your current balance to start tracking from today.
            </p>
          </div>

          <div className="sticky bottom-0 -mx-4 -mb-3.5 sm:-mx-6 sm:-mb-4 px-4 sm:px-6 py-3 bg-surface/95 backdrop-blur-md border-t border-border mt-auto flex gap-2 z-20">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={submitting}
              className="flex-1 font-bold"
            >
              Add Account
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
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
        <form onSubmit={handleEdit} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Name *
            </label>
            <input
              required
              value={editFormData.name}
              onChange={(e) =>
                setEditFormData({ ...editFormData, name: e.target.value })
              }
              placeholder="e.g. HDFC Salary, Emergency Cash"
              className="w-full h-11 px-3 rounded-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ACCOUNT_TYPE_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isSelected = editFormData.type === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setEditFormData({ ...editFormData, type: key })
                    }
                    className={`flex items-center gap-2.5 p-3 rounded-card border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-primary"
                        : "border-border hover:border-slate-300 text-slate-700"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-btn flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sticky bottom-0 -mx-4 -mb-3.5 sm:-mx-6 sm:-mb-4 px-4 sm:px-6 py-3 bg-surface/95 backdrop-blur-md border-t border-border mt-auto flex gap-2 z-20">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={editSubmitting}
              className="flex-1 font-bold shadow-xs"
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setEditAccount(null)}
            >
              Cancel
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
