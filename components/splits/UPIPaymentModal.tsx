"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import {
  QrCode,
  Smartphone,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  CheckCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: {
    debtor: { id: string; name: string };
    creditor: { id: string; name: string };
    amount: number;
  };
  onSuccess: () => void;
}

export function UPIPaymentModal({
  isOpen,
  onClose,
  debt,
  onSuccess,
}: UPIPaymentModalProps) {
  const { showToast } = useToast();

  const [settleAmount, setSettleAmount] = useState<string>(debt.amount.toString());
  const [upiId, setUpiId] = useState<string>(() => {
    // Generate clean suggested UPI handle from creditor name
    const sanitized = debt.creditor.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return `${sanitized || "family"}@upi`;
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"QR" | "MANUAL">("QR");

  const numericAmount = parseFloat(settleAmount) || debt.amount;

  // Construct standard NPCI UPI URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    debt.creditor.name
  )}&am=${numericAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
    `Settlement: ${debt.debtor.name} to ${debt.creditor.name}`
  )}`;

  useEffect(() => {
    if (numericAmount > 0 && upiId) {
      QRCode.toDataURL(upiUri, {
        width: 240,
        margin: 1.5,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("QR Code Error:", err));
    }
  }, [upiUri, numericAmount, upiId]);

  const handleCopyUPI = async () => {
    try {
      await navigator.clipboard.writeText(upiUri);
      setIsCopied(true);
      showToast({ type: "success", title: "UPI Link Copied to Clipboard" });
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      showToast({ type: "info", title: "UPI URI", message: upiUri });
    }
  };

  const handleConfirmSettle = async () => {
    try {
      setIsSettling(true);
      const res = await fetch("/api/splits/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debtorMemberId: debt.debtor.id,
          creditorMemberId: debt.creditor.id,
          amount: numericAmount,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to settle debt");
      }

      showToast({
        type: "success",
        title: "✓ Settlement Recorded",
        message: `Settled ₹${numericAmount.toFixed(2)} between ${debt.debtor.name} and ${debt.creditor.name}.`,
      });

      onSuccess();
      onClose();
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settle Up Family Balance"
      description="Scan with any Indian UPI app or mark cash settled"
      maxWidth="md"
    >
      <div className="d-flex flex-column gap-3 pt-1">
        {/* Settlement Summary Pill */}
        <div className="p-3 bg-light rounded-card border small d-flex align-items-center justify-content-between">
          <div>
            <span className="fw-bold text-foreground">{debt.debtor.name}</span>
            <span className="text-secondary"> pays </span>
            <span className="fw-bold text-foreground">{debt.creditor.name}</span>
          </div>
          <CurrencyDisplay amount={numericAmount} size="md" type="DEFAULT" />
        </div>

        {/* Amount & UPI ID configuration */}
        <div className="row g-2">
          <div className="col-6">
            <label className="form-label small fw-semibold text-foreground mb-1">
              Settlement Amount (₹)
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              max={debt.amount}
              value={settleAmount}
              onChange={(e) => setSettleAmount(e.target.value)}
              className="form-control form-control-sm rounded-input fw-bold font-amount"
            />
          </div>

          <div className="col-6">
            <label className="form-label small fw-semibold text-foreground mb-1">
              Recipient UPI ID (VPA)
            </label>
            <input
              type="text"
              placeholder="e.g. name@okhdfcbank"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="form-control form-control-sm rounded-input font-monospace small"
            />
          </div>
        </div>

        {/* Tab Selection: UPI QR vs Manual */}
        <div className="btn-group w-100 p-1 bg-light rounded-btn border" role="group">
          <button
            type="button"
            onClick={() => setActiveTab("QR")}
            className={`btn btn-sm py-1.5 rounded-btn small fw-bold transition ${
              activeTab === "QR"
                ? "btn-primary text-white shadow-sm"
                : "btn-link text-secondary text-decoration-none"
            }`}
          >
            <QrCode style={{ width: "14px", height: "14px" }} className="me-1.5" />
            <span>Pay with UPI QR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("MANUAL")}
            className={`btn btn-sm py-1.5 rounded-btn small fw-bold transition ${
              activeTab === "MANUAL"
                ? "btn-primary text-white shadow-sm"
                : "btn-link text-secondary text-decoration-none"
            }`}
          >
            <ShieldCheck style={{ width: "14px", height: "14px" }} className="me-1.5" />
            <span>Cash / Bank Transfer</span>
          </button>
        </div>

        {/* ── Tab 1: UPI QR Mode ── */}
        {activeTab === "QR" && (
          <div className="d-flex flex-column align-items-center text-center p-3 rounded-card bg-surface border shadow-xs">
            {qrCodeUrl ? (
              <div className="p-2.5 bg-white rounded-3 border shadow-xs mb-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  style={{ width: "180px", height: "180px", display: "block" }}
                />
              </div>
            ) : (
              <div
                className="skeleton-shimmer mb-2 rounded-3"
                style={{ width: "180px", height: "180px" }}
              />
            )}

            <p className="small text-secondary mb-2" style={{ fontSize: "11px" }}>
              Scan using <strong>Google Pay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong>, or <strong>BHIM</strong>
            </p>

            <div className="d-flex align-items-center gap-2 w-100 justify-content-center">
              {/* Mobile Deep Link */}
              <a
                href={upiUri}
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 rounded-btn fw-semibold py-1.5 px-3 small"
              >
                <Smartphone style={{ width: "14px", height: "14px" }} />
                <span>Open in UPI App</span>
              </a>

              <button
                type="button"
                onClick={handleCopyUPI}
                className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1.5 rounded-btn text-secondary py-1.5 px-3 small"
              >
                {isCopied ? (
                  <CheckCheck style={{ width: "14px", height: "14px" }} className="text-success" />
                ) : (
                  <Copy style={{ width: "14px", height: "14px" }} />
                )}
                <span>{isCopied ? "Copied" : "Copy UPI URI"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Tab 2: Manual Cash / Bank Transfer ── */}
        {activeTab === "MANUAL" && (
          <div className="p-3 bg-light rounded-card border small text-secondary">
            <p className="mb-2 fw-semibold text-foreground">
              Direct settlement without QR code:
            </p>
            <ul className="mb-0 ps-3">
              <li>Use this if you already gave cash in hand or transferred via NEFT/IMPS.</li>
              <li>Clicking &quot;Confirm &amp; Record Settlement&quot; below will zero-out the debt on the family ledger.</li>
            </ul>
          </div>
        )}

        {/* Modal Actions */}
        <div className="modal-footer px-0 pb-0 pt-3 border-top mt-1 d-flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSettling}
            className="small"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleConfirmSettle}
            isLoading={isSettling}
            disabled={isSettling || !settleAmount || parseFloat(settleAmount) <= 0}
            className="flex-grow-1 fw-bold small shadow-sm gap-2"
          >
            <Check style={{ width: "16px", height: "16px" }} />
            <span>Confirm &amp; Record Settlement</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
