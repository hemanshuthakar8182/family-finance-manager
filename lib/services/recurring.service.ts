import prisma from "@/lib/db/prisma";
import { Prisma, Frequency, TransactionType } from "@prisma/client";
import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter } from "date-fns";

export interface RecurringInput {
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId?: string | null;
  frequency: Frequency;
  startDate: string | Date;
  endDate?: string | Date | null;
}

export async function getRecurringTransactions(familyId: string) {
  return await prisma.recurringTransaction.findMany({
    where: { familyId },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      account: true,
      member: {
        include: { user: { select: { name: true } } },
      },
    },
  });
}

export async function createRecurringTransaction(
  familyId: string,
  memberId: string,
  input: RecurringInput
) {
  const decAmount = new Prisma.Decimal(input.amount);
  const start = new Date(input.startDate);
  const end = input.endDate ? new Date(input.endDate) : null;

  return await prisma.recurringTransaction.create({
    data: {
      familyId,
      memberId,
      type: input.type,
      amount: decAmount,
      categoryId: input.categoryId,
      accountId: input.accountId || null,
      frequency: input.frequency,
      startDate: start,
      endDate: end,
      isActive: true,
    },
    include: {
      category: true,
      account: true,
    },
  });
}

export async function toggleRecurringActive(familyId: string, id: string, isActive: boolean) {
  return await prisma.recurringTransaction.updateMany({
    where: { id, familyId },
    data: { isActive },
  });
}

export async function updateRecurringTransaction(
  familyId: string,
  id: string,
  input: Partial<RecurringInput>
) {
  const data: any = {};
  if (input.type) data.type = input.type;
  if (input.amount !== undefined) data.amount = new Prisma.Decimal(input.amount);
  if (input.categoryId !== undefined) data.categoryId = input.categoryId;
  if (input.accountId !== undefined) data.accountId = input.accountId || null;
  if (input.frequency) data.frequency = input.frequency;
  if (input.startDate) data.startDate = new Date(input.startDate);
  if (input.endDate !== undefined) data.endDate = input.endDate ? new Date(input.endDate) : null;

  return await prisma.recurringTransaction.updateMany({
    where: { id, familyId },
    data,
  });
}

export async function deleteRecurringTransaction(familyId: string, id: string) {
  return await prisma.recurringTransaction.deleteMany({
    where: { id, familyId },
  });
}

export function getNextDueDate(
  frequency: Frequency,
  startDate: Date,
  lastRunAt: Date | null
): Date {
  if (!lastRunAt) return new Date(startDate);

  switch (frequency) {
    case "DAILY":
      return addDays(new Date(lastRunAt), 1);
    case "WEEKLY":
      return addWeeks(new Date(lastRunAt), 1);
    case "YEARLY":
      return addYears(new Date(lastRunAt), 1);
    case "MONTHLY":
    default:
      return addMonths(new Date(lastRunAt), 1);
  }
}

export async function processDueRecurring(familyId?: string) {
  const now = new Date();

  const where: Prisma.RecurringTransactionWhereInput = {
    isActive: true,
  };
  if (familyId) where.familyId = familyId;

  const rules = await prisma.recurringTransaction.findMany({
    where,
    include: { category: true, account: true },
  });

  const generated = [];

  for (const rule of rules) {
    // Check end date expiry
    if (rule.endDate && isAfter(now, new Date(rule.endDate))) {
      await prisma.recurringTransaction.update({
        where: { id: rule.id },
        data: { isActive: false },
      });
      continue;
    }

    const nextDue = getNextDueDate(rule.frequency, rule.startDate, rule.lastRunAt);

    // If due date is on or before today
    if (isBefore(nextDue, now) || nextDue.toDateString() === now.toDateString()) {
      const created = await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
          data: {
            familyId: rule.familyId,
            memberId: rule.memberId,
            type: rule.type,
            amount: rule.amount,
            categoryId: rule.categoryId,
            accountId: rule.accountId,
            date: now,
            description: `Auto-generated: ${rule.category?.name || "Recurring"}`,
            notes: `Recurring transaction schedule (${rule.frequency})`,
          },
        });

        // Update account balance
        if (rule.accountId) {
          const delta =
            rule.type === "INCOME" ? rule.amount : rule.amount.negated();
          await tx.account.update({
            where: { id: rule.accountId },
            data: { currentBalance: { increment: delta } },
          });
        }

        // Update lastRunAt on rule
        await tx.recurringTransaction.update({
          where: { id: rule.id },
          data: { lastRunAt: now },
        });

        return transaction;
      });

      generated.push(created);
    }
  }

  return { processed: generated.length, items: generated };
}
