"use client";

import React, { useState } from "react";
import {
  Search,
  X,
  RotateCcw,
  Calendar,
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
    <div className="d-flex flex-column gap-3">
      {/* ── 1. Search Bar & Mobile Trigger ── */}
      <div className="d-flex align-items-center gap-2">
        <div className="position-relative flex-grow-1">
          <Search 
            style={{ width: "16px", height: "16px" }} 
            className="text-secondary position-absolute start-0 top-50 translate-middle-y ms-3 pointer-events-none" 
          />
          <input
            type="text"
            placeholder="Search by note, description, merchant, or amount..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="form-control rounded-input ps-5 pe-5 small text-dark bg-surface border shadow-none"
            style={{ minHeight: "44px" }}
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: "" })}
              className="btn btn-sm btn-link text-secondary position-absolute end-0 top-50 translate-middle-y me-2 p-1"
              title="Clear search"
            >
              <X style={{ width: "14px", height: "14px" }} />
            </button>
          )}
        </div>

        {/* Mobile Filter Sheet Trigger */}
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setIsFilterSheetOpen(true)}
          className="d-lg-none flex-shrink-0 d-inline-flex align-items-center gap-1.5 fw-semibold small px-3"
          style={{ minHeight: "44px" }}
        >
          <SlidersHorizontal style={{ width: "16px", height: "16px" }} className="text-secondary" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span 
              className="badge bg-primary text-white rounded-pill ms-1 d-inline-flex align-items-center justify-content-center"
              style={{ width: "18px", height: "18px", fontSize: "10px" }}
            >
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
            className="d-none d-lg-inline-flex align-items-center gap-1 text-secondary small fw-semibold px-3"
            title="Reset all filters"
          >
            <RotateCcw style={{ width: "14px", height: "14px" }} />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* ── 2. Unified Desktop Filter Bar ── */}
      <div className="d-none d-lg-flex align-items-center justify-content-between gap-3 p-3 rounded-card border bg-surface shadow-sm flex-wrap">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Segmented Type Controls */}
          <div className="btn-group p-0.5 bg-light rounded-btn border">
            <button
              type="button"
              onClick={() => onChange({ ...filters, type: "ALL" })}
              className={cn(
                "btn btn-sm py-1 px-3 rounded-btn small fw-semibold transition",
                filters.type === "ALL"
                  ? "btn-light text-dark shadow-sm fw-bold border"
                  : "btn-link text-secondary text-decoration-none"
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, type: "EXPENSE" })}
              className={cn(
                "btn btn-sm py-1 px-3 rounded-btn small fw-semibold transition",
                filters.type === "EXPENSE"
                  ? "btn-danger text-white shadow-sm fw-bold"
                  : "btn-link text-secondary text-decoration-none"
              )}
            >
              Expenses
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, type: "INCOME" })}
              className={cn(
                "btn btn-sm py-1 px-3 rounded-btn small fw-semibold transition",
                filters.type === "INCOME"
                  ? "btn-success text-white shadow-sm fw-bold"
                  : "btn-link text-secondary text-decoration-none"
              )}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, type: "TRANSFER" })}
              className={cn(
                "btn btn-sm py-1 px-3 rounded-btn small fw-semibold transition",
                filters.type === "TRANSFER"
                  ? "btn-primary text-white shadow-sm fw-bold"
                  : "btn-link text-secondary text-decoration-none"
              )}
            >
              Transfers
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={filters.categoryId}
            onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
            className="form-select form-select-sm rounded-btn py-1.5 px-3 small text-dark bg-surface border w-auto"
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
            className="form-select form-select-sm rounded-btn py-1.5 px-3 small text-dark bg-surface border w-auto"
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
              className="form-select form-select-sm rounded-btn py-1.5 px-3 small text-dark bg-surface border w-auto"
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
            className="form-select form-select-sm rounded-btn py-1.5 px-3 small text-dark bg-surface border w-auto"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="THIS_WEEK">This Week</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="CUSTOM">Custom Date Range...</option>
          </select>
        </div>

        {/* Custom Date Range Picker */}
        {showCustomDate && (
          <div className="d-flex align-items-center gap-2 small text-secondary bg-light px-2.5 py-1 rounded-btn border">
            <Calendar style={{ width: "14px", height: "14px" }} className="text-secondary" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
              className="form-control form-control-sm rounded-input py-0 px-2 small border"
              style={{ width: "130px" }}
            />
            <span>→</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
              className="form-control form-control-sm rounded-input py-0 px-2 small border"
              style={{ width: "130px" }}
            />
          </div>
        )}
      </div>

      {/* ── 3. Active Filters Chips ── */}
      {activeFiltersCount > 0 && (
        <div className="d-flex align-items-center gap-1.5 flex-wrap pt-1">
          <span className="small text-secondary fw-semibold me-1" style={{ fontSize: "11px" }}>
            Active Filters:
          </span>

          {filters.type !== "ALL" && (
            <span className="badge bg-light text-dark border rounded-pill d-inline-flex align-items-center gap-1 py-1 px-2.5 small fw-semibold">
              Type: {filters.type === "EXPENSE" ? "Expense" : filters.type === "INCOME" ? "Income" : "Transfer"}
              <button
                onClick={() => onChange({ ...filters, type: "ALL" })}
                className="btn btn-sm btn-link text-danger p-0 ms-1"
                aria-label="Clear type filter"
              >
                <X style={{ width: "12px", height: "12px" }} />
              </button>
            </span>
          )}

          {activeCategory && (
            <span className="badge bg-light text-dark border rounded-pill d-inline-flex align-items-center gap-1 py-1 px-2.5 small fw-semibold">
              Category: {activeCategory.name}
              <button
                onClick={() => onChange({ ...filters, categoryId: "" })}
                className="btn btn-sm btn-link text-danger p-0 ms-1"
                aria-label="Clear category filter"
              >
                <X style={{ width: "12px", height: "12px" }} />
              </button>
            </span>
          )}

          {activeAccount && (
            <span className="badge bg-light text-dark border rounded-pill d-inline-flex align-items-center gap-1 py-1 px-2.5 small fw-semibold">
              Account: {activeAccount.name}
              <button
                onClick={() => onChange({ ...filters, accountId: "" })}
                className="btn btn-sm btn-link text-danger p-0 ms-1"
                aria-label="Clear account filter"
              >
                <X style={{ width: "12px", height: "12px" }} />
              </button>
            </span>
          )}

          {activeMember && (
            <span className="badge bg-light text-dark border rounded-pill d-inline-flex align-items-center gap-1 py-1 px-2.5 small fw-semibold">
              Member: {activeMember.user?.name}
              <button
                onClick={() => onChange({ ...filters, memberId: "" })}
                className="btn btn-sm btn-link text-danger p-0 ms-1"
                aria-label="Clear member filter"
              >
                <X style={{ width: "12px", height: "12px" }} />
              </button>
            </span>
          )}

          {(filters.startDate || filters.endDate) && (
            <span className="badge bg-light text-dark border rounded-pill d-inline-flex align-items-center gap-1 py-1 px-2.5 small fw-semibold">
              Date: {filters.startDate || "Start"} → {filters.endDate || "End"}
              <button
                onClick={() => onChange({ ...filters, startDate: "", endDate: "" })}
                className="btn btn-sm btn-link text-danger p-0 ms-1"
                aria-label="Clear date filter"
              >
                <X style={{ width: "12px", height: "12px" }} />
              </button>
            </span>
          )}

          <button
            onClick={onReset}
            className="btn btn-sm btn-link text-primary fw-bold p-0 ms-1 small text-decoration-none"
            style={{ fontSize: "11px" }}
          >
            Clear all
          </button>

          {typeof totalResults === "number" && (
            <span className="text-secondary small ms-auto font-medium" style={{ fontSize: "11px" }}>
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
        <div className="d-flex flex-column gap-3 pt-2">
          {/* Type */}
          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              Transaction Type
            </label>
            <div className="row g-1 p-1 bg-light rounded-btn border text-center">
              <div className="col-3">
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, type: "ALL" })}
                  className={cn(
                    "btn btn-sm w-100 py-1.5 rounded-btn small fw-semibold transition",
                    filters.type === "ALL" ? "btn-light shadow-sm text-dark fw-bold border" : "btn-link text-secondary text-decoration-none"
                  )}
                >
                  All
                </button>
              </div>
              <div className="col-3">
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, type: "EXPENSE" })}
                  className={cn(
                    "btn btn-sm w-100 py-1.5 rounded-btn small fw-semibold transition",
                    filters.type === "EXPENSE" ? "btn-danger text-white shadow-sm fw-bold" : "btn-link text-secondary text-decoration-none"
                  )}
                >
                  Expenses
                </button>
              </div>
              <div className="col-3">
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, type: "INCOME" })}
                  className={cn(
                    "btn btn-sm w-100 py-1.5 rounded-btn small fw-semibold transition",
                    filters.type === "INCOME" ? "btn-success text-white shadow-sm fw-bold" : "btn-link text-secondary text-decoration-none"
                  )}
                >
                  Income
                </button>
              </div>
              <div className="col-3">
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, type: "TRANSFER" })}
                  className={cn(
                    "btn btn-sm w-100 py-1.5 rounded-btn small fw-semibold transition",
                    filters.type === "TRANSFER" ? "btn-primary text-white shadow-sm fw-bold" : "btn-link text-secondary text-decoration-none"
                  )}
                >
                  Transfers
                </button>
              </div>
            </div>
          </div>

          {/* Quick Date Presets */}
          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              Date Period
            </label>
            <div className="row g-2">
              <div className="col-6">
                <button
                  type="button"
                  onClick={() => handleDatePreset("ALL")}
                  className={cn(
                    "btn btn-sm w-100 p-2 rounded-btn border fw-medium small",
                    !filters.startDate && !filters.endDate
                      ? "btn-light border-primary bg-primary-subtle text-primary fw-bold"
                      : "btn-light border text-dark"
                  )}
                >
                  All Time
                </button>
              </div>
              <div className="col-6">
                <button
                  type="button"
                  onClick={() => handleDatePreset("TODAY")}
                  className={cn(
                    "btn btn-sm w-100 p-2 rounded-btn border fw-medium small",
                    filters.startDate === getTodayStr() && filters.endDate === getTodayStr()
                      ? "btn-light border-primary bg-primary-subtle text-primary fw-bold"
                      : "btn-light border text-dark"
                  )}
                >
                  Today
                </button>
              </div>
              <div className="col-6">
                <button
                  type="button"
                  onClick={() => handleDatePreset("THIS_WEEK")}
                  className={cn(
                    "btn btn-sm w-100 p-2 rounded-btn border fw-medium small",
                    filters.startDate === getWeekStartStr()
                      ? "btn-light border-primary bg-primary-subtle text-primary fw-bold"
                      : "btn-light border text-dark"
                  )}
                >
                  This Week
                </button>
              </div>
              <div className="col-6">
                <button
                  type="button"
                  onClick={() => handleDatePreset("THIS_MONTH")}
                  className={cn(
                    "btn btn-sm w-100 p-2 rounded-btn border fw-medium small",
                    filters.startDate === getMonthStartStr()
                      ? "btn-light border-primary bg-primary-subtle text-primary fw-bold"
                      : "btn-light border text-dark"
                  )}
                >
                  This Month
                </button>
              </div>
            </div>
          </div>

          {/* Custom Date Inputs */}
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label small fw-semibold text-secondary mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
                className="form-control form-control-sm rounded-input py-1.5 px-3 small border"
              />
            </div>
            <div className="col-6">
              <label className="form-label small fw-semibold text-secondary mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
                className="form-control form-control-sm rounded-input py-1.5 px-3 small border"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="form-label small fw-semibold text-dark mb-1">
              Category
            </label>
            <select
              value={filters.categoryId}
              onChange={(e) => onChange({ ...filters, categoryId: e.target.value })}
              className="form-select form-select-sm rounded-input py-2 px-3 small border bg-white"
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
            <label className="form-label small fw-semibold text-dark mb-1">
              Account
            </label>
            <select
              value={filters.accountId}
              onChange={(e) => onChange({ ...filters, accountId: e.target.value })}
              className="form-select form-select-sm rounded-input py-2 px-3 small border bg-white"
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
          <div 
            className="position-sticky bottom-0 bg-surface border-top pt-2.5 pb-2 mt-auto d-flex gap-2"
            style={{ zIndex: 20, paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 12px))" }}
          >
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                onReset();
                setIsFilterSheetOpen(false);
              }}
              className="flex-fill small"
            >
              Reset Filters
            </Button>
            <Button
              type="button"
              size="md"
              onClick={() => setIsFilterSheetOpen(false)}
              className="flex-fill small fw-bold"
            >
              Apply ({activeFiltersCount})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
