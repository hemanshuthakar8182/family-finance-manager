import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getDashboardMetrics } from "@/lib/services/transaction.service";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const refDateStr = searchParams.get("date");
    const refDate = refDateStr ? new Date(refDateStr) : new Date();

    const memberId = user.role !== "ADMIN" ? user.memberId : undefined;
    const metrics = await getDashboardMetrics(user.familyId, refDate, memberId);
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load dashboard metrics" },
      { status: 500 }
    );
  }
}
