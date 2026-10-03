import prisma from "@/lib/db/prisma";
import { TransactionInput, TransactionFilterInput } from "@/lib/validations/transaction";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Prisma } from "@prisma/client";

export async function createTransaction(
  familyId: string,
  memberId: string,
  input: TransactionInput
) {
  const amount = new Prisma.Decimal(input.amount);
  const date = new Date(input.date);

  // Validate category belongs to family
  const category = await prisma.category.findFirst({
    where: { id: input.categoryId, familyId, isArchived: false },
  });
  if (!category) {
    throw new Error("Invalid category selected.");
  }

  // Validate account if specified
  if (input.accountId) {
    const account = await prisma.account.findFirst({
      where: { id: input.accountId, familyId, isArchived: false },
    });
    if (!account) {
      throw new Error("Invalid account selected.");
    }
  }

  // Atomically create transaction and update account balance
  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        familyId,
        memberId,
        type: input.type,
        amount,
        categoryId: input.categoryId,
        accountId: input.accountId || null,
        date,
        description: input.description?.trim() || null,
        notes: input.notes?.trim() || null,
      },
      include: {
        category: true,
        account: true,
        member: {
          include: {
            user: {
              select: { name: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (input.accountId) {
      const balanceDelta = input.type === "INCOME" ? amount : amount.negated();
      await tx.account.update({
        where: { id: input.accountId },
        data: {
          currentBalance: {
            increment: balanceDelta,
          },
        },
      });
    }

    return transaction;
  });
}

export async function updateTransaction(
  familyId: string,
  userMemberId: string,
  userRole: "ADMIN" | "MEMBER",
  transactionId: string,
  input: TransactionInput
) {
  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, familyId },
  });

  if (!existing) {
    throw new Error("Transaction not found.");
  }

  // Check authorization
  if (userRole !== "ADMIN" && existing.memberId !== userMemberId) {
    throw new Error("You do not have permission to edit this transaction.");
  }

  const newAmount = new Prisma.Decimal(input.amount);
  const newDate = new Date(input.date);

  return await prisma.$transaction(async (tx) => {
    // Revert old account balance effect
    if (existing.accountId) {
      const revertDelta =
        existing.type === "INCOME" ? existing.amount.negated() : existing.amount;
      await tx.account.update({
        where: { id: existing.accountId },
        data: { currentBalance: { increment: revertDelta } },
      });
    }

    // Apply new account balance effect
    if (input.accountId) {
      const applyDelta = input.type === "INCOME" ? newAmount : newAmount.negated();
      await tx.account.update({
        where: { id: input.accountId },
        data: { currentBalance: { increment: applyDelta } },
      });
    }

    const updated = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        type: input.type,
        amount: newAmount,
        categoryId: input.categoryId,
        accountId: input.accountId || null,
        date: newDate,
        description: input.description?.trim() || null,
        notes: input.notes?.trim() || null,
      },
      include: {
        category: true,
        account: true,
        member: {
          include: {
            user: { select: { name: true, email: true, avatarUrl: true } },
          },
        },
      },
    });

    return updated;
  });
}

export async function deleteTransaction(
  familyId: string,
  userMemberId: string,
  userRole: "ADMIN" | "MEMBER",
  transactionId: string
) {
  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, familyId },
  });

  if (!existing) {
    throw new Error("Transaction not found.");
  }

  if (userRole !== "ADMIN" && existing.memberId !== userMemberId) {
    throw new Error("You do not have permission to delete this transaction.");
  }

  return await prisma.$transaction(async (tx) => {
    if (existing.accountId) {
      const revertDelta =
        existing.type === "INCOME" ? existing.amount.negated() : existing.amount;
      await tx.account.update({
        where: { id: existing.accountId },
        data: { currentBalance: { increment: revertDelta } },
      });
    }

    return await tx.transaction.delete({
      where: { id: transactionId },
    });
  });
}

export async function getTransactions(
  familyId: string,
  filters: Partial<TransactionFilterInput> = {}
) {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.TransactionWhereInput = {
    familyId,
  };

  if (filters.type && filters.type !== "ALL") {
    where.type = filters.type;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.accountId) {
    where.accountId = filters.accountId;
  }

  if (filters.memberId) {
    where.memberId = filters.memberId;
  }

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.date.lte = endOfDay(new Date(filters.endDate));
    }
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    where.amount = {};
    if (filters.minAmount !== undefined) {
      where.amount.gte = new Prisma.Decimal(filters.minAmount);
    }
    if (filters.maxAmount !== undefined) {
      where.amount.lte = new Prisma.Decimal(filters.maxAmount);
    }
  }

  if (filters.search) {
    const q = filters.search.trim();
    where.OR = [
      { description: { contains: q } },
      { notes: { contains: q } },
      { category: { name: { contains: q } } },
      { account: { name: { contains: q } } },
      { member: { user: { name: { contains: q } } } },
    ];
  }

  const [totalCount, items] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      skip,
      take: limit,
      include: {
        category: true,
        account: true,
        member: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
      },
    }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: skip + items.length < totalCount,
    },
  };
}

export async function getDashboardMetrics(familyId: string, referenceDate = new Date()) {
  const startMonth = startOfMonth(referenceDate);
  const endMonth = endOfMonth(referenceDate);
  const todayStart = startOfDay(referenceDate);
  const todayEnd = endOfDay(referenceDate);
  const sixMonthsAgoStart = startOfMonth(subMonths(referenceDate, 5));

  // Run all 4 queries in parallel rather than 9 sequential round-trips
  const [monthTransactions, accounts, recentTransactions, pastSixMonthTxs] = await Promise.all([
    // 1. Current month transactions with category and user
    prisma.transaction.findMany({
      where: {
        familyId,
        date: { gte: startMonth, lte: endMonth },
      },
      include: {
        category: true,
        member: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
        },
      },
    }),

    // 2. Active accounts for balances
    prisma.account.findMany({
      where: { familyId, isArchived: false },
    }),

    // 3. Recent 6 transactions
    prisma.transaction.findMany({
      where: { familyId },
      orderBy: { date: "desc" },
      take: 6,
      include: {
        category: true,
        account: true,
        member: {
          include: { user: { select: { name: true } } },
        },
      },
    }),

    // 4. Past 6 months in a SINGLE query instead of 6 sequential queries
    prisma.transaction.findMany({
      where: {
        familyId,
        date: { gte: sixMonthsAgoStart, lte: endMonth },
      },
      select: {
        date: true,
        type: true,
        amount: true,
      },
    }),
  ]);

  // Calculate current month totals
  let totalIncome = 0;
  let totalExpense = 0;
  let todayExpense = 0;

  const categoryTotals: Record<string, { name: string; color: string; icon: string; amount: number }> = {};
  const memberTotals: Record<string, { name: string; amount: number }> = {};

  for (const t of monthTransactions) {
    const amt = Number(t.amount);
    const tDate = new Date(t.date);

    if (t.type === "INCOME") {
      totalIncome += amt;
    } else {
      totalExpense += amt;

      // Today's spending check
      if (tDate >= todayStart && tDate <= todayEnd) {
        todayExpense += amt;
      }

      // Category breakdown
      if (!categoryTotals[t.categoryId]) {
        categoryTotals[t.categoryId] = {
          name: t.category.name,
          color: t.category.color,
          icon: t.category.icon,
          amount: 0,
        };
      }
      categoryTotals[t.categoryId].amount += amt;

      // Member breakdown
      const memberName = t.member.user.name;
      if (!memberTotals[memberName]) {
        memberTotals[memberName] = { name: memberName, amount: 0 };
      }
      memberTotals[memberName].amount += amt;
    }
  }

  // Total balance across accounts
  const currentBalance = accounts.reduce((acc, a) => acc + Number(a.currentBalance), 0);

  // Group 6-month data in-memory (O(N) single pass)
  const monthMap = new Map<string, { income: number; expense: number }>();
  for (let i = 5; i >= 0; i--) {
    const mDate = subMonths(referenceDate, i);
    const key = `${mDate.getFullYear()}-${mDate.getMonth()}`;
    monthMap.set(key, { income: 0, expense: 0 });
  }

  for (const tx of pastSixMonthTxs) {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = monthMap.get(key);
    if (bucket) {
      const amt = Number(tx.amount);
      if (tx.type === "INCOME") bucket.income += amt;
      else bucket.expense += amt;
    }
  }

  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const mDate = subMonths(referenceDate, i);
    const key = `${mDate.getFullYear()}-${mDate.getMonth()}`;
    const val = monthMap.get(key) || { income: 0, expense: 0 };
    monthlyTrend.push({
      month: mDate.toLocaleString("default", { month: "short" }),
      income: val.income,
      expense: val.expense,
    });
  }

  return {
    totalIncome,
    totalExpense,
    currentBalance,
    todayExpense,
    categoryBreakdown: Object.values(categoryTotals).sort((a, b) => b.amount - a.amount),
    memberBreakdown: Object.values(memberTotals).sort((a, b) => b.amount - a.amount),
    recentTransactions,
    monthlyTrend,
    accounts,
  };
}
