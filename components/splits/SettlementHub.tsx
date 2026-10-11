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
  QrCode,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { UPIPaymentModal } from "@/components/splits/UPIPaymentModal";

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
      <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="small text-secondary fw-medium mb-0">Loading family debts & balances...</p>
      </div>
    );
  }

  const { userBalance, nettedDebts, splits } = data || {
    userBalance: { youOwe: 0, youAreOwed: 0, netBalance: 0 },
    nettedDebts: [],
    splits: [],
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* ── 1. Top KPI Summary ── */}
      <div className="row g-3">
        {/* You are owed */}
        <div className="col-12 col-md-4">
          <div className="card rounded-card border border-success-subtle bg-success-subtle p-3 h-100 shadow-sm">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small fw-bold text-success text-uppercase">
                  YOU ARE OWED
                </span>
                <div className="h3 fw-bold text-success-emphasis mb-0 mt-1">
                  +{formatCurrency(userBalance.youAreOwed)}
                </div>
                <span className="small text-success-emphasis" style={{ fontSize: "11px" }}>
                  from family members
                </span>
              </div>
              <div
                className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "42px", height: "42px" }}
              >
                <CheckCircle2 style={{ width: "22px", height: "22px" }} />
              </div>
            </div>
          </div>
        </div>

        {/* You owe */}
        <div className="col-12 col-md-4">
          <div className="card rounded-card border border-danger-subtle bg-danger-subtle p-3 h-100 shadow-sm">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small fw-bold text-danger text-uppercase">
                  YOU OWE
                </span>
                <div className="h3 fw-bold text-danger-emphasis mb-0 mt-1">
                  -{formatCurrency(userBalance.youOwe)}
                </div>
                <span className="small text-danger-emphasis" style={{ fontSize: "11px" }}>
                  to family members
                </span>
              </div>
              <div
                className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "42px", height: "42px" }}
              >
                <AlertCircle style={{ width: "22px", height: "22px" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Net position */}
        <div className="col-12 col-md-4">
          <div className="card rounded-card border bg-surface p-3 h-100 shadow-sm">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="small fw-bold text-secondary text-uppercase">
                  NET POSITION
                </span>
                <div
                  className={`h3 fw-bold mb-0 mt-1 ${
                    userBalance.netBalance >= 0 ? "text-income" : "text-expense"
                  }`}
                >
                  {userBalance.netBalance >= 0 ? "+" : ""}
                  {formatCurrency(userBalance.netBalance)}
                </div>
                <span className="small text-secondary" style={{ fontSize: "11px" }}>
                  {userBalance.netBalance >= 0 ? "Overall in credit" : "Overall in debit"}
                </span>
              </div>
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: "42px", height: "42px" }}
              >
                <HandCoins style={{ width: "22px", height: "22px" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Who Owes Whom Matrix ── */}
      <div className="card rounded-card border bg-surface p-3 p-sm-4 shadow-sm">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <h3 className="h6 fw-bold text-dark mb-0">
              Outstanding Family Settlements
            </h3>
            <p className="small text-secondary mb-0">
              Pairwise netted balances between all family members
            </p>
          </div>
          <button
            onClick={fetchLedger}
            className="btn btn-sm btn-light border text-secondary"
            title="Refresh balances"
          >
            <RefreshCw style={{ width: "14px", height: "14px" }} />
          </button>
        </div>

        {nettedDebts.length === 0 ? (
          <div className="p-4 text-center bg-light rounded-card border border-dashed">
            <CheckCircle2 className="text-income mx-auto mb-2" style={{ width: "32px", height: "32px" }} />
            <h4 className="h6 fw-bold text-dark mb-1">All Squared Up!</h4>
            <p className="small text-secondary mb-0">
              No outstanding balances or debts between family members.
            </p>
          </div>
        ) : (
          <div className="row g-3">
            {nettedDebts.map((debt, idx) => (
              <div key={idx} className="col-12 col-md-6">
                <div className="card rounded-card border bg-light p-3 d-flex flex-row align-items-center justify-content-between gap-3 shadow-none">
                  <div className="d-flex align-items-center gap-3 overflow-hidden">
                    <div
                      className="rounded-circle bg-secondary bg-opacity-10 text-dark fw-bold d-flex align-items-center justify-content-center flex-shrink-0 small"
                      style={{ width: "36px", height: "36px" }}
                    >
                      {debt.debtor.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="d-flex align-items-center gap-1 small fw-semibold text-dark text-truncate">
                        <span className="fw-bold">{debt.debtor.name}</span>
                        <ArrowRight style={{ width: "12px", height: "12px" }} className="text-secondary flex-shrink-0" />
                        <span className="fw-bold">{debt.creditor.name}</span>
                      </div>
                      <span className="small text-secondary text-truncate d-block" style={{ fontSize: "11px" }}>
                        {debt.debtor.name} owes {debt.creditor.name}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    <span className="fw-bold text-dark small">
                      {formatCurrency(debt.amount)}
                    </span>
                    <button
                      onClick={() => openSettleModal(debt)}
                      className="btn btn-sm btn-primary rounded-btn fw-bold px-2.5 py-1 shadow-sm small d-inline-flex align-items-center gap-1"
                    >
                      <QrCode style={{ width: "13px", height: "13px" }} />
                      <span>Settle / UPI</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. Shared Expenses Ledger ── */}
      <div className="card rounded-card border bg-surface shadow-sm overflow-hidden">
        <div className="p-3 p-sm-4 border-bottom d-flex align-items-center justify-content-between">
          <div>
            <h3 className="h6 fw-bold text-dark mb-0">
              Recent Split Expenses
            </h3>
            <p className="small text-secondary mb-0">
              Audit log of shared household bills and member allocations
            </p>
          </div>
          <span className="badge bg-light text-secondary border small">
            {splits.length} shared bills
          </span>
        </div>

        {splits.length === 0 ? (
          <div className="p-4 text-center small text-secondary">
            No split expenses recorded yet. Check &quot;Split with Family&quot; when adding an expense.
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {splits.map((s) => (
              <div key={s.id} className="list-group-item p-3 p-sm-4 bg-transparent">
                <div className="d-flex align-items-start justify-content-between gap-3 mb-2">
                  <div>
                    <h4 className="small fw-bold text-dark mb-1">
                      {s.description}
                    </h4>
                    <div className="d-flex align-items-center gap-2 small text-secondary flex-wrap" style={{ fontSize: "11px" }}>
                      <span>{new Date(s.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="badge bg-light text-dark border">
                        {s.categoryName}
                      </span>
                      <span>•</span>
                      <span>Paid by <strong>{s.paidBy.name}</strong></span>
                    </div>
                  </div>

                  <span className="fw-bold text-dark small flex-shrink-0">
                    {formatCurrency(s.totalAmount)}
                  </span>
                </div>

                {/* Shares breakdown */}
                <div className="d-flex flex-wrap gap-2 pt-1">
                  {s.shares.map((sh) => (
                    <div
                      key={sh.id}
                      className={`badge rounded-pill d-inline-flex align-items-center gap-1 px-2.5 py-1 border ${
                        sh.isSettled
                          ? "bg-success-subtle text-success border-success-subtle"
                          : "bg-warning-subtle text-warning-emphasis border-warning-subtle"
                      }`}
                      style={{ fontSize: "11px" }}
                    >
                      {sh.isSettled ? (
                        <Check style={{ width: "12px", height: "12px" }} />
                      ) : (
                        <Clock style={{ width: "12px", height: "12px" }} />
                      )}
                      <span>
                        {sh.memberName}: {formatCurrency(sh.amount)}
                      </span>
                      <span className="text-uppercase" style={{ fontSize: "9px", opacity: 0.8 }}>
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

      {/* ── 4. Settle Up with UPI QR & Deep Links ── */}
      {settleTarget && (
        <UPIPaymentModal
          isOpen={true}
          onClose={() => setSettleTarget(null)}
          debt={settleTarget}
          onSuccess={fetchLedger}
        />
      )}
    </div>
  );
}

