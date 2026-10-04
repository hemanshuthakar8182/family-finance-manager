import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getFamilySplitLedger, createExpenseSplit } from "@/lib/services/split.service";
import { z } from "zod";

const createSplitSchema = z.object({
  transactionId: z.string().min(1),
  totalAmount: z.number().positive(),
  shares: z.array(
    z.object({
      memberId: z.string().min(1),
      amount: z.number().positive(),
    })
  ).min(1),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const ledger = await getFamilySplitLedger(user.familyId, user.memberId);
    return NextResponse.json(ledger);
  } catch (err: any) {
    console.error("GET /api/splits error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load split ledger" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const parsed = createSplitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const split = await createExpenseSplit({
      transactionId: parsed.data.transactionId,
      familyId: user.familyId,
      paidById: user.memberId,
      totalAmount: parsed.data.totalAmount,
      shares: parsed.data.shares,
      notes: parsed.data.notes,
    });

    return NextResponse.json({ success: true, split }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/splits error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create expense split" },
      { status: 500 }
    );
  }
}
