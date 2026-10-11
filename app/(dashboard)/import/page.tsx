import { Metadata } from "next";
import { StatementImporter } from "@/components/import/StatementImporter";

export const metadata: Metadata = {
  title: "Import Bank Statement | Family Finance",
  description: "Upload and auto-categorize bank statements in CSV or Excel format.",
};

export default function ImportPage() {
  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h1 className="h4 fw-bold text-dark mb-1">
          Bank Statement Import
        </h1>
        <p className="small text-secondary mb-0">
          Upload CSV or Excel statements to automatically detect and import transactions with smart categorization.
        </p>
      </div>

      <StatementImporter />
    </div>
  );
}

