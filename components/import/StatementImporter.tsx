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
      <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="small text-secondary fw-medium mb-0">Loading statement tools...</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      {/* Success banner if imported */}
      {importSuccess && (
        <div className="card rounded-card border border-success-subtle bg-success-subtle p-3 p-sm-4 shadow-sm">
          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
            <div className="d-flex align-items-start gap-3">
              <CheckCircle2 className="text-success flex-shrink-0 mt-1" style={{ width: "28px", height: "28px" }} />
              <div>
                <h3 className="h6 fw-bold text-success-emphasis mb-1">
                  Successfully Imported {importSuccess.importedCount} Transactions!
                </h3>
                <p className="small text-success-emphasis mb-0">
                  {importSuccess.skippedCount > 0 && (
                    <span className="me-2">
                      ({importSuccess.skippedCount} duplicate rows skipped.)
                    </span>
                  )}
                  Updated {selectedAccount?.name} balance:{" "}
                  <strong>
                    {formatCurrency(importSuccess.newBalance)}
                  </strong>
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2 w-100 w-sm-auto">
              <button
                onClick={() => {
                  setFile(null);
                  setParsedRows([]);
                  setImportSuccess(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="btn btn-sm btn-light border rounded-btn fw-bold px-3 py-2 text-dark flex-grow-1 flex-sm-grow-0"
              >
                Import Another
              </button>
              <Link
                href="/transactions"
                className="btn btn-sm btn-primary rounded-btn fw-bold px-3 py-2 d-inline-flex align-items-center justify-content-center gap-1.5 shadow-sm flex-grow-1 flex-sm-grow-0 text-decoration-none"
              >
                View Transactions <ArrowRight style={{ width: "16px", height: "16px" }} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Target Account & File Upload Zone */}
      {!importSuccess && (
        <div className="row g-4">
          {/* Account Selector Card */}
          <div className="col-12 col-md-4">
            <div className="card rounded-card p-3 p-sm-4 border bg-surface shadow-sm h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Building2 className="text-primary" style={{ width: "20px", height: "20px" }} />
                  <h3 className="h6 fw-bold text-dark mb-0">1. Select Target Account</h3>
                </div>
                <p className="small text-secondary mb-3">
                  Choose the bank or wallet account to which these statement entries belong.
                </p>

                <label className="form-label small fw-semibold text-dark mb-1">
                  Bank / Wallet Account
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="form-select rounded-input small fw-medium"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({formatCurrency(acc.currentBalance)})
                    </option>
                  ))}
                </select>

                {selectedAccount && (
                  <div className="mt-3 p-2.5 bg-light rounded-btn border d-flex align-items-center justify-content-between">
                    <span className="small text-secondary">Current Balance:</span>
                    <span className="small fw-bold text-dark">
                      {formatCurrency(selectedAccount.currentBalance)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-top small text-secondary" style={{ fontSize: "11px" }}>
                💡 Supports HDFC, SBI, ICICI, Kotak, Axis, Paytm, or generic CSV/Excel statements.
              </div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="col-12 col-md-8">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="card rounded-card p-4 p-sm-5 border-2 border-dashed bg-surface shadow-sm text-center d-flex flex-column align-items-center justify-content-center cursor-pointer h-100"
              style={{ minHeight: "220px", cursor: "pointer" }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="d-none"
              />
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center mb-3"
                style={{ width: "56px", height: "56px" }}
              >
                {parsing ? (
                  <span className="spinner-border text-primary" role="status" aria-hidden="true" />
                ) : (
                  <UploadCloud style={{ width: "28px", height: "28px" }} />
                )}
              </div>

              <h3 className="h6 fw-bold text-dark mb-1">
                {file ? file.name : "Click or drag & drop bank statement"}
              </h3>
              <p className="small text-secondary mb-0" style={{ maxWidth: "380px" }}>
                Supports <strong>.CSV, .XLSX, and .XLS</strong> files. Date,
                Amount, Narration, and Debit/Credit columns are auto-detected.
              </p>

              {file && (
                <span className="mt-3 badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-1.5 small fw-semibold d-inline-flex align-items-center gap-1">
                  <Check style={{ width: "14px", height: "14px" }} /> File Loaded ({(file.size / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review & Edit Grid */}
      {parsedRows.length > 0 && !importSuccess && (
        <div className="card rounded-card border bg-surface shadow-sm overflow-hidden">
          {/* Header & Batch Controls */}
          <div className="p-3 p-sm-4 border-bottom d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 bg-light">
            <div>
              <h3 className="h6 fw-bold text-dark d-flex align-items-center gap-2 mb-1">
                <FileSpreadsheet className="text-primary" style={{ width: "20px", height: "20px" }} />
                Review & Categorize Transactions
              </h3>
              <p className="small text-secondary mb-0">
                Review suggested categories, toggle transactions, or uncheck any rows you do not wish to import.
              </p>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  onClick={() => setFilterType("ALL")}
                  className={`btn btn-sm fw-bold ${
                    filterType === "ALL"
                      ? "btn-primary shadow-sm"
                      : "btn-light border text-secondary"
                  }`}
                >
                  All ({parsedRows.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("EXPENSE")}
                  className={`btn btn-sm fw-bold ${
                    filterType === "EXPENSE"
                      ? "btn-danger shadow-sm"
                      : "btn-light border text-secondary"
                  }`}
                >
                  Expenses
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType("INCOME")}
                  className={`btn btn-sm fw-bold ${
                    filterType === "INCOME"
                      ? "btn-success shadow-sm"
                      : "btn-light border text-secondary"
                  }`}
                >
                  Income
                </button>
              </div>

              <button
                type="button"
                onClick={() => toggleSelectAll(selectedRows.length !== parsedRows.length)}
                className="btn btn-sm btn-light border rounded-btn fw-bold text-secondary"
              >
                {selectedRows.length === parsedRows.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>

          {/* Metrics ribbon */}
          <div className="row g-0 border-bottom text-center bg-surface">
            <div className="col-6 col-sm-3 p-3 border-end">
              <span className="small text-secondary d-block">Selected Rows</span>
              <p className="fw-bold text-dark mb-0 small">
                {selectedRows.length} / {parsedRows.length}
              </p>
            </div>
            <div className="col-6 col-sm-3 p-3 border-end">
              <span className="small text-secondary d-block">Total Outflow (Debit)</span>
              <p className="fw-bold text-danger mb-0 small">
                -{formatCurrency(totalDebit)}
              </p>
            </div>
            <div className="col-6 col-sm-3 p-3 border-end">
              <span className="small text-secondary d-block">Total Inflow (Credit)</span>
              <p className="fw-bold text-success mb-0 small">
                +{formatCurrency(totalCredit)}
              </p>
            </div>
            <div className="col-6 col-sm-3 p-3">
              <span className="small text-secondary d-block">Net Impact</span>
              <p
                className={`fw-bold mb-0 small ${
                  totalCredit >= totalDebit ? "text-success" : "text-danger"
                }`}
              >
                {totalCredit >= totalDebit ? "+" : ""}
                {formatCurrency(totalCredit - totalDebit)}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive" style={{ maxHeight: "460px" }}>
            <table className="table table-hover align-middle mb-0 small">
              <thead className="table-light sticky-top">
                <tr>
                  <th className="text-center" style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={selectedRows.length === parsedRows.length && parsedRows.length > 0}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="form-check-input mt-0"
                    />
                  </th>
                  <th style={{ width: "120px" }}>Date</th>
                  <th>Description / Narration</th>
                  <th style={{ width: "110px" }}>Type</th>
                  <th className="text-end" style={{ width: "130px" }}>Amount</th>
                  <th style={{ width: "200px" }}>Category</th>
                  <th className="text-center" style={{ width: "50px" }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const typeCats = categories.filter((c) => c.type === row.type);

                  return (
                    <tr
                      key={row.id}
                      className={!row.selected ? "opacity-50" : ""}
                    >
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => toggleRow(row.id)}
                          className="form-check-input mt-0"
                        />
                      </td>
                      <td className="text-secondary text-nowrap">
                        {row.date ? row.date.toLocaleDateString() : row.rawDate}
                      </td>
                      <td className="fw-semibold text-dark text-truncate" style={{ maxWidth: "240px" }} title={row.description}>
                        {row.description}
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill ${
                            row.type === "INCOME"
                              ? "bg-success-subtle text-success border border-success-subtle"
                              : "bg-danger-subtle text-danger border border-danger-subtle"
                          }`}
                        >
                          {row.type}
                        </span>
                      </td>
                      <td
                        className={`text-end fw-bold text-nowrap ${
                          row.type === "INCOME" ? "text-success" : "text-danger"
                        }`}
                      >
                        {row.type === "INCOME" ? "+" : "-"}
                        {formatCurrency(row.amount)}
                      </td>
                      <td>
                        <select
                          value={row.suggestedCategoryId || ""}
                          onChange={(e) => updateRowCategory(row.id, e.target.value)}
                          disabled={!row.selected}
                          className="form-select form-select-sm rounded-btn small"
                        >
                          <option value="">-- Uncategorized --</option>
                          {typeCats.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          className="btn btn-sm btn-link text-secondary p-0 text-decoration-none"
                          title="Remove row"
                        >
                          <Trash2 style={{ width: "16px", height: "16px" }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Bar */}
          <div className="p-3 p-sm-4 bg-light border-top d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
            <div className="small text-secondary">
              Target: <strong className="text-dark">{selectedAccount?.name}</strong> •{" "}
              {selectedRows.length} transaction(s) ready to import
            </div>

            <div className="d-flex align-items-center gap-2 w-100 w-sm-auto">
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setParsedRows([]);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                disabled={importing}
                className="btn btn-sm btn-light border rounded-btn fw-bold px-3 py-2 text-dark flex-grow-1 flex-sm-grow-0"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={importing || selectedRows.length === 0}
                className="btn btn-sm btn-primary rounded-btn fw-bold px-4 py-2 d-inline-flex align-items-center justify-content-center gap-2 shadow-sm flex-grow-1 flex-sm-grow-0"
              >
                {importing ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Check style={{ width: "16px", height: "16px" }} />
                    <span>Import {selectedRows.length} Transactions</span>
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

