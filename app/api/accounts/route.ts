import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { accountSchema } from "@/lib/validations/account";
import { getAccounts, createAccount } from "@/lib/services/account.service";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("includeArchived") === "true";

    const accounts = await getAccounts(user.familyId, includeArchived);
    return NextResponse.json(accounts);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validated = accountSchema.parse(body);

    const account = await createAccount(user.familyId, validated);
    return NextResponse.json(account, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 400 }
    );
  }
}
