import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { transactionSchema } from "@/lib/validations/transaction";
import { updateTransaction, deleteTransaction } from "@/lib/services/transaction.service";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validated = transactionSchema.parse(body);

    const updated = await updateTransaction(
      user.familyId,
      user.memberId,
      user.role,
      params.id,
      validated
    );

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to update transaction" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    await deleteTransaction(
      user.familyId,
      user.memberId,
      user.role,
      params.id
    );

    return NextResponse.json({ success: true, message: "Transaction deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete transaction" },
      { status: 400 }
    );
  }
}
