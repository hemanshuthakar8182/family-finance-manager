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

  // Validate category if specified
  if (input.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: input.categoryId, familyId, isArchived: false },
    });
    if (!category) {
      throw new Error("Invalid category selected.");
    }
  }

  // Validate source account if specified
  if (input.accountId) {
    const account = await prisma.account.findFirst({
      where: { id: input.accountId, familyId, isArchived: false },
    });
    if (!account) {
      throw new Error("Invalid source account selected.");
    }
  }

  // Validate destination account for transfers
  if (input.type === "TRANSFER") {
    if (!input.accountId || !input.toAccountId) {
      throw new Error("Both source and destination accounts are required for a transfer.");
    }
    if (input.accountId === input.toAccountId) {
      throw new Error("Source and destination accounts must be different.");
    }
    const toAccount = await prisma.account.findFirst({
      where: { id: input.toAccountId, familyId, isArchived: false },
    });
    if (!toAccount) {
      throw new Error("Invalid destination account selected.");
    }
  }

  // Atomically create transaction and update account balance(s)
  return await prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        familyId,
        memberId,
        type: input.type,
        amount,
        categoryId: input.categoryId || null,
        accountId: input.accountId || null,
        toAccountId: input.toAccountId || null,
        date,
        description: input.description?.trim() || null,
        notes: input.notes?.trim() || null,
        receiptUrl: input.receiptUrl || null,
      },
      include: {
        category: true,
        account: true,
        toAccount: true,
        member: {
          include: {
            user: {
              select: { name: true, email: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (input.type === "TRANSFER") {
      // Source account debited
      if (input.accountId) {
        await tx.account.update({
          where: { id: input.accountId },
          data: { currentBalance: { decrement: amount } },
        });
      }
      // Destination account credited
      if (input.toAccountId) {
        await tx.account.update({
          where: { id: input.toAccountId },
          data: { currentBalance: { increment: amount } },
        });
      }
    } else if (input.accountId) {
      const balanceDelta = input.type === "INCOME" ? amount : amount.negated();
      await tx.account.update({
        where: { id: input.accountId },
        data: { currentBalance: { increment: balanceDelta } },
      });
    }

    // Check budget alert for expense
    let budgetAlert = null;
    if (input.type === "EXPENSE" && input.categoryId) {
      const budget = await tx.budget.findFirst({
        where: {
          familyId,
          categoryId: input.categoryId,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        },
        include: { category: true },
      });

      if (budget) {
        const sumResult = await tx.transaction.aggregate({
          where: {
            familyId,
            categoryId: input.categoryId,
            type: "EXPENSE",
            deletedAt: null,
            date: { gte: startOfMonth(date), lte: endOfMonth(date) },
          },
          _sum: { amount: true },
        });

        const totalSpent = Number(sumResult._sum.amount || 0);
        const budgetLimit = Number(budget.amount);
        const percentage = budgetLimit > 0 ? Math.round((totalSpent / budgetLimit) * 100) : 0;

        if (percentage >= 80) {
          budgetAlert = {
            categoryName: budget.category.name,
            spent: totalSpent,
            limit: budgetLimit,
            percentage,
            status: percentage >= 100 ? "EXCEEDED" : "WARNING",
          };
        }
      }
    }

    return { ...transaction, budgetAlert };
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
    where: { id: transactionId, familyId, deletedAt: null },
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
    // 1. Revert old account balance effects
    if (existing.type === "TRANSFER") {
      if (existing.accountId) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { currentBalance: { increment: existing.amount } },
        });
      }
      if (existing.toAccountId) {
        await tx.account.update({
          where: { id: existing.toAccountId },
          data: { currentBalance: { decrement: existing.amount } },
        });
      }
    } else if (existing.accountId) {
      const revertDelta =
        existing.type === "INCOME" ? existing.amount.negated() : existing.amount;
      await tx.account.update({
        where: { id: existing.accountId },
        data: { currentBalance: { increment: revertDelta } },
      });
    }

    // 2. Apply new account balance effects
    if (input.type === "TRANSFER") {
      if (input.accountId) {
        await tx.account.update({
          where: { id: input.accountId },
          data: { currentBalance: { decrement: newAmount } },
        });
      }
      if (input.toAccountId) {
        await tx.account.update({
          where: { id: input.toAccountId },
          data: { currentBalance: { increment: newAmount } },
        });
      }
    } else if (input.accountId) {
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
        categoryId: input.categoryId || null,
        accountId: input.accountId || null,
        toAccountId: input.toAccountId || null,
        date: newDate,
        description: input.description?.trim() || null,
        notes: input.notes?.trim() || null,
        receiptUrl: input.receiptUrl !== undefined ? input.receiptUrl : undefined,
      },
      include: {
        category: true,
        account: true,
        toAccount: true,
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
    where: { id: transactionId, familyId, deletedAt: null },
  });

  if (!existing) {
    throw new Error("Transaction not found.");
  }

  if (userRole !== "ADMIN" && existing.memberId !== userMemberId) {
    throw new Error("You do not have permission to delete this transaction.");
  }

  return await prisma.$transaction(async (tx) => {
    // Revert account balances
    if (existing.type === "TRANSFER") {
      if (existing.accountId) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { currentBalance: { increment: existing.amount } },
        });
      }
      if (existing.toAccountId) {
        await tx.account.update({
          where: { id: existing.toAccountId },
          data: { currentBalance: { decrement: existing.amount } },
        });
      }
    } else if (existing.accountId) {
      const revertDelta =
        existing.type === "INCOME" ? existing.amount.negated() : existing.amount;
      await tx.account.update({
        where: { id: existing.accountId },
        data: { currentBalance: { increment: revertDelta } },
      });
    }

    // Soft delete to support Undo action
    return await tx.transaction.update({
      where: { id: transactionId },
      data: { deletedAt: new Date() },
    });
  });
}

export async function restoreTransaction(
  familyId: string,
  userMemberId: string,
  userRole: "ADMIN" | "MEMBER",
  transactionId: string
) {
  const existing = await prisma.transaction.findFirst({
    where: { id: transactionId, familyId, deletedAt: { not: null } },
  });

  if (!existing) {
    throw new Error("Deleted transaction not found.");
  }

  if (userRole !== "ADMIN" && existing.memberId !== userMemberId) {
    throw new Error("You do not have permission to restore this transaction.");
  }

  return await prisma.$transaction(async (tx) => {
    // Re-apply account balances
    if (existing.type === "TRANSFER") {
      if (existing.accountId) {
        await tx.account.update({
          where: { id: existing.accountId },
          data: { currentBalance: { decrement: existing.amount } },
        });
      }
      if (existing.toAccountId) {
        await tx.account.update({
          where: { id: existing.toAccountId },
          data: { currentBalance: { increment: existing.amount } },
        });
      }
    } else if (existing.accountId) {
      const applyDelta =
        existing.type === "INCOME" ? existing.amount : existing.amount.negated();
      await tx.account.update({
        where: { id: existing.accountId },
        data: { currentBalance: { increment: applyDelta } },
      });
    }

    return await tx.transaction.update({
      where: { id: transactionId },
      data: { deletedAt: null },
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
    deletedAt: null,
  };

  if (filters.type && filters.type !== "ALL") {
    where.type = filters.type as any;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.memberId) {
    where.memberId = filters.memberId;
  }

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = startOfDay(new Date(filters.startDate));
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

  const andConditions: Prisma.TransactionWhereInput[] = [];

  if (filters.accountId) {
    andConditions.push({
      OR: [
        { accountId: filters.accountId },
        { toAccountId: filters.accountId },
      ],
    });
  }

  if (filters.search) {
    const q = filters.search.trim();
    andConditions.push({
      OR: [
        { description: { contains: q } },
        { notes: { contains: q } },
        { category: { name: { contains: q } } },
        { account: { name: { contains: q } } },
        { toAccount: { name: { contains: q } } },
        { member: { user: { name: { contains: q } } } },
      ],
    });
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
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
        toAccount: true,
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

  const [monthTransactions, accounts, recentTransactions, pastSixMonthTxs] = await Promise.all([
    // 1. Current month transactions
    prisma.transaction.findMany({
      where: {
        familyId,
        date: { gte: startMonth, lte: endMonth },
        deletedAt: null,
      },
      include: {
        category: true,
        account: true,
        toAccount: true,
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
      where: { familyId, deletedAt: null },
      orderBy: { date: "desc" },
      take: 6,
      include: {
        category: true,
        account: true,
        toAccount: true,
        member: {
          include: { user: { select: { name: true } } },
        },
      },
    }),

    // 4. Past 6 months
    prisma.transaction.findMany({
      where: {
        familyId,
        date: { gte: sixMonthsAgoStart, lte: endMonth },
        deletedAt: null,
      },
      select: {
        date: true,
        type: true,
        amount: true,
      },
    }),
  ]);

  let totalIncome = 0;
  let totalExpense = 0;
  let todayExpense = 0;

  const categoryTotals: Record<string, { name: string; color: string; icon: string; amount: number }> = {};
  const memberTotals: Record<string, { name: string; amount: number }> = {};

  for (const t of monthTransactions) {
    // Account transfers do not count toward total household Income or Expense!
    if (t.type === "TRANSFER") continue;

    const amt = Number(t.amount);
    const tDate = new Date(t.date);

    if (t.type === "INCOME") {
      totalIncome += amt;
    } else {
      totalExpense += amt;

      if (tDate >= todayStart && tDate <= todayEnd) {
        todayExpense += amt;
      }

      if (t.categoryId && t.category) {
        if (!categoryTotals[t.categoryId]) {
          categoryTotals[t.categoryId] = {
            name: t.category.name,
            color: t.category.color,
            icon: t.category.icon,
            amount: 0,
          };
        }
        categoryTotals[t.categoryId].amount += amt;
      }

      const memberName = t.member.user.name;
      if (!memberTotals[memberName]) {
        memberTotals[memberName] = { name: memberName, amount: 0 };
      }
      memberTotals[memberName].amount += amt;
    }
  }

  const currentBalance = accounts.reduce((acc, a) => acc + Number(a.currentBalance), 0);

  const monthMap = new Map<string, { income: number; expense: number }>();
  for (let i = 5; i >= 0; i--) {
    const mDate = subMonths(referenceDate, i);
    const key = `${mDate.getFullYear()}-${mDate.getMonth()}`;
    monthMap.set(key, { income: 0, expense: 0 });
  }

  for (const tx of pastSixMonthTxs) {
    if (tx.type === "TRANSFER") continue;
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
