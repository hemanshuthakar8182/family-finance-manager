import { format, isToday, isYesterday } from "date-fns";

/**
 * Format currency in Indian Rupee (INR) standard format (e.g. ₹1,50,000.00 or ₹450)
 */
export function formatCurrency(
  amount: number | string | { toNumber?: () => number } | null | undefined,
  showDecimals = false
): string {
  if (amount === null || amount === undefined) return "₹0";

  let num: number;
  if (typeof amount === "object" && typeof amount.toNumber === "function") {
    num = amount.toNumber();
  } else {
    num = Number(amount);
  }

  if (isNaN(num)) return "₹0";

  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(num);
}

/**
 * Format financial amount without currency symbol (for inputs or raw charts)
 */
export function formatAmountNumber(
  amount: number | string | { toNumber?: () => number } | null | undefined
): number {
  if (amount === null || amount === undefined) return 0;
  if (typeof amount === "object" && typeof amount.toNumber === "function") {
    return amount.toNumber();
  }
  const num = Number(amount);
  return isNaN(num) ? 0 : num;
}

/**
 * Friendly relative date formatting:
 * "Today, 4:20 PM"
 * "Yesterday, 10:30 AM"
 * "03 Oct 2026"
 */
export function formatTransactionDate(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  if (isToday(date)) {
    return `Today, ${format(date, "h:mm a")}`;
  }
  if (isYesterday(date)) {
    return `Yesterday, ${format(date, "h:mm a")}`;
  }
  return format(date, "dd MMM yyyy, h:mm a");
}

export function formatShortDate(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";
  return format(date, "dd MMM yyyy");
}

export function formatMonthYear(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";
  return format(date, "MMMM yyyy");
}
