import { Metadata } from "next";
import { SettlementHub } from "@/components/splits/SettlementHub";

export const metadata: Metadata = {
  title: "Family Splits & Settlements | Family Finance",
  description: "Track shared household expenses and settle balances between family members.",
};

export default function SplitsPage() {
  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h1 className="h4 fw-bold text-dark mb-1">
          Family Splits &amp; Settlements
        </h1>
        <p className="small text-secondary mb-0">
          Track shared household bills, see who owes whom, and settle balances seamlessly.
        </p>
      </div>

      <SettlementHub />
    </div>
  );
}

