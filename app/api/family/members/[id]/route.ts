import { NextResponse } from "next/server";
import { requireFamilyAdmin } from "@/lib/auth/session";
import { updateMemberRole, deactivateMember } from "@/lib/services/family.service";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireFamilyAdmin();
    const body = await req.json();

    if (body.role) {
      await updateMemberRole(user.familyId, params.id, body.role);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update member" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireFamilyAdmin();
    await deactivateMember(user.familyId, params.id);
    return NextResponse.json({ success: true, message: "Member deactivated" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to deactivate member" },
      { status: 400 }
    );
  }
}
