import prisma from "@/lib/db/prisma";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
} from "date-fns";

export type ReportPeriod = "THIS_WEEK" | "THIS_MONTH" | "LAST_MONTH" | "THIS_YEAR" | "CUSTOM";

export async function getFinancialReports(
  familyId: string,
  period: ReportPeriod = "THIS_MONTH",
  customStart?: string,
  customEnd?: string
) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case "THIS_WEEK":
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      endDate = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case "LAST_MONTH":
      const prevMonth = subMonths(now, 1);
      startDate = startOfMonth(prevMonth);
      endDate = endOfMonth(prevMonth);
      break;
    case "THIS_YEAR":
      startDate = startOfYear(now);
      endDate = endOfYear(now);
      break;
    case "CUSTOM":
      startDate = customStart ? new Date(customStart) : startOfMonth(now);
      endDate = customEnd ? new Date(customEnd) : endOfMonth(now);
      break;
    case "THIS_MONTH":
    default:
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
  }

  const [family, transactions] = await Promise.all([
    prisma.family.findUnique({
      where: { id: familyId },
      select: { name: true },
    }),
    prisma.transaction.findMany({
      where: {
        familyId,
        date: { gte: startDate, lte: endDate },
        deletedAt: null,
      },
      include: {
        category: true,
        account: true,
        member: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  let totalIncome = 0;
  let totalExpense = 0;

  const categoryMap: Record<string, { name: string; color: string; icon: string; amount: number }> = {};
  const memberMap: Record<string, { name: string; amount: number }> = {};
  const accountMap: Record<string, { name: string; amount: number }> = {};

  for (const t of transactions) {
    if (t.type === "TRANSFER") continue;

    const amt = Number(t.amount);
    if (t.type === "INCOME") {
      totalIncome += amt;
    } else {
      totalExpense += amt;

      // Category breakdown
      if (t.categoryId && t.category) {
        if (!categoryMap[t.categoryId]) {
          categoryMap[t.categoryId] = {
            name: t.category.name,
            color: t.category.color,
            icon: t.category.icon,
            amount: 0,
          };
        }
        categoryMap[t.categoryId].amount += amt;
      }

      // Member breakdown
      const mName = t.member.user.name;
      if (!memberMap[mName]) {
        memberMap[mName] = { name: mName, amount: 0 };
      }
      memberMap[mName].amount += amt;

      // Account breakdown
      const accName = t.account?.name || "Unassigned";
      if (!accountMap[accName]) {
        accountMap[accName] = { name: accName, amount: 0 };
      }
      accountMap[accName].amount += amt;
    }
  }

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  // Timeline series (daily if <= 31 days, monthly if longer)
  const isDaily = period === "THIS_WEEK" || period === "THIS_MONTH" || period === "LAST_MONTH";
  const timeline: { label: string; income: number; expense: number }[] = [];

  // Single-pass O(N) aggregation into map to avoid O(Days * Transactions) nested loop
  const dateBucketMap = new Map<string, { income: number; expense: number }>();
  for (const t of transactions) {
    if (t.type === "TRANSFER") continue;
    const key = format(new Date(t.date), isDaily ? "yyyy-MM-dd" : "yyyy-MM");
    const bucket = dateBucketMap.get(key) || { income: 0, expense: 0 };
    const amt = Number(t.amount);
    if (t.type === "INCOME") {
      bucket.income += amt;
    } else {
      bucket.expense += amt;
    }
    dateBucketMap.set(key, bucket);
  }

  if (isDaily) {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    for (const d of days) {
      const dKey = format(d, "yyyy-MM-dd");
      const dLabel = format(d, "dd MMM");
      const bucket = dateBucketMap.get(dKey) || { income: 0, expense: 0 };

      timeline.push({
        label: dLabel,
        income: bucket.income,
        expense: bucket.expense,
      });
    }
  } else {
    const months = eachMonthOfInterval({ start: startDate, end: endDate });
    for (const m of months) {
      const mKey = format(m, "yyyy-MM");
      const mLabel = format(m, "MMM yyyy");
      const bucket = dateBucketMap.get(mKey) || { income: 0, expense: 0 };

      timeline.push({
        label: mLabel,
        income: bucket.income,
        expense: bucket.expense,
      });
    }
  }

  const categoryBreakdown = Object.values(categoryMap).map((cat) => ({
    ...cat,
    percentage: totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0,
  })).sort((a, b) => b.amount - a.amount);

  const memberBreakdown = Object.values(memberMap).map((m) => ({
    ...m,
    percentage: totalExpense > 0 ? Math.round((m.amount / totalExpense) * 100) : 0,
  })).sort((a, b) => b.amount - a.amount);

  const accountBreakdown = Object.values(accountMap).sort((a, b) => b.amount - a.amount);

  // Top 5 largest expenses
  const topTransactions = transactions
    .filter((t) => t.type === "EXPENSE")
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5)
    .map((t) => ({
      date: format(new Date(t.date), "dd MMM yyyy"),
      description: t.description || "Expense",
      category: t.category?.name || "General",
      amount: Number(t.amount),
    }));

  return {
    familyName: family?.name || "Family",
    period,
    startDate,
    endDate,
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    timeline,
    categoryBreakdown,
    memberBreakdown,
    accountBreakdown,
    topTransactions,
    transactionCount: transactions.length,
  };
}
