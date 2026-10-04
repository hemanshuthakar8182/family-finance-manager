import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { settleMemberDebt } from "@/lib/services/split.service";
import { z } from "zod";

const settleSchema = z.object({
  debtorMemberId: z.string().min(1),
  creditorMemberId: z.string().min(1),
  amount: z.number().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { familyId } = user;
    const body = await req.json();
    const parsed = settleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { debtorMemberId, creditorMemberId, amount } = parsed.data;

    const result = await settleMemberDebt(
      familyId,
      debtorMemberId,
      creditorMemberId,
      amount
    );

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error("POST /api/splits/settle error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to settle debt" },
      { status: 500 }
    );
  }
}
