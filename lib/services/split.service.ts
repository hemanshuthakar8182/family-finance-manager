import prisma from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export interface SplitShareInput {
  memberId: string;
  amount: number;
}

export interface CreateSplitInput {
  transactionId: string;
  familyId: string;
  paidById: string;
  totalAmount: number;
  shares: SplitShareInput[];
  notes?: string;
}

/**
 * Record an expense split for a given transaction
 */
export async function createExpenseSplit(input: CreateSplitInput) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the ExpenseSplit parent record
    const split = await tx.expenseSplit.create({
      data: {
        transactionId: input.transactionId,
        familyId: input.familyId,
        paidById: input.paidById,
        totalAmount: new Prisma.Decimal(input.totalAmount),
        notes: input.notes || null,
        createdAt: new Date(),
      },
    });

    // 2. Create the individual member shares
    for (const share of input.shares) {
      // If the share belongs to the payer themselves, it is already paid
      const isPayer = share.memberId === input.paidById;

      await tx.splitShare.create({
        data: {
          splitId: split.id,
          memberId: share.memberId,
          amount: new Prisma.Decimal(share.amount),
          isSettled: isPayer, // Payer's own share is settled immediately
          settledAt: isPayer ? new Date() : null,
          createdAt: new Date(),
        },
      });
    }

    return split;
  });
}

/**
 * Get the full family settlement ledger & net debt matrix
 */
export async function getFamilySplitLedger(familyId: string, currentMemberId?: string) {
  // 1. Fetch all splits with shares and members
  const splits = await prisma.expenseSplit.findMany({
    where: { familyId },
    include: {
      transaction: {
        select: {
          id: true,
          date: true,
          description: true,
          category: { select: { name: true, color: true } },
        },
      },
      paidBy: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
      shares: {
        include: {
          member: {
            include: {
              user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // 2. Fetch all unsettled shares to calculate pair-wise debts
  const unsettledShares = await prisma.splitShare.findMany({
    where: {
      split: { familyId },
      isSettled: false,
    },
    include: {
      split: {
        include: {
          paidBy: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
      },
      member: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });

  // 3. Compute directed debts map: "debtorId -> creditorId -> totalAmount"
  const directedDebts = new Map<string, Map<string, number>>();

  for (const s of unsettledShares) {
    const debtorId = s.memberId;
    const creditorId = s.split.paidById;
    if (debtorId === creditorId) continue;

    const amt = Number(s.amount);
    if (!directedDebts.has(debtorId)) {
      directedDebts.set(debtorId, new Map());
    }
    const debtorMap = directedDebts.get(debtorId)!;
    debtorMap.set(creditorId, (debtorMap.get(creditorId) || 0) + amt);
  }

  // 4. Net pairwise debts between members
  const memberDetails = new Map<string, { id: string; name: string }>();
  for (const s of unsettledShares) {
    memberDetails.set(s.memberId, {
      id: s.memberId,
      name: s.member.user.name,
    });
    memberDetails.set(s.split.paidById, {
      id: s.split.paidById,
      name: s.split.paidBy.user.name,
    });
  }

  // Find all pairs
  const allMemberIds = Array.from(memberDetails.keys());
  const nettedDebts: Array<{
    debtor: { id: string; name: string };
    creditor: { id: string; name: string };
    amount: number;
  }> = [];

  const visitedPairs = new Set<string>();

  for (let i = 0; i < allMemberIds.length; i++) {
    for (let j = i + 1; j < allMemberIds.length; j++) {
      const u1 = allMemberIds[i];
      const u2 = allMemberIds[j];
      const pairKey = [u1, u2].sort().join(":");
      if (visitedPairs.has(pairKey)) continue;
      visitedPairs.add(pairKey);

      const u1OwesU2 = directedDebts.get(u1)?.get(u2) || 0;
      const u2OwesU1 = directedDebts.get(u2)?.get(u1) || 0;

      const diff = u1OwesU2 - u2OwesU1;
      if (diff > 0.01) {
        nettedDebts.push({
          debtor: memberDetails.get(u1)!,
          creditor: memberDetails.get(u2)!,
          amount: Math.round(diff * 100) / 100,
        });
      } else if (diff < -0.01) {
        nettedDebts.push({
          debtor: memberDetails.get(u2)!,
          creditor: memberDetails.get(u1)!,
          amount: Math.round(Math.abs(diff) * 100) / 100,
        });
      }
    }
  }

  // 5. Calculate current user balance if memberId provided
  let youOwe = 0;
  let youAreOwed = 0;

  if (currentMemberId) {
    for (const debt of nettedDebts) {
      if (debt.debtor.id === currentMemberId) {
        youOwe += debt.amount;
      }
      if (debt.creditor.id === currentMemberId) {
        youAreOwed += debt.amount;
      }
    }
  }

  return {
    nettedDebts,
    userBalance: {
      youOwe,
      youAreOwed,
      netBalance: youAreOwed - youOwe,
    },
    splits: splits.map((s) => ({
      id: s.id,
      transactionId: s.transactionId,
      date: s.transaction.date,
      description: s.transaction.description || "Shared Expense",
      categoryName: s.transaction.category?.name || "General",
      totalAmount: Number(s.totalAmount),
      paidBy: {
        id: s.paidBy.id,
        name: s.paidBy.user.name,
      },
      shares: s.shares.map((sh) => ({
        id: sh.id,
        memberId: sh.memberId,
        memberName: sh.member.user.name,
        amount: Number(sh.amount),
        isSettled: sh.isSettled,
      })),
      createdAt: s.createdAt,
    })),
  };
}

/**
 * Settle up debts between debtor and creditor
 */
export async function settleMemberDebt(
  familyId: string,
  debtorMemberId: string,
  creditorMemberId: string,
  settleAmount?: number
) {
  return await prisma.$transaction(async (tx) => {
    // Fetch all unsettled shares where debtorMember owes creditorMember
    const sharesToSettle = await tx.splitShare.findMany({
      where: {
        memberId: debtorMemberId,
        isSettled: false,
        split: {
          familyId,
          paidById: creditorMemberId,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    let remainingToSettle = settleAmount !== undefined ? settleAmount : Infinity;
    let settledCount = 0;

    for (const share of sharesToSettle) {
      const shareAmt = Number(share.amount);
      if (remainingToSettle >= shareAmt) {
        await tx.splitShare.update({
          where: { id: share.id },
          data: {
            isSettled: true,
            settledAt: new Date(),
          },
        });
        remainingToSettle -= shareAmt;
        settledCount++;
      } else if (remainingToSettle > 0) {
        // Partial settlement: reduce amount of current share and mark settled
        await tx.splitShare.update({
          where: { id: share.id },
          data: {
            amount: new Prisma.Decimal(shareAmt - remainingToSettle),
          },
        });
        remainingToSettle = 0;
        break;
      }
    }

    return {
      success: true,
      settledSharesCount: settledCount,
    };
  });
}
