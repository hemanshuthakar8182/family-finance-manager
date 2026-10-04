import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const importSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  transactions: z.array(
    z.object({
      date: z.string(),
      type: z.enum(["EXPENSE", "INCOME"]),
      amount: z.number().positive(),
      categoryId: z.string().optional(),
      description: z.string().default("Imported Statement Transaction"),
      notes: z.string().optional(),
    })
  ).min(1, "At least one transaction is required"),
  skipDuplicates: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { familyId, memberId, id: userId } = user;
    const body = await req.json();
    const parsed = importSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { accountId, transactions, skipDuplicates } = parsed.data;

    // Verify account belongs to family
    const account = await prisma.account.findFirst({
      where: { id: accountId, familyId, isArchived: false },
    });
    if (!account) {
      return NextResponse.json({ error: "Account not found or archived" }, { status: 404 });
    }

    // Get current family member id for this user
    const member = await prisma.familyMember.findFirst({
      where: { familyId, userId },
    });
    if (!member) {
      return NextResponse.json({ error: "Family member record not found" }, { status: 404 });
    }

    // Query date bounds to find existing transactions for duplicate detection
    const dates = transactions
      .map((t) => new Date(t.date))
      .filter((d) => !isNaN(d.getTime()));
    
    if (dates.length === 0) {
      return NextResponse.json({ error: "No valid transaction dates" }, { status: 400 });
    }

    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    // Expand by 1 day
    minDate.setDate(minDate.getDate() - 1);
    maxDate.setDate(maxDate.getDate() + 1);

    const existingTxs = await prisma.transaction.findMany({
      where: {
        familyId,
        accountId,
        deletedAt: null,
        date: { gte: minDate, lte: maxDate },
      },
      select: {
        date: true,
        amount: true,
        type: true,
        description: true,
      },
    });

    const isDuplicate = (item: { date: string; amount: number; type: string; description: string }) => {
      const itemDateStr = new Date(item.date).toDateString();
      return existingTxs.some((ex) => {
        const exDateStr = new Date(ex.date).toDateString();
        return (
          exDateStr === itemDateStr &&
          Math.abs(Number(ex.amount) - item.amount) < 0.01 &&
          ex.type === item.type
        );
      });
    };

    const toInsert: typeof transactions = [];
    let skippedCount = 0;

    for (const t of transactions) {
      if (skipDuplicates && isDuplicate(t)) {
        skippedCount++;
        continue;
      }
      toInsert.push(t);
    }

    if (toInsert.length === 0) {
      return NextResponse.json({
        message: "No new transactions to import. All rows were recognized as duplicates.",
        importedCount: 0,
        skippedCount,
      });
    }

    // Execute atomic batch insert & balance adjustment
    let balanceDelta = new Prisma.Decimal(0);

    const result = await prisma.$transaction(async (tx) => {
      let createdCount = 0;

      for (const t of toInsert) {
        const amt = new Prisma.Decimal(t.amount);
        if (t.type === "INCOME") {
          balanceDelta = balanceDelta.add(amt);
        } else {
          balanceDelta = balanceDelta.sub(amt);
        }

        await tx.transaction.create({
          data: {
            familyId,
            memberId: member.id,
            accountId,
            categoryId: t.categoryId || null,
            type: t.type,
            amount: amt,
            date: new Date(t.date),
            description: t.description,
            notes: t.notes || "Imported via Bank Statement",
          },
        });
        createdCount++;
      }

      // Update account current balance
      const updatedAccount = await tx.account.update({
        where: { id: accountId },
        data: { currentBalance: { increment: balanceDelta } },
      });

      return {
        importedCount: createdCount,
        newBalance: Number(updatedAccount.currentBalance),
      };
    });

    return NextResponse.json({
      success: true,
      importedCount: result.importedCount,
      skippedCount,
      newBalance: result.newBalance,
    });
  } catch (err: any) {
    console.error("Statement import error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to import statement transactions" },
      { status: 500 }
    );
  }
}
