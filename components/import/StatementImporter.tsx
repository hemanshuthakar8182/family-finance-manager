"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Trash2,
  Filter,
  Check,
  Building2,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/currency";
import { parseStatementFile, ParsedRow, CategorySummary } from "@/lib/utils/statement-parser";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

interface Account {
  id: string;
  name: string;
  type: string;
  currentBalance: number;
}

interface Category {
  id: string;
  name: string;
  type: "EXPENSE" | "INCOME";
  icon?: string;
  color?: string;
}

export function StatementImporter() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [loadingInitial, setLoadingInitial] = useState(true);

  // File parsing state
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [filterType, setFilterType] = useState<"ALL" | "EXPENSE" | "INCOME">("ALL");

  // Import state
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<{
    importedCount: number;
    skippedCount: number;
    newBalance: number;
  } | null>(null);

  // Fetch accounts and categories
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingInitial(true);
        const [accRes, catRes] = await Promise.all([
          fetch("/api/accounts"),
          fetch("/api/categories"),
        ]);

        if (accRes.ok) {
          const accData = await accRes.json();
          setAccounts(accData);
          if (accData.length > 0) {
            setSelectedAccountId(accData[0].id);
          }
        }

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
      } catch (err) {
        console.error("Failed to load initial data:", err);
        showToast({
          type: "error",
          title: "Error loading accounts",
          message: "Could not fetch accounts or categories. Please reload.",
        });
      } finally {
        setLoadingInitial(false);
      }
    }

    loadData();
  }, [showToast]);

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = async (f: File) => {
    setFile(f);
    setParsing(true);
    setImportSuccess(null);

    try {
      const catSummaries: CategorySummary[] = categories.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
      }));

      const rows = await parseStatementFile(f, catSummaries);
      if (rows.length === 0) {
        showToast({
          type: "error",
          title: "No transactions found",
          message: "Could not detect date and amount columns in this statement.",
        });
      } else {
        setParsedRows(rows);
        showToast({
          type: "success",
          title: "Statement Parsed",
          message: `Found ${rows.length} transactions with smart category matching.`,
        });
      }
    } catch (err: any) {
      console.error("Parsing error:", err);
      showToast({
        type: "error",
        title: "File parsing failed",
        message: err.message || "Please ensure the file is a valid CSV or Excel statement.",
      });
      setFile(null);
    } finally {
      setParsing(false);
    }
  };

  // Row selection toggles
  const toggleRow = (id: string) => {
    setParsedRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  const toggleSelectAll = (select: boolean) => {
    setParsedRows((prev) => prev.map((r) => ({ ...r, selected: select })));
  };

  const updateRowCategory = (rowId: string, categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    setParsedRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              suggestedCategoryId: categoryId,
              suggestedCategoryName: cat?.name,
            }
          : r
      )
    );
  };

  const removeRow = (rowId: string) => {
    setParsedRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  // Perform bulk import
  const handleImport = async () => {
    const selectedRows = parsedRows.filter((r) => r.selected);
    if (selectedRows.length === 0) {
      showToast({
        type: "error",
        title: "No transactions selected",
        message: "Please select at least one row to import.",
      });
      return;
    }

    if (!selectedAccountId) {
      showToast({
        type: "error",
        title: "Account required",
        message: "Please choose which account to import these transactions into.",
      });
      return;
    }

    try {
      setImporting(true);
      const payload = {
        accountId: selectedAccountId,
        skipDuplicates: true,
        transactions: selectedRows.map((r) => ({
          date: r.date ? r.date.toISOString() : new Date().toISOString(),
          type: r.type,
          amount: r.amount,
          categoryId: r.suggestedCategoryId,
          description: r.description,
          notes: `Imported from ${file?.name || "Bank Statement"}`,
        })),
      };

      const res = await fetch("/api/transactions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to import transactions");
      }

      setImportSuccess({
        importedCount: data.importedCount,
        skippedCount: data.skippedCount || 0,
        newBalance: data.newBalance,
      });

      showToast({
        type: "success",
        title: "Import Complete!",
        message: `Imported ${data.importedCount} transactions successfully.`,
      });
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Import Error",
        message: err.message,
      });
    } finally {
      setImporting(false);
    }
  };

  // Summary statistics
  const selectedRows = parsedRows.filter((r) => r.selected);
  const totalDebit = parsedRows
    .filter((r) => r.selected && r.type === "EXPENSE")
    .reduce((acc, r) => acc + r.amount, 0);
  const totalCredit = parsedRows
    .filter((r) => r.selected && r.type === "INCOME")
    .reduce((acc, r) => acc + r.amount, 0);

  const filteredRows = parsedRows.filter((r) => {
    if (filterType === "ALL") return true;
    return r.type === filterType;
  });

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-slate-500 font-medium">Loading statement tools...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success banner if imported */}
      {importSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-7 h-7 text-income flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-emerald-950">
                Successfully Imported {importSuccess.importedCount} Transactions!
              </h3>
              <p className="text-sm text-emerald-800 mt-1">
                {importSuccess.skippedCount > 0 && (
                  <span className="mr-2">
                    ({importSuccess.skippedCount} duplicate rows skipped.)
                  </span>
                )}
                Updated {selectedAccount?.name} balance:{" "}
                <span className="font-bold">
                  {formatCurrency(importSuccess.newBalance)}
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setFile(null);
                setParsedRows([]);
                setImportSuccess(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="flex-1 sm:flex-none px-4 py-2 border border-emerald-300 rounded-btn text-sm font-semibold text-emerald-800 bg-white hover:bg-emerald-100 transition-colors"
            >
              Import Another
            </button>
            <Link
              href="/transactions"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-white rounded-btn text-sm font-semibold hover:bg-primary-hover transition-colors shadow-sm"
            >
              View Transactions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Target Account & File Upload Zone */}
      {!importSuccess && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account Selector Card */}
          <div className="bg-surface rounded-card p-6 border border-border shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-slate-800">1. Select Target Account</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Choose the bank or wallet account to which these statement entries belong.
              </p>

              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Bank / Wallet Account
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-border rounded-input text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.currentBalance)})
                  </option>
                ))}
              </select>

              {selectedAccount && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-600">Current Balance:</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(selectedAccount.currentBalance)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
              💡 Supports HDFC, SBI, ICICI, Kotak, Axis, Paytm, or generic CSV/Excel statements.
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="md:col-span-2 bg-surface rounded-card p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer shadow-card group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-3">
              {parsing ? (
                <RefreshCw className="w-7 h-7 animate-spin" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <h3 className="text-base font-bold text-slate-800">
              {file ? file.name : "Click or drag & drop bank statement"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Supports <strong className="text-slate-700">.CSV, .XLSX, and .XLS</strong> files. Date,
              Amount, Narration, and Debit/Credit columns are auto-detected.
            </p>

            {file && (
              <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                <Check className="w-3.5 h-3.5" /> File Loaded ({(file.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Review & Edit Grid */}
      {parsedRows.length > 0 && !importSuccess && (
        <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
          {/* Header & Batch Controls */}
          <div className="p-4 sm:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
                Review & Categorize Transactions
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review suggested categories, toggle transactions, or uncheck any rows you do not wish to import.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-border p-1 bg-white">
                <button
                  onClick={() => setFilterType("ALL")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    filterType === "ALL"
                      ? "bg-primary text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All ({parsedRows.length})
                </button>
                <button
                  onClick={() => setFilterType("EXPENSE")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    filterType === "EXPENSE"
                      ? "bg-expense text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Expenses
                </button>
                <button
                  onClick={() => setFilterType("INCOME")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    filterType === "INCOME"
                      ? "bg-income text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Income
                </button>
              </div>

              <button
                onClick={() => toggleSelectAll(selectedRows.length !== parsedRows.length)}
                className="px-3 py-1.5 text-xs font-semibold border border-border bg-white rounded-btn hover:bg-slate-100 transition-colors"
              >
                {selectedRows.length === parsedRows.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>

          {/* Metrics ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border divide-x divide-border bg-white">
            <div className="p-3 text-center">
              <span className="text-xs text-slate-500">Selected Rows</span>
              <p className="text-sm font-bold text-slate-800">
                {selectedRows.length} / {parsedRows.length}
              </p>
            </div>
            <div className="p-3 text-center">
              <span className="text-xs text-slate-500">Total Outflow (Debit)</span>
              <p className="text-sm font-bold text-expense">
                -{formatCurrency(totalDebit)}
              </p>
            </div>
            <div className="p-3 text-center">
              <span className="text-xs text-slate-500">Total Inflow (Credit)</span>
              <p className="text-sm font-bold text-income">
                +{formatCurrency(totalCredit)}
              </p>
            </div>
            <div className="p-3 text-center">
              <span className="text-xs text-slate-500">Net Impact</span>
              <p
                className={`text-sm font-bold ${
                  totalCredit >= totalDebit ? "text-income" : "text-expense"
                }`}
              >
                {totalCredit >= totalDebit ? "+" : ""}
                {formatCurrency(totalCredit - totalDebit)}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[460px]">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-100 text-xs font-bold text-slate-600 border-b border-border z-10">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === parsedRows.length && parsedRows.length > 0}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="p-3 w-28">Date</th>
                  <th className="p-3">Description / Narration</th>
                  <th className="p-3 w-28">Type</th>
                  <th className="p-3 w-32 text-right">Amount</th>
                  <th className="p-3 w-48">Category</th>
                  <th className="p-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRows.map((row) => {
                  const typeCats = categories.filter((c) => c.type === row.type);

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        !row.selected ? "opacity-40 bg-slate-50/50" : ""
                      }`}
                    >
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => toggleRow(row.id)}
                          className="rounded text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="p-3 text-xs font-medium text-slate-700 whitespace-nowrap">
                        {row.date ? row.date.toLocaleDateString() : row.rawDate}
                      </td>
                      <td className="p-3 text-xs font-semibold text-slate-800 max-w-xs truncate" title={row.description}>
                        {row.description}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.type === "INCOME"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {row.type}
                        </span>
                      </td>
                      <td
                        className={`p-3 text-right text-xs font-bold whitespace-nowrap ${
                          row.type === "INCOME" ? "text-income" : "text-expense"
                        }`}
                      >
                        {row.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="p-3">
                        <div className="relative">
                          <select
                            value={row.suggestedCategoryId || ""}
                            onChange={(e) => updateRowCategory(row.id, e.target.value)}
                            disabled={!row.selected}
                            className="w-full text-xs font-medium px-2 py-1.5 bg-slate-50 border border-border rounded-md focus:ring-1 focus:ring-primary focus:outline-none"
                          >
                            <option value="">-- Uncategorized --</option>
                            {typeCats.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          {row.suggestedCategoryName && (
                            <span
                              title="Smart auto-matched category"
                              className="absolute -top-1 -right-1 flex h-2 w-2"
                            >
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeRow(row.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                          title="Remove row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Bar */}
          <div className="p-4 sm:p-6 bg-slate-50/80 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              Target: <strong className="text-slate-900">{selectedAccount?.name}</strong> •{" "}
              {selectedRows.length} transaction(s) ready to import
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => {
                  setFile(null);
                  setParsedRows([]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                disabled={importing}
                className="flex-1 sm:flex-none px-4 py-2 border border-border bg-white text-slate-700 rounded-btn text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleImport}
                disabled={importing || selectedRows.length === 0}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-btn text-xs font-bold hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm"
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Importing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Import {selectedRows.length} Transactions
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
