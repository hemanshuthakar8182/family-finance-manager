export interface DefaultAccount {
  name: string;
  type: "CASH" | "BANK" | "UPI" | "CREDIT_CARD" | "WALLET";
  openingBalance: number;
}

export const DEFAULT_ACCOUNTS: DefaultAccount[] = [
  { name: "Cash", type: "CASH", openingBalance: 5000 },
  { name: "Primary Bank Account", type: "BANK", openingBalance: 25000 },
  { name: "UPI / PhonePe / GPay", type: "UPI", openingBalance: 2000 },
  { name: "Credit Card", type: "CREDIT_CARD", openingBalance: 0 },
];
