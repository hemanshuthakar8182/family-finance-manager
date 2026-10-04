import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { processDueRecurring } from "@/lib/services/recurring.service";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    // If authenticated via user session, run for their family; otherwise run globally (for webhook/cron)
    const result = await processDueRecurring(user?.familyId);
    return NextResponse.json({
      success: true,
      processed: result.processed,
      message: `Processed ${result.processed} due recurring transaction(s).`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to process recurring transactions" },
      { status: 500 }
    );
  }
}
