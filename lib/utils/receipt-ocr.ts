import { recognize } from "tesseract.js";

export interface OCRResult {
  amount?: number;
  date?: Date;
  merchant?: string;
  rawText: string;
}

/**
 * Scan a receipt image using Tesseract OCR and extract key transaction fields
 */
export async function scanReceiptImage(
  imageSource: File | Blob | string,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    const result = await recognize(imageSource, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text" && onProgress && typeof m.progress === "number") {
          onProgress(Math.round(m.progress * 100));
        }
      },
    });

    const text = result.data.text || "";
    const parsed = parseReceiptText(text);

    return {
      ...parsed,
      rawText: text,
    };
  } catch (err: any) {
    console.error("OCR Scanning failed:", err);
    throw new Error(err.message || "Could not read text from receipt image.");
  }
}

/**
 * Heuristics and regex extraction for Amount, Date, and Merchant
 */
export function parseReceiptText(text: string): {
  amount?: number;
  date?: Date;
  merchant?: string;
} {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let amount: number | undefined;
  let date: Date | undefined;
  let merchant: string | undefined;

  // 1. Merchant: Look in the top 4 lines for store/vendor name
  for (let i = 0; i < Math.min(lines.length, 4); i++) {
    const l = lines[i];
    const lower = l.toLowerCase();
    // Skip generic headers
    if (
      lower.includes("tax invoice") ||
      lower.includes("bill") ||
      lower.includes("receipt") ||
      lower.includes("welcome") ||
      lower.includes("cash memo") ||
      lower.includes("gstin") ||
      l.length < 3
    ) {
      continue;
    }
    // Clean unwanted characters
    merchant = l.replace(/[^a-zA-Z0-9 &.'-]/g, "").trim();
    if (merchant.length >= 3) break;
  }

  // 2. Amount: Look for lines with Total, Grand Total, Net Amount, Paid, Due, Amount
  const amountRegex = /(?:total|grand\s*total|net\s*amount|total\s*due|paid|amount|bill\s*amount)\s*[:=-]?\s*(?:[₹$RsINR\s]*)\s*([0-9]{1,3}(?:,[0-9]{2,3})*(?:\.[0-9]{2})|[0-9]+(?:\.[0-9]{2})?)/i;

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    const match = line.match(amountRegex);
    if (match && match[1]) {
      const cleanNum = parseFloat(match[1].replace(/,/g, ""));
      if (!isNaN(cleanNum) && cleanNum > 0) {
        amount = cleanNum;
        break;
      }
    }
  }

  // Fallback amount: find the highest plausible monetary number
  if (!amount) {
    const allNums = text.match(/\b([0-9]+(?:\.[0-9]{2}))\b/g);
    if (allNums && allNums.length > 0) {
      const valid = allNums
        .map((n) => parseFloat(n))
        .filter((n) => !isNaN(n) && n > 0 && n < 500000);
      if (valid.length > 0) {
        amount = Math.max(...valid);
      }
    }
  }

  // 3. Date: Look for DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, or DD Mon YYYY
  const dateRegex = /\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b/;
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      let year = parseInt(match[3], 10);
      if (year < 100) year += 2000;

      // Reasonable date bounds
      if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year >= 2000 && year <= 2030) {
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) {
          date = d;
          break;
        }
      }
    }
  }

  return { amount, date, merchant };
}
