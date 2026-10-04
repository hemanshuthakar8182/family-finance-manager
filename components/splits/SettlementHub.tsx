"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HandCoins,
  RefreshCw,
  Clock,
  Check,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

interface DebtorCreditor {
  id: string;
  name: string;
}

interface NettedDebt {
  debtor: DebtorCreditor;
  creditor: DebtorCreditor;
  amount: number;
}

interface SplitItem {
  id: string;
  transactionId: string;
  date: string;
  description: string;
  categoryName: string;
  totalAmount: number;
  paidBy: { id: string; name: string };
  shares: Array<{
    id: string;
    memberId: string;
    memberName: string;
    amount: number;
    isSettled: boolean;
  }>;
  createdAt: string;
}

export function SettlementHub() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    nettedDebts: NettedDebt[];
    userBalance: { youOwe: number; youAreOwed: number; netBalance: number };
    splits: SplitItem[];
  } | null>(null);

  // Settlement modal state
  const [settleTarget, setSettleTarget] = useState<NettedDebt | null>(null);
  const [settleAmount, setSettleAmount] = useState<string>("");
  const [isSettling, setIsSettling] = useState(false);

  const fetchLedger = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/splits");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch split ledger:", err);
      showToast({
        type: "error",
        title: "Load Error",
        message: "Could not load family settlement ledger.",
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  const openSettleModal = (debt: NettedDebt) => {
    setSettleTarget(debt);
    setSettleAmount(debt.amount.toString());
  };

  const handleConfirmSettle = async () => {
    if (!settleTarget) return;

    try {
      setIsSettling(true);
      const res = await fetch("/api/splits/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debtorMemberId: settleTarget.debtor.id,
          creditorMemberId: settleTarget.creditor.id,
          amount: parseFloat(settleAmount) || settleTarget.amount,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to settle debt");
      }

      showToast({
        type: "success",
        title: "✓ Settlement Recorded",
        message: `Settled ${formatCurrency(parseFloat(settleAmount) || settleTarget.amount)} between ${settleTarget.debtor.name} and ${settleTarget.creditor.name}.`,
      });

      setSettleTarget(null);
      fetchLedger();
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Settlement Error",
        message: err.message,
      });
    } finally {
      setIsSettling(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading family debts & balances...</p>
      </div>
    );
  }

  const { userBalance, nettedDebts, splits } = data || {
    userBalance: { youOwe: 0, youAreOwed: 0, netBalance: 0 },
    nettedDebts: [],
    splits: [],
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Top KPI Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* You are owed */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800 tracking-wide">
              YOU ARE OWED
            </span>
            <div className="text-2xl font-bold font-amount text-emerald-950 mt-1">
              +{formatCurrency(userBalance.youAreOwed)}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              from family members
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* You owe */}
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-800 tracking-wide">
              YOU OWE
            </span>
            <div className="text-2xl font-bold font-amount text-rose-950 mt-1">
              -{formatCurrency(userBalance.youOwe)}
            </div>
            <span className="text-[11px] text-rose-700 font-medium">
              to family members
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-100/80 text-rose-700 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Net position */}
        <div className="bg-surface border border-border rounded-card p-4 flex items-center justify-between shadow-card">
          <div>
            <span className="text-xs font-bold text-slate-500 tracking-wide">
              NET POSITION
            </span>
            <div
              className={`text-2xl font-bold font-amount mt-1 ${
                userBalance.netBalance >= 0 ? "text-income" : "text-expense"
              }`}
            >
              {userBalance.netBalance >= 0 ? "+" : ""}
              {formatCurrency(userBalance.netBalance)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {userBalance.netBalance >= 0
                ? "Overall in credit"
                : "Overall in debit"}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <HandCoins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 2. Who Owes Whom Matrix ── */}
      <div className="bg-surface rounded-card border border-border p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Outstanding Family Settlements
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pairwise netted balances between all family members
            </p>
          </div>
          <button
            onClick={fetchLedger}
            className="p-1.5 rounded-lg border border-border text-slate-500 hover:text-slate-800 transition-colors"
            title="Refresh balances"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {nettedDebts.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-card border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-income mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">
              All Squared Up!
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              No outstanding balances or debts between family members.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nettedDebts.map((debt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-card border border-border bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                    {debt.debtor.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <span className="font-bold text-slate-900">{debt.debtor.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-900">{debt.creditor.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {debt.debtor.name} owes {debt.creditor.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold font-amount text-slate-900">
                    {formatCurrency(debt.amount)}
                  </span>
                  <button
                    onClick={() => openSettleModal(debt)}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-btn text-xs font-bold hover:bg-primary-hover transition-colors shadow-2xs"
                  >
                    Settle Up
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Shared Expenses Ledger ── */}
      <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Split Expenses
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit log of shared household bills and member allocations
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {splits.length} shared bills
          </span>
        </div>

        {splits.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No split expenses recorded yet. Check &quot;Split with Family&quot; when adding an expense.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {splits.map((s) => (
              <div key={s.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {s.description}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>{new Date(s.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {s.categoryName}
                      </span>
                      <span>•</span>
                      <span>Paid by <strong>{s.paidBy.name}</strong></span>
                    </div>
                  </div>

                  <span className="text-sm font-bold font-amount text-slate-900">
                    {formatCurrency(s.totalAmount)}
                  </span>
                </div>

                {/* Shares breakdown */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {s.shares.map((sh) => (
                    <div
                      key={sh.id}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        sh.isSettled
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-900 border-amber-200"
                      }`}
                    >
                      {sh.isSettled ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Clock className="w-3 h-3 text-amber-600" />
                      )}
                      <span>
                        {sh.memberName}: {formatCurrency(sh.amount)}
                      </span>
                      <span className="text-[9px] uppercase tracking-wide opacity-75">
                        ({sh.isSettled ? "Settled" : "Pending"})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 4. Settle Up Confirmation Modal ── */}
      {settleTarget && (
        <Modal
          isOpen={true}
          onClose={() => setSettleTarget(null)}
          title="Settle Up Family Balance"
        >
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-slate-50 rounded-card border border-border text-xs text-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">{settleTarget.debtor.name}</span>
                <span className="text-slate-500"> pays </span>
                <span className="font-bold text-slate-900">{settleTarget.creditor.name}</span>
              </div>
              <span className="font-bold text-sm text-slate-900">
                {formatCurrency(settleTarget.amount)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Settlement Amount (₹)
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                max={settleTarget.amount}
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-input border border-border text-sm font-bold focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <p className="text-[11px] text-slate-500">
              Recording this settlement marks pending split shares as settled and aligns the family ledger.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setSettleTarget(null)}
                disabled={isSettling}
                className="px-4 py-2 border border-border rounded-btn text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSettle}
                disabled={isSettling || !settleAmount || parseFloat(settleAmount) <= 0}
                className="px-5 py-2 bg-primary text-primary-foreground rounded-btn text-xs font-bold hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1.5"
              >
                {isSettling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Settling...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Confirm Settlement
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
