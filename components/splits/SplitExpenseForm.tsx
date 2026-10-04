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
    <div className="space-y-3">
      {/* Split Toggle Switch */}
      <div className="flex items-center justify-between p-3 rounded-card bg-slate-50 border border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <label
              htmlFor="split-toggle"
              className="text-xs font-bold text-slate-800 cursor-pointer block"
            >
              Split with Family
            </label>
            <p className="text-[10px] text-slate-500">
              Share cost with other family members
            </p>
          </div>
        </div>

        <input
          id="split-toggle"
          type="checkbox"
          checked={isSplit}
          onChange={(e) => setIsSplit(e.target.checked)}
          className="w-4 h-4 text-primary rounded focus:ring-primary cursor-pointer"
        />
      </div>

      {isSplit && (
        <div className="p-3 bg-white rounded-card border border-border space-y-3 animate-in fade-in">
          {/* Method selector */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Split Method:</span>
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setSplitMethod("EQUAL")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors ${
                  splitMethod === "EQUAL"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Divide className="w-3 h-3" /> Equally
              </button>
              <button
                type="button"
                onClick={() => setSplitMethod("EXACT")}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors ${
                  splitMethod === "EXACT"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Sliders className="w-3 h-3" /> Custom
              </button>
            </div>
          </div>

          {/* Members Checklist / Shares */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Participating Members:
            </span>

            {members.map((member) => (
              <div
                key={member.memberId}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
              >
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={member.included}
                    onChange={() => toggleMember(member.memberId)}
                    className="rounded text-primary focus:ring-primary w-3.5 h-3.5"
                  />
                  <span
                    className={`font-semibold ${
                      member.included ? "text-slate-800" : "text-slate-400 line-through"
                    }`}
                  >
                    {member.name}
                  </span>
                </label>

                {member.included && (
                  <div>
                    {splitMethod === "EQUAL" ? (
                      <span className="font-bold text-slate-900 text-xs">
                        {formatCurrency(member.amount)}
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 text-xs">₹</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={member.amount || ""}
                          onChange={(e) =>
                            updateExactAmount(member.memberId, e.target.value)
                          }
                          className="w-20 px-1.5 py-0.5 rounded border border-border text-right font-bold text-xs focus:ring-1 focus:ring-primary focus:outline-none"
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
              className={`p-2 rounded-lg text-[11px] font-medium ${
                exactDiff > 0
                  ? "bg-amber-50 text-amber-900 border border-amber-200"
                  : "bg-red-50 text-red-900 border border-red-200"
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
