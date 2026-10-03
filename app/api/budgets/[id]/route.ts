import { NextResponse } from "next/server";
import { requireFamilyAdmin } from "@/lib/auth/session";
import { deleteBudget } from "@/lib/services/budget.service";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireFamilyAdmin();
    await deleteBudget(user.familyId, params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete budget" },
      { status: 400 }
    );
  }
}
