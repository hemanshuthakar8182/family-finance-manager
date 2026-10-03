import { NextResponse } from "next/server";
import { requireAuth, requireFamilyAdmin } from "@/lib/auth/session";
import { getFamilyBudgets, upsertBudget, deleteBudget } from "@/lib/services/budget.service";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const now = new Date();
    const month = Number(searchParams.get("month")) || now.getMonth() + 1;
    const year = Number(searchParams.get("year")) || now.getFullYear();

    const budgets = await getFamilyBudgets(user.familyId, month, year);
    return NextResponse.json(budgets);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch budgets" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireFamilyAdmin();
    const body = await req.json();

    const { categoryId, month, year, amount } = body;
    if (!categoryId || !month || !year || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invalid budget payload" }, { status: 400 });
    }

    const budget = await upsertBudget(
      user.familyId,
      categoryId,
      Number(month),
      Number(year),
      Number(amount)
    );

    return NextResponse.json(budget, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save budget" },
      { status: 400 }
    );
  }
}
