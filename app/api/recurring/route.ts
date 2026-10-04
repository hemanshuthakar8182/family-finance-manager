import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import {
  getRecurringTransactions,
  createRecurringTransaction,
} from "@/lib/services/recurring.service";

export async function GET() {
  try {
    const user = await requireAuth();
    const data = await getRecurringTransactions(user.familyId);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load recurring transactions" },
      { status: 400 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    if (!body.amount || Number(body.amount) <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }
    if (!body.categoryId) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    const created = await createRecurringTransaction(
      user.familyId,
      user.memberId,
      {
        type: body.type || "EXPENSE",
        amount: Number(body.amount),
        categoryId: body.categoryId,
        accountId: body.accountId || null,
        frequency: body.frequency || "MONTHLY",
        startDate: body.startDate || new Date().toISOString(),
        endDate: body.endDate || null,
      }
    );

    return NextResponse.json(created);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create recurring transaction" },
      { status: 400 }
    );
  }
}
