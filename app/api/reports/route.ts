import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getFinancialReports, ReportPeriod } from "@/lib/services/report.service";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const period = (searchParams.get("period") as ReportPeriod) || "THIS_MONTH";
    const customStart = searchParams.get("customStart") || undefined;
    const customEnd = searchParams.get("customEnd") || undefined;

    const memberId = user.role !== "ADMIN" ? user.memberId : undefined;
    const data = await getFinancialReports(user.familyId, period, customStart, customEnd, memberId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}
