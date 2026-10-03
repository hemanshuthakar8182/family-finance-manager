"use client";

import React, { useState } from "react";
import { Search, Filter, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface FilterOptions {
  search: string;
  type: "ALL" | "INCOME" | "EXPENSE";
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
}

export function TransactionFilters({
  filters,
  categories,
  accounts,
  members,
  onChange,
  onReset,
}: TransactionFiltersProps) {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const activeFiltersCount = [
    filters.type !== "ALL" ? 1 : 0,
    filters.categoryId ? 1 : 0,
    filters.accountId ? 1 : 0,
    filters.memberId ? 1 : 0,
    filters.startDate || filters.endDate ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      {/* Top search and filter trigger */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions, notes, merchant..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full h-11 pl-10 pr-4 rounded-input border border-border bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Filter Button */}
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setIsFilterSheetOpen(true)}
          className="lg:hidden shrink-0 flex items-center gap-1.5"
        >
          <Filter className="w-4 h-4 text-slate-500" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
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
            className="hidden lg:flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Desktop Inline Filters Bar */}
      <div className="hidden lg:flex items-center gap-3 flex-wrap p-3 rounded-card border border-border bg-surface">
        {/* Type Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-btn text-xs font-semibold">
          <button
            onClick={() => onChange({ ...filters, type: "ALL" })}
            className={`px-3 py-1 rounded-btn transition-colors ${
              filters.type === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => onChange({ ...filters, type: "EXPENSE" })}
            className={`px-3 py-1 rounded-btn transition-colors ${
              filters.type === "EXPENSE" ? "bg-expense text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Expense
          </button>
          <button
            onClick={() => onChange({ ...filters, type: "INCOME" })}
            className={`px-3 py-1 rounded-btn transition-colors ${
              filters.type === "INCOME" ? "bg-income text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Income
          </button>
        </div>

        {/* Category Select */}
        <select
          value={filters.categoryId}
          onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
          className="h-9 px-3 rounded-btn border border-border bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Account Select */}
        <select
          value={filters.accountId}
          onChange={(e) => onChange({ ...filters, accountId: e.target.value })}
          className="h-9 px-3 rounded-btn border border-border bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* Member Select */}
        <select
          value={filters.memberId}
          onChange={(e) => onChange({ ...filters, memberId: e.target.value })}
          className="h-9 px-3 rounded-btn border border-border bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Members</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.user.name}
            </option>
          ))}
        </select>

        {/* Date Inputs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 ml-auto">
          <span>From:</span>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            className="h-9 px-2 rounded-btn border border-border text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span>To:</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            className="h-9 px-2 rounded-btn border border-border text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <Modal
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filter Transactions"
        description="Refine your family transactions"
      >
        <div className="space-y-4 pt-2">
          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["ALL", "EXPENSE", "INCOME"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange({ ...filters, type: t })}
                  className={`py-2 rounded-btn font-semibold text-xs border text-center transition-all ${
                    filters.type === t
                      ? "bg-primary text-white border-primary shadow-xs"
                      : "bg-surface text-slate-700 border-border hover:bg-slate-50"
                  }`}
                >
                  {t === "ALL" ? "All" : t === "EXPENSE" ? "Expense" : "Income"}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category
            </label>
            <select
              value={filters.categoryId}
              onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
              className="w-full h-11 px-3 rounded-input border border-border bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account
            </label>
            <select
              value={filters.accountId}
              onChange={(e) => onChange({ ...filters, accountId: e.target.value })}
              className="w-full h-11 px-3 rounded-input border border-border bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          {/* Member */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Family Member
            </label>
            <select
              value={filters.memberId}
              onChange={(e) => onChange({ ...filters, memberId: e.target.value })}
              className="w-full h-11 px-3 rounded-input border border-border bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All Members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
                className="w-full h-10 px-2 rounded-input border border-border text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
                className="w-full h-10 px-2 rounded-input border border-border text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Sheet Actions */}
          <div className="pt-2 flex gap-2">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => setIsFilterSheetOpen(false)}
              className="flex-1 font-bold"
            >
              Apply Filters
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                onReset();
                setIsFilterSheetOpen(false);
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
