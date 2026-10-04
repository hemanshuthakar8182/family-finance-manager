import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ParsedRow {
  id: string;
  rawDate: string;
  date: Date | null;
  description: string;
  type: "EXPENSE" | "INCOME";
  amount: number;
  balance?: number;
  suggestedCategoryId?: string;
  suggestedCategoryName?: string;
  isDuplicate?: boolean;
  selected: boolean;
}

export interface CategorySummary {
  id: string;
  name: string;
  type: "EXPENSE" | "INCOME";
}

// Common keywords for merchant & category detection
const CATEGORY_KEYWORD_RULES: Record<string, string[]> = {
  "Food & Dining": [
    "swiggy", "zomato", "mcdonald", "starbucks", "kfc", "domino", "restaurant",
    "cafe", "pizza", "burger", "food", "eatclub", "blinkit", "zepto", "instamart"
  ],
  "Groceries": [
    "dmart", "supermarket", "grocery", "bigbasket", "nature's basket",
    "reliance fresh", "kirana", "provision"
  ],
  "Transportation": [
    "uber", "ola", "rapido", "metro", "fuel", "petrol", "diesel", "indian oil",
    "bharat petroleum", "hpcl", "shell", "fastag", "toll", "irctc", "indigo", "air india"
  ],
  "Utilities": [
    "electricity", "power", "bescom", "torrent", "water", "gas", "adani",
    "airtel", "jio", "vodafone", "vi", "broadband", "recharge", "billdesk", "utility"
  ],
  "Shopping": [
    "amazon", "flipkart", "myntra", "ajio", "zara", "h&m", "croma", "vijay sales",
    "nykaa", "meesho", "retail", "mart"
  ],
  "Entertainment": [
    "netflix", "prime video", "spotify", "hotstar", "bookmyshow", "cinema",
    "pvr", "inox", "youtube", "game", "movie"
  ],
  "Healthcare": [
    "apollo", "pharmacy", "netmeds", "1mg", "hospital", "clinic", "doctor",
    "medicals", "lab", "diagnostics", "care"
  ],
  "Housing": [
    "rent", "society", "maintenance", "landlord", "flat", "apartment"
  ],
  "Salary": [
    "salary", "payroll", "stipend", "wages", "direct deposit"
  ],
  "Investment": [
    "zerodha", "groww", "upstox", "mutual fund", "sip", "dividend", "interest credited"
  ],
};

/**
 * Clean and parse currency string into number
 * Handles Indian and international comma formats e.g. "1,25,000.50", " ₹ 450.00 ", "(300.00)"
 */
export function cleanAmount(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return Math.abs(val);

  let str = String(val).trim();
  // Check if negative in parentheses (e.g., "(120.00)")
  const isParenNegative = /^\(.*\)$/.test(str);
  str = str.replace(/[₹$,() ]/g, "").trim();

  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  return isParenNegative ? -Math.abs(num) : Math.abs(num);
}

/**
 * Flexible date parser for standard bank formats:
 * DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, MM/DD/YYYY, DD MMM YYYY (e.g. 15 Jan 2024)
 */
export function parseBankDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const s = String(dateStr).trim();

  // Try standard Date constructor first
  const stdDate = new Date(s);
  if (!isNaN(stdDate.getTime()) && s.includes("-") && s.length >= 8) {
    return stdDate;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // DD MMM YYYY (e.g. "15 Jan 2024", "15-JAN-2024")
  const textDateMatch = s.match(/^(\d{1,2})[\/\-\s]+([A-Za-z]{3,9})[\/\-\s]+(\d{2,4})/);
  if (textDateMatch) {
    const day = parseInt(textDateMatch[1], 10);
    const monthStr = textDateMatch[2].toLowerCase();
    let year = parseInt(textDateMatch[3], 10);
    if (year < 100) year += 2000;

    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const monthIdx = months.findIndex((m) => monthStr.startsWith(m));
    if (monthIdx !== -1) {
      const d = new Date(year, monthIdx, day);
      if (!isNaN(d.getTime())) return d;
    }
  }

  return isNaN(stdDate.getTime()) ? null : stdDate;
}

/**
 * Find matching category based on transaction description text
 */
export function matchCategory(
  description: string,
  categories: CategorySummary[],
  type: "EXPENSE" | "INCOME"
): { id?: string; name?: string } {
  const desc = description.toLowerCase();

  // 1. Try matching keywords from our rules
  for (const [catName, keywords] of Object.entries(CATEGORY_KEYWORD_RULES)) {
    if (keywords.some((kw) => desc.includes(kw))) {
      // Find matching category in the user's actual categories
      const found = categories.find(
        (c) =>
          c.type === type &&
          (c.name.toLowerCase().includes(catName.toLowerCase()) ||
            catName.toLowerCase().includes(c.name.toLowerCase()))
      );
      if (found) {
        return { id: found.id, name: found.name };
      }
    }
  }

  // 2. Direct name match with any existing category
  const directMatch = categories.find(
    (c) => c.type === type && desc.includes(c.name.toLowerCase())
  );
  if (directMatch) {
    return { id: directMatch.id, name: directMatch.name };
  }

  // 3. Fallback to first matching type default
  const defaultCat = categories.find((c) => c.type === type);
  return defaultCat ? { id: defaultCat.id, name: defaultCat.name } : {};
}

/**
 * Parse raw 2D array of rows from CSV or Excel into normalized ParsedRow objects
 */
export function parseStatementData(
  rows: any[][],
  categories: CategorySummary[]
): ParsedRow[] {
  if (!rows || rows.length < 2) return [];

  // 1. Find Header Row (row containing words like "date", "description", "narration", "amount", "withdrawal", "deposit")
  let headerIndex = -1;
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const rowStr = rows[i].map((c) => String(c || "").toLowerCase()).join(" ");
    if (
      rowStr.includes("date") &&
      (rowStr.includes("particular") ||
        rowStr.includes("description") ||
        rowStr.includes("narration") ||
        rowStr.includes("amount") ||
        rowStr.includes("debit") ||
        rowStr.includes("withdrawal"))
    ) {
      headerIndex = i;
      break;
    }
  }

  // If no header detected, assume row 0
  if (headerIndex === -1) headerIndex = 0;

  const header = rows[headerIndex].map((c) => String(c || "").trim().toLowerCase());

  // Helper to find column index by synonyms
  const findCol = (synonyms: string[]) =>
    header.findIndex((h) => synonyms.some((s) => h.includes(s)));

  const dateIdx = findCol(["txn date", "transaction date", "value date", "date"]);
  const descIdx = findCol(["narration", "description", "particular", "remarks", "detail"]);
  const debitIdx = findCol(["debit", "withdrawal", "dr", "paid out"]);
  const creditIdx = findCol(["credit", "deposit", "cr", "paid in"]);
  const amountIdx = findCol(["amount", "txn amount", "net amount"]);
  const typeIdx = findCol(["type", "dr/cr", "cr/dr"]);
  const balanceIdx = findCol(["balance", "closing balance"]);

  const result: ParsedRow[] = [];

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;

    const rawDate = dateIdx !== -1 ? String(row[dateIdx] || "").trim() : "";
    const parsedDate = parseBankDate(rawDate);
    if (!rawDate && !parsedDate) continue; // Skip non-data rows or footers

    let description = descIdx !== -1 ? String(row[descIdx] || "").trim() : "Bank Transaction";
    // Clean excessive spaces
    description = description.replace(/\s+/g, " ");

    let type: "EXPENSE" | "INCOME" = "EXPENSE";
    let amount = 0;

    // Check separate debit and credit columns first
    if (debitIdx !== -1 && creditIdx !== -1) {
      const debitVal = cleanAmount(row[debitIdx]);
      const creditVal = cleanAmount(row[creditIdx]);

      if (creditVal > 0) {
        type = "INCOME";
        amount = creditVal;
      } else if (debitVal > 0) {
        type = "EXPENSE";
        amount = debitVal;
      }
    } else if (amountIdx !== -1) {
      // Single amount column with Type or sign
      const rawAmt = row[amountIdx];
      const amtNum = cleanAmount(rawAmt);
      amount = amtNum;

      if (typeIdx !== -1) {
        const tStr = String(row[typeIdx] || "").toLowerCase();
        if (tStr.includes("cr") || tStr.includes("credit") || tStr.includes("dep")) {
          type = "INCOME";
        } else {
          type = "EXPENSE";
        }
      } else {
        // If amount was negative
        if (typeof rawAmt === "number" && rawAmt < 0) {
          type = "EXPENSE";
        } else if (String(rawAmt).includes("-") || String(rawAmt).startsWith("(")) {
          type = "EXPENSE";
        }
      }
    }

    if (amount <= 0) continue; // Skip zero/empty rows

    const balance = balanceIdx !== -1 ? cleanAmount(row[balanceIdx]) : undefined;

    // Match suggested category
    const cat = matchCategory(description, categories, type);

    result.push({
      id: `row-${i}-${Date.now()}`,
      rawDate,
      date: parsedDate,
      description,
      type,
      amount,
      balance,
      suggestedCategoryId: cat.id,
      suggestedCategoryName: cat.name,
      selected: true,
    });
  }

  return result;
}

/**
 * Parse an uploaded File (CSV or Excel) into ParsedRow array
 */
export async function parseStatementFile(
  file: File,
  categories: CategorySummary[]
): Promise<ParsedRow[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".csv")) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const rows = results.data as any[][];
            resolve(parseStatementData(rows, categories));
          } catch (err) {
            reject(err);
          }
        },
        error: (err) => reject(err),
      });
    });
  } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    return parseStatementData(rows, categories);
  }

  throw new Error("Unsupported file format. Please upload a .csv, .xlsx, or .xls file.");
}
