import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/validations/auth";
import { updateUserPassword } from "@/lib/services/auth.service";

export async function POST(req: Request) {
  try {
    const sessionUser = await requireAuth();
    const body = await req.json();
    const validated = changePasswordSchema.parse(body);

    await updateUserPassword(
      sessionUser.id,
      validated.currentPassword,
      validated.newPassword
    );

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to update password" },
      { status: 400 }
    );
  }
}
