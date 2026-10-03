import { NextResponse } from "next/server";
import { requireAuth, requireFamilyAdmin } from "@/lib/auth/session";
import { getFamily, updateFamily } from "@/lib/services/family.service";
import { updateFamilySchema } from "@/lib/validations/family";

export async function GET() {
  try {
    const user = await requireAuth();
    const family = await getFamily(user.familyId);
    return NextResponse.json(family);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch family" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireFamilyAdmin();
    const body = await req.json();
    const validated = updateFamilySchema.parse(body);

    const updated = await updateFamily(user.familyId, validated);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update family" },
      { status: 400 }
    );
  }
}
