import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { archiveAccount, updateAccount } from "@/lib/services/account.service";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (body.action === "archive") {
      await archiveAccount(user.familyId, params.id);
      return NextResponse.json({ success: true });
    }

    const updated = await updateAccount(user.familyId, params.id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update account" },
      { status: 400 }
    );
  }
}
