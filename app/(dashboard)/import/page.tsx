import { Metadata } from "next";
import { StatementImporter } from "@/components/import/StatementImporter";

export const metadata: Metadata = {
  title: "Import Bank Statement | Family Finance",
  description: "Upload and auto-categorize bank statements in CSV or Excel format.",
};

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Bank Statement Import
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Upload CSV or Excel statements to automatically detect and import transactions with smart categorization.
        </p>
      </div>

      <StatementImporter />
    </div>
  );
}
