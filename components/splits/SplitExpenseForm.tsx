"use client";

import React, { useState, useEffect } from "react";
import { Users, Divide, Sliders, Check } from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";

export interface SplitMemberShare {
  memberId: string;
  name: string;
  amount: number;
  included: boolean;
}

interface SplitExpenseFormProps {
  totalAmount: number;
  onSplitChange: (data: {
    isSplit: boolean;
    shares: Array<{ memberId: string; amount: number }>;
  }) => void;
}

export function SplitExpenseForm({
  totalAmount,
  onSplitChange,
}: SplitExpenseFormProps) {
  const [isSplit, setIsSplit] = useState(false);
  const [splitMethod, setSplitMethod] = useState<"EQUAL" | "EXACT">("EQUAL");
  const [members, setMembers] = useState<SplitMemberShare[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch family members
  useEffect(() => {
    async function loadMembers() {
      try {
        setLoading(true);
        const res = await fetch("/api/family/members");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const initial: SplitMemberShare[] = data.map((m: any) => ({
              memberId: m.id,
              name: m.user?.name || "Member",
              amount: 0,
              included: true,
            }));
            setMembers(initial);
          }
        }
      } catch (err) {
        console.error("Failed to load family members for split:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMembers();
  }, []);

  // Recalculate shares whenever totalAmount, members selection, or splitMethod changes
  useEffect(() => {
    if (!isSplit || members.length === 0) {
      onSplitChange({ isSplit: false, shares: [] });
      return;
    }

    const includedMembers = members.filter((m) => m.included);
    if (includedMembers.length === 0) {
      onSplitChange({ isSplit: true, shares: [] });
      return;
    }

    if (splitMethod === "EQUAL") {
      const perPerson = Math.round((totalAmount / includedMembers.length) * 100) / 100;
      const updated = members.map((m) => ({
        ...m,
        amount: m.included ? perPerson : 0,
      }));

      // Account for rounding penny difference on the first member
      const sum = perPerson * includedMembers.length;
      const diff = Math.round((totalAmount - sum) * 100) / 100;
      if (diff !== 0 && includedMembers.length > 0) {
        const firstIncluded = updated.find((m) => m.included);
        if (firstIncluded) firstIncluded.amount += diff;
      }

      setMembers(updated);
      onSplitChange({
        isSplit: true,
        shares: updated
          .filter((m) => m.included)
          .map((m) => ({ memberId: m.memberId, amount: m.amount })),
      });
    } else {
      // EXACT method: notify parent with current amounts
      onSplitChange({
        isSplit: true,
        shares: members
          .filter((m) => m.included)
          .map((m) => ({ memberId: m.memberId, amount: m.amount })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSplit, splitMethod, totalAmount]);

  const toggleMember = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.memberId === memberId ? { ...m, included: !m.included } : m
      )
    );
  };

  const updateExactAmount = (memberId: string, valStr: string) => {
    const val = parseFloat(valStr) || 0;
    setMembers((prev) => {
      const updated = prev.map((m) =>
        m.memberId === memberId ? { ...m, amount: val } : m
      );
      onSplitChange({
        isSplit: true,
        shares: updated
          .filter((m) => m.included)
          .map((m) => ({ memberId: m.memberId, amount: m.amount })),
      });
      return updated;
    });
  };

  const currentTotal = members
    .filter((m) => m.included)
    .reduce((acc, m) => acc + m.amount, 0);
  const exactDiff = Math.round((totalAmount - currentTotal) * 100) / 100;

  return (
    <div className="d-flex flex-column gap-3">
      {/* Split Toggle Switch */}
      <div className="d-flex align-items-center justify-content-between p-3 rounded-card bg-light border">
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: "34px", height: "34px" }}
          >
            <Users style={{ width: "18px", height: "18px" }} />
          </div>
          <div>
            <label
              htmlFor="split-toggle"
              className="small fw-bold text-dark cursor-pointer d-block mb-0"
            >
              Split with Family
            </label>
            <p className="small text-secondary mb-0" style={{ fontSize: "11px" }}>
              Share cost with other family members
            </p>
          </div>
        </div>

        <div className="form-check form-switch mb-0">
          <input
            id="split-toggle"
            type="checkbox"
            role="switch"
            checked={isSplit}
            onChange={(e) => setIsSplit(e.target.checked)}
            className="form-check-input fs-5 cursor-pointer"
          />
        </div>
      </div>

      {isSplit && (
        <div className="p-3 bg-surface rounded-card border d-flex flex-column gap-3 shadow-sm">
          {/* Method selector */}
          <div className="d-flex align-items-center justify-content-between">
            <span className="small fw-semibold text-dark">Split Method:</span>
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                onClick={() => setSplitMethod("EQUAL")}
                className={`btn btn-sm fw-bold d-flex align-items-center gap-1 ${
                  splitMethod === "EQUAL"
                    ? "btn-primary shadow-sm"
                    : "btn-light border text-secondary"
                }`}
              >
                <Divide style={{ width: "12px", height: "12px" }} /> Equally
              </button>
              <button
                type="button"
                onClick={() => setSplitMethod("EXACT")}
                className={`btn btn-sm fw-bold d-flex align-items-center gap-1 ${
                  splitMethod === "EXACT"
                    ? "btn-primary shadow-sm"
                    : "btn-light border text-secondary"
                }`}
              >
                <Sliders style={{ width: "12px", height: "12px" }} /> Custom
              </button>
            </div>
          </div>

          {/* Members Checklist / Shares */}
          <div className="d-flex flex-column gap-2">
            <span className="small fw-semibold text-secondary" style={{ fontSize: "11px" }}>
              Participating Members:
            </span>

            {members.map((member) => (
              <div
                key={member.memberId}
                className="d-flex align-items-center justify-content-between p-2 rounded-btn bg-light border small"
              >
                <label className="d-flex align-items-center gap-2 cursor-pointer user-select-none mb-0">
                  <input
                    type="checkbox"
                    checked={member.included}
                    onChange={() => toggleMember(member.memberId)}
                    className="form-check-input mt-0"
                  />
                  <span
                    className={`fw-semibold ${
                      member.included ? "text-dark" : "text-secondary text-decoration-line-through"
                    }`}
                  >
                    {member.name}
                  </span>
                </label>

                {member.included && (
                  <div>
                    {splitMethod === "EQUAL" ? (
                      <span className="fw-bold text-dark small">
                        {formatCurrency(member.amount)}
                      </span>
                    ) : (
                      <div className="d-flex align-items-center gap-1">
                        <span className="text-secondary small">₹</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={member.amount || ""}
                          onChange={(e) =>
                            updateExactAmount(member.memberId, e.target.value)
                          }
                          className="form-control form-control-sm text-end fw-bold py-1 px-2 rounded-input"
                          style={{ width: "95px" }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Custom Split Balancing Alert */}
          {splitMethod === "EXACT" && exactDiff !== 0 && (
            <div
              className={`p-2 rounded-btn small fw-medium mb-0 ${
                exactDiff > 0
                  ? "alert alert-warning py-1.5 px-3 mb-0"
                  : "alert alert-danger py-1.5 px-3 mb-0"
              }`}
            >
              {exactDiff > 0
                ? `Remaining unallocated: ${formatCurrency(exactDiff)}`
                : `Exceeds total by: ${formatCurrency(Math.abs(exactDiff))}`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

