import { NextResponse } from "next/server";
import { requireAuth, requireFamilyAdmin } from "@/lib/auth/session";
import { getFamilyMembers, addMemberToFamily } from "@/lib/services/family.service";
import { addMemberSchema } from "@/lib/validations/family";

export async function GET() {
  try {
    const user = await requireAuth();
    const members = await getFamilyMembers(user.familyId);
    return NextResponse.json(members);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireFamilyAdmin();
    const body = await req.json();
    const validated = addMemberSchema.parse(body);

    const member = await addMemberToFamily(user.familyId, validated);
    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to add member" },
      { status: 400 }
    );
  }
}
