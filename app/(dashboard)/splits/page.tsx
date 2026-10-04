import { Metadata } from "next";
import { SettlementHub } from "@/components/splits/SettlementHub";

export const metadata: Metadata = {
  title: "Family Splits & Settlements | Family Finance",
  description: "Track shared household expenses and settle balances between family members.",
};

export default function SplitsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Family Splits &amp; Settlements
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track shared household bills, see who owes whom, and settle balances seamlessly.
        </p>
      </div>

      <SettlementHub />
    </div>
  );
}
