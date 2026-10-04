import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import {
  toggleRecurringActive,
  updateRecurringTransaction,
  deleteRecurringTransaction,
} from "@/lib/services/recurring.service";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if ("isActive" in body && Object.keys(body).length === 1) {
      await toggleRecurringActive(user.familyId, params.id, Boolean(body.isActive));
      return NextResponse.json({ success: true });
    }

    const updated = await updateRecurringTransaction(user.familyId, params.id, body);
    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update recurring transaction" },
      { status: 400 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const updated = await updateRecurringTransaction(user.familyId, params.id, body);
    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update recurring transaction" },
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
    await deleteRecurringTransaction(user.familyId, params.id);
    return NextResponse.json({ success: true, message: "Recurring schedule deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete recurring transaction" },
      { status: 400 }
    );
  }
}
