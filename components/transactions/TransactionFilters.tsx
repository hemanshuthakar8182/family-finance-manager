"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  X,
  RotateCcw,
  Calendar,
  Tag,
  CreditCard,
  User,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils/cn";

export interface FilterOptions {
  search: string;
  type: "ALL" | "EXPENSE" | "INCOME" | "TRANSFER";
  categoryId: string;
  accountId: string;
  memberId: string;
  startDate: string;
  endDate: string;
}

interface TransactionFiltersProps {
  filters: FilterOptions;
  categories: any[];
  accounts: any[];
  members: any[];
  onChange: (filters: FilterOptions) => void;
  onReset: () => void;
  totalResults?: number;
}

export function TransactionFilters({
  filters,
  categories,
  accounts,
  members,
  onChange,
  onReset,
  totalResults,
}: TransactionFiltersProps) {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(Boolean(filters.startDate || filters.endDate));

  // Date helpers
  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const getWeekStartStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split("T")[0];
  };
  const getMonthStartStr = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
  };

  const handleDatePreset = (preset: "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "CUSTOM") => {
    if (preset === "ALL") {
      setShowCustomDate(false);
      onChange({ ...filters, startDate: "", endDate: "" });
    } else if (preset === "TODAY") {
      setShowCustomDate(false);
      const t = getTodayStr();
      onChange({ ...filters, startDate: t, endDate: t });
    } else if (preset === "THIS_WEEK") {
      setShowCustomDate(false);
      onChange({ ...filters, startDate: getWeekStartStr(), endDate: getTodayStr() });
    } else if (preset === "THIS_MONTH") {
      setShowCustomDate(false);
      onChange({ ...filters, startDate: getMonthStartStr(), endDate: getTodayStr() });
    } else if (preset === "CUSTOM") {
      setShowCustomDate(true);
    }
  };

  const activeFiltersCount = [
    filters.type !== "ALL" ? 1 : 0,
    filters.categoryId ? 1 : 0,
    filters.accountId ? 1 : 0,
    filters.memberId ? 1 : 0,
    filters.startDate || filters.endDate ? 1 : 0,
    filters.search ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Active filter labels
  const activeCategory = categories.find((c) => c.id === filters.categoryId);
  const activeAccount = accounts.find((a) => a.id === filters.accountId);
  const activeMember = members.find((m) => m.id === filters.memberId);

  return (
    <div className="space-y-3">
      {/* ── 1. Search Bar & Mobile Trigger ── */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by note, description, merchant, or amount..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full h-11 pl-10 pr-9 rounded-input border border-border bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Sheet Trigger */}
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setIsFilterSheetOpen(true)}
          className="lg:hidden shrink-0 flex items-center gap-1.5 h-11 px-3 shadow-2xs font-semibold text-xs"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-600" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center ml-0.5">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onReset}
            className="hidden lg:flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-semibold h-11 px-3"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* ── 2. Unified Desktop Filter Bar ── */}
      <div className="hidden lg:flex items-center justify-between gap-3 p-3 rounded-card border border-border bg-surface shadow-card flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Segmented Type Controls (including TRANSFER) */}
          <div className="inline-flex rounded-lg border border-border p-0.5 bg-slate-100">
            <button
              type="button"
              onClick={() => onChange({ ...filters, type: "ALL" })}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-semibold transition-all",
                filters.type === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, type: "EXPENSE" })}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-semibold transition-all",
                filters.type === "EXPENSE"
                  ? "bg-expense text-white shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, type: "INCOME" })}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-semibold transition-all",
                filters.type === "INCOME"
                  ? "bg-income text-white shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, type: "TRANSFER" })}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-semibold transition-all",
                filters.type === "TRANSFER"
                  ? "bg-blue-600 text-white shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Transfers
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={filters.categoryId}
            onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
            className="h-9 px-3 rounded-btn border border-border bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Account Dropdown */}
          <select
            value={filters.accountId}
            onChange={(e) => onChange({ ...filters, accountId: e.target.value })}
            className="h-9 px-3 rounded-btn border border-border bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Member Dropdown */}
          {members.length > 1 && (
            <select
              value={filters.memberId}
              onChange={(e) => onChange({ ...filters, memberId: e.target.value })}
              className="h-9 px-3 rounded-btn border border-border bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
            >
              <option value="">All Members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.user?.name || "Member"}
                </option>
              ))}
            </select>
          )}

          {/* Date Presets Dropdown */}
          <select
            value={
              !filters.startDate && !filters.endDate
                ? "ALL"
                : filters.startDate === getTodayStr() && filters.endDate === getTodayStr()
                ? "TODAY"
                : filters.startDate === getWeekStartStr()
                ? "THIS_WEEK"
                : filters.startDate === getMonthStartStr()
                ? "THIS_MONTH"
                : "CUSTOM"
            }
            onChange={(e) => handleDatePreset(e.target.value as any)}
            className="h-9 px-3 rounded-btn border border-border bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="CUSTOM">Custom Date Range...</option>
          </select>
        </div>

        {/* Custom Date Range Picker (shown when Custom or dates active) */}
        {showCustomDate && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 animate-in fade-in">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
              className="h-7 px-2 rounded border border-border text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
              className="h-7 px-2 rounded border border-border text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={() => {
                setShowCustomDate(false);
                onChange({ ...filters, startDate: "", endDate: "" });
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5"
              title="Clear custom dates"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── 3. Active Filter Badges Ribbon ── */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
          <span className="text-slate-400 font-semibold text-[11px]">
            Active filters:
          </span>

          {filters.type !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              Type: {filters.type === "EXPENSE" ? "Expenses" : filters.type === "INCOME" ? "Income" : "Transfers"}
              <button
                onClick={() => onChange({ ...filters, type: "ALL" })}
                className="hover:text-red-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              Category: {activeCategory.name}
              <button
                onClick={() => onChange({ ...filters, categoryId: "" })}
                className="hover:text-red-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeAccount && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              Account: {activeAccount.name}
              <button
                onClick={() => onChange({ ...filters, accountId: "" })}
                className="hover:text-red-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {activeMember && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              Member: {activeMember.user?.name}
              <button
                onClick={() => onChange({ ...filters, memberId: "" })}
                className="hover:text-red-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(filters.startDate || filters.endDate) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
              Date: {filters.startDate || "Start"} → {filters.endDate || "End"}
              <button
                onClick={() => onChange({ ...filters, startDate: "", endDate: "" })}
                className="hover:text-red-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={onReset}
            className="text-[11px] font-bold text-primary hover:underline underline-offset-2 ml-1"
          >
            Clear all
          </button>

          {typeof totalResults === "number" && (
            <span className="text-[11px] text-slate-400 ml-auto font-medium">
              {totalResults} {totalResults === 1 ? "result" : "results"}
            </span>
          )}
        </div>
      )}

      {/* ── 4. Mobile Filter Bottom Sheet Modal ── */}
      <Modal
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filter Transactions"
        description="Filter by type, category, account, or date"
      >
        <div className="space-y-4 pt-2">
          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-btn text-xs font-semibold">
              <button
                type="button"
                onClick={() => onChange({ ...filters, type: "ALL" })}
                className={cn(
                  "py-2 rounded-md transition-colors text-center",
                  filters.type === "ALL" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600"
                )}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...filters, type: "EXPENSE" })}
                className={cn(
                  "py-2 rounded-md transition-colors text-center",
                  filters.type === "EXPENSE" ? "bg-expense text-white shadow-xs font-bold" : "text-slate-600"
                )}
              >
                Expenses
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...filters, type: "INCOME" })}
                className={cn(
                  "py-2 rounded-md transition-colors text-center",
                  filters.type === "INCOME" ? "bg-income text-white shadow-xs font-bold" : "text-slate-600"
                )}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...filters, type: "TRANSFER" })}
                className={cn(
                  "py-2 rounded-md transition-colors text-center",
                  filters.type === "TRANSFER" ? "bg-blue-600 text-white shadow-xs font-bold" : "text-slate-600"
                )}
              >
                Transfers
              </button>
            </div>
          </div>

          {/* Quick Date Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Date Period
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDatePreset("ALL")}
                className={cn(
                  "p-2 rounded-lg border text-center font-medium",
                  !filters.startDate && !filters.endDate
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-border bg-white text-slate-700"
                )}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => handleDatePreset("TODAY")}
                className={cn(
                  "p-2 rounded-lg border text-center font-medium",
                  filters.startDate === getTodayStr() && filters.endDate === getTodayStr()
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-border bg-white text-slate-700"
                )}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleDatePreset("THIS_WEEK")}
                className={cn(
                  "p-2 rounded-lg border text-center font-medium",
                  filters.startDate === getWeekStartStr()
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-border bg-white text-slate-700"
                )}
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => handleDatePreset("THIS_MONTH")}
                className={cn(
                  "p-2 rounded-lg border text-center font-medium",
                  filters.startDate === getMonthStartStr()
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-border bg-white text-slate-700"
                )}
              >
                This Month
              </button>
            </div>
          </div>

          {/* Custom Date Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
                className="w-full h-10 px-3 rounded-input border border-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
                className="w-full h-10 px-3 rounded-input border border-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={filters.categoryId}
              onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
              className="w-full h-10 px-3 rounded-input border border-border text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none bg-white"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Account */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account
            </label>
            <select
              value={filters.accountId}
              onChange={(e) => onChange({ ...filters, accountId: e.target.value })}
              className="w-full h-10 px-3 rounded-input border border-border text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-none bg-white"
            >
              <option value="">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                onReset();
                setIsFilterSheetOpen(false);
              }}
              className="flex-1 text-xs"
            >
              Reset Filters
            </Button>
            <Button
              type="button"
              size="md"
              onClick={() => setIsFilterSheetOpen(false)}
              className="flex-1 text-xs font-bold"
            >
              Apply ({activeFiltersCount})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
