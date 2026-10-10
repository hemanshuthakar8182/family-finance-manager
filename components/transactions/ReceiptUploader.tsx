"use client";

import React, { useState, useRef } from "react";
import {
  Receipt,
  X,
  RefreshCw,
  Sparkles,
  FileText,
  Camera,
} from "lucide-react";
import { scanReceiptImage, OCRResult } from "@/lib/utils/receipt-ocr";
import { formatCurrency } from "@/lib/utils/currency";

interface ReceiptUploaderProps {
  receiptUrl?: string | null;
  onReceiptChange: (url: string | null) => void;
  onOcrExtracted?: (result: {
    amount?: number;
    date?: string;
    merchant?: string;
  }) => void;
}

export function ReceiptUploader({
  receiptUrl,
  onReceiptChange,
  onOcrExtracted,
}: ReceiptUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [ocrData, setOcrData] = useState<OCRResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(receiptUrl || null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File exceeds maximum size of 5MB.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      // Upload file
      const res = await fetch("/api/upload/receipt", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload receipt");
      }

      setPreviewUrl(data.url);
      onReceiptChange(data.url);

      // If it's an image, run OCR scanning automatically
      if (file.type.startsWith("image/")) {
        runOCR(file);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err.message || "Failed to upload receipt image");
    } finally {
      setUploading(false);
    }
  };

  const runOCR = async (file: File) => {
    try {
      setScanning(true);
      setScanProgress(0);

      const result = await scanReceiptImage(file, (progress) => {
        setScanProgress(progress);
      });

      setOcrData(result);

      if (onOcrExtracted && (result.amount || result.date || result.merchant)) {
        onOcrExtracted({
          amount: result.amount,
          date: result.date ? result.date.toISOString().split("T")[0] : undefined,
          merchant: result.merchant,
        });
      }
    } catch (err) {
      console.warn("OCR scanning error:", err);
    } finally {
      setScanning(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setOcrData(null);
    onReceiptChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isPdf = previewUrl?.toLowerCase().endsWith(".pdf");

  return (
    <div className="d-flex flex-column gap-2">
      {/* Standard file picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileSelect}
        className="d-none"
      />
      {/* Mobile camera direct capture */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="d-none"
      />

      {!previewUrl ? (
        <div className="p-3 border border-2 border-dashed rounded-card bg-light d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2">
            <div 
              className="rounded-btn bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary flex-shrink-0"
              style={{ width: "34px", height: "34px" }}
            >
              {uploading ? (
                <RefreshCw style={{ width: "16px", height: "16px" }} className="spinner-border spinner-border-sm" />
              ) : (
                <Receipt style={{ width: "16px", height: "16px" }} />
              )}
            </div>
            <div>
              <p className="small fw-semibold text-dark mb-0">
                {uploading ? "Uploading receipt..." : "Attach Receipt / Bill"}
              </p>
              <p className="text-secondary mb-0" style={{ fontSize: "10px" }}>
                Auto-reads amount, date & merchant with AI OCR
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-1 ms-auto ms-sm-0 flex-shrink-0">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="btn btn-sm btn-light border text-primary fw-semibold d-inline-flex align-items-center gap-1 py-1 px-2.5 small"
              style={{ fontSize: "11px" }}
            >
              <Camera style={{ width: "14px", height: "14px" }} />
              <span>Camera</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-sm btn-light border text-dark fw-semibold py-1 px-2.5 small"
              style={{ fontSize: "11px" }}
            >
              Browse
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-light rounded-card border d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3 overflow-hidden">
            {isPdf ? (
              <div 
                className="bg-danger-subtle text-danger d-flex align-items-center justify-content-center rounded flex-shrink-0"
                style={{ width: "40px", height: "40px" }}
              >
                <FileText style={{ width: "20px", height: "20px" }} />
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="rounded object-fit-cover border flex-shrink-0"
                style={{ width: "40px", height: "40px" }}
              />
            )}

            <div className="overflow-hidden">
              <div className="d-flex align-items-center gap-1.5">
                <span className="small fw-bold text-dark text-truncate">
                  Receipt Attached
                </span>
                <span className="badge bg-success-subtle text-success rounded-pill py-0 px-1" style={{ fontSize: "9px" }}>
                  Ready
                </span>
              </div>
              <p className="text-secondary text-truncate mb-0" style={{ fontSize: "10px" }}>
                {previewUrl.split("/").pop()}
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-1 flex-shrink-0">
            {scanning && (
              <span className="text-primary fw-bold d-flex align-items-center gap-1 me-2" style={{ fontSize: "10px" }}>
                <RefreshCw style={{ width: "12px", height: "12px" }} className="spinner-border spinner-border-sm" /> {scanProgress}%
              </span>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="btn btn-sm btn-link text-secondary p-1"
              title="Remove receipt"
            >
              <X style={{ width: "16px", height: "16px" }} />
            </button>
          </div>
        </div>
      )}

      {/* OCR Detected Banner */}
      {ocrData && (ocrData.amount || ocrData.merchant) && (
        <div className="p-2 bg-success-subtle border border-success-subtle rounded-btn d-flex align-items-center justify-content-between small">
          <div className="d-flex align-items-center gap-1.5 text-success-emphasis fw-medium">
            <Sparkles style={{ width: "14px", height: "14px" }} className="text-primary" />
            <span style={{ fontSize: "11px" }}>
              Auto-filled:{" "}
              {ocrData.amount && <strong>{formatCurrency(ocrData.amount)}</strong>}
              {ocrData.merchant && ` • ${ocrData.merchant}`}
            </span>
          </div>
          <span className="badge bg-success text-white rounded-pill py-0 px-1" style={{ fontSize: "9px" }}>
            OCR Matched
          </span>
        </div>
      )}
    </div>
  );
}
