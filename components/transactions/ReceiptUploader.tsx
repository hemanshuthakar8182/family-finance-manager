"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Receipt,
  Scan,
  X,
  Check,
  RefreshCw,
  Sparkles,
  FileText,
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
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!previewUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-3 border-2 border-dashed border-border hover:border-primary/50 rounded-card transition-colors flex items-center justify-between cursor-pointer bg-slate-50/50 hover:bg-slate-50 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              {uploading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Receipt className="w-4 h-4" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                {uploading ? "Uploading receipt..." : "Attach Receipt / Bill"}
              </p>
              <p className="text-[10px] text-slate-500">
                Auto-reads amount, date & merchant with AI OCR
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-primary px-2.5 py-1 bg-white border border-border rounded-btn group-hover:border-primary/30 shadow-2xs">
            Browse
          </span>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 rounded-card border border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {isPdf ? (
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={previewUrl}
                alt="Receipt preview"
                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
              />
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 truncate">
                  Receipt Attached
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Ready
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {previewUrl.split("/").pop()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {scanning && (
              <span className="text-[10px] font-bold text-primary flex items-center gap-1 mr-2">
                <RefreshCw className="w-3 h-3 animate-spin" /> {scanProgress}%
              </span>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white transition-colors"
              title="Remove receipt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* OCR Detected Banner */}
      {ocrData && (ocrData.amount || ocrData.merchant) && (
        <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-1.5 text-emerald-950 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>
              Auto-filled:{" "}
              {ocrData.amount && <strong>{formatCurrency(ocrData.amount)}</strong>}
              {ocrData.merchant && ` • ${ocrData.merchant}`}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
            OCR Matched
          </span>
        </div>
      )}
    </div>
  );
}
