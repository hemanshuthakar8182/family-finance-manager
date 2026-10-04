import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { restoreTransaction } from "@/lib/services/transaction.service";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    await restoreTransaction(
      user.familyId,
      user.memberId,
      user.role,
      params.id
    );

    return NextResponse.json({
      success: true,
      message: "Transaction restored successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to restore transaction" },
      { status: 400 }
    );
  }
}
