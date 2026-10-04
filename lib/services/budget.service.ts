import prisma from "@/lib/db/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { Prisma } from "@prisma/client";

export async function getFamilyBudgets(familyId: string, month: number, year: number) {
  const budgets = await prisma.budget.findMany({
    where: { familyId, month, year },
    include: { category: true },
  });

  const refDate = new Date(year, month - 1, 1);
  const mStart = startOfMonth(refDate);
  const mEnd = endOfMonth(refDate);

  // Get actual expenses for these categories in the month
  const expenses = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      familyId,
      type: "EXPENSE",
      deletedAt: null,
      date: { gte: mStart, lte: mEnd },
    },
    _sum: { amount: true },
  });

  const expenseMap = new Map<string, number>();
  for (const e of expenses) {
    if (e.categoryId) {
      expenseMap.set(e.categoryId, Number(e._sum.amount || 0));
    }
  }

  return budgets.map((b) => {
    const budgetAmount = Number(b.amount);
    const spent = expenseMap.get(b.categoryId) || 0;
    const remaining = Math.max(0, budgetAmount - spent);
    const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

    let status: "SAFE" | "WARNING" | "EXCEEDED" = "SAFE";
    if (percentage > 100) status = "EXCEEDED";
    else if (percentage >= 80) status = "WARNING";

    return {
      id: b.id,
      category: b.category,
      budgetAmount,
      spent,
      remaining,
      percentage,
      status,
      month,
      year,
    };
  });
}

export async function upsertBudget(
  familyId: string,
  categoryId: string,
  month: number,
  year: number,
  amount: number
) {
  const decAmount = new Prisma.Decimal(amount);
  return await prisma.budget.upsert({
    where: {
      familyId_categoryId_month_year: {
        familyId,
        categoryId,
        month,
        year,
      },
    },
    create: {
      familyId,
      categoryId,
      month,
      year,
      amount: decAmount,
    },
    update: {
      amount: decAmount,
    },
  });
}

export async function deleteBudget(familyId: string, budgetId: string) {
  return await prisma.budget.deleteMany({
    where: { id: budgetId, familyId },
  });
}
