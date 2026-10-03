import prisma from "@/lib/db/prisma";
import { AccountInput } from "@/lib/validations/account";
import { Prisma } from "@prisma/client";

export async function getAccounts(familyId: string, includeArchived = false) {
  return await prisma.account.findMany({
    where: {
      familyId,
      ...(includeArchived ? {} : { isArchived: false }),
    },
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { transactions: true },
      },
    },
  });
}

export async function createAccount(familyId: string, input: AccountInput) {
  const opBal = new Prisma.Decimal(input.openingBalance || 0);
  return await prisma.account.create({
    data: {
      familyId,
      name: input.name.trim(),
      type: input.type,
      openingBalance: opBal,
      currentBalance: opBal,
    },
  });
}

export async function updateAccount(
  familyId: string,
  accountId: string,
  input: { name?: string; type?: any }
) {
  return await prisma.account.updateMany({
    where: { id: accountId, familyId },
    data: {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.type ? { type: input.type } : {}),
    },
  });
}

export async function archiveAccount(familyId: string, accountId: string) {
  return await prisma.account.updateMany({
    where: { id: accountId, familyId },
    data: { isArchived: true },
  });
}
