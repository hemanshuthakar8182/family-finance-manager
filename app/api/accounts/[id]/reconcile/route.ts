import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const actualBalanceNum = Number(body.actualBalance);
    if (isNaN(actualBalanceNum)) {
      return NextResponse.json(
        { error: "Please enter a valid actual balance number" },
        { status: 400 }
      );
    }

    const account = await prisma.account.findFirst({
      where: { id: params.id, familyId: user.familyId, isArchived: false },
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const currentBalanceNum = Number(account.currentBalance);
    const diff = actualBalanceNum - currentBalanceNum;

    if (Math.abs(diff) < 0.01) {
      return NextResponse.json({
        success: true,
        reconciled: true,
        message: "Account balance is already perfectly synchronized.",
      });
    }

    // Find or create default "Adjustment" category for family
    const adjType = diff > 0 ? "INCOME" : "EXPENSE";
    let adjCategory = await prisma.category.findFirst({
      where: {
        familyId: user.familyId,
        type: adjType,
        name: "Balance Adjustment",
        isArchived: false,
      },
    });

    if (!adjCategory) {
      adjCategory = await prisma.category.create({
        data: {
          familyId: user.familyId,
          name: "Balance Adjustment",
          type: adjType,
          icon: "Sliders",
          color: "#64748B",
          isDefault: true,
        },
      });
    }

    const absDiff = Math.abs(diff);

    // Atomically create adjustment transaction and align currentBalance
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          familyId: user.familyId,
          memberId: user.memberId,
          type: adjType,
          amount: new Prisma.Decimal(absDiff),
          categoryId: adjCategory.id,
          accountId: account.id,
          date: new Date(),
          description: `Statement Reconciliation (${diff > 0 ? "+" : "−"}${absDiff.toFixed(2)})`,
          notes: body.notes
            ? `Reconciliation note: ${body.notes}`
            : `Reconciled to match statement balance of ₹${actualBalanceNum.toFixed(2)}`,
        },
      });

      const updatedAccount = await tx.account.update({
        where: { id: account.id },
        data: {
          currentBalance: new Prisma.Decimal(actualBalanceNum),
        },
      });

      return { transaction, updatedAccount };
    });

    return NextResponse.json({
      success: true,
      diff,
      newBalance: actualBalanceNum,
      message: `Account reconciled. Balance adjusted by ${diff > 0 ? "+" : ""}${diff.toFixed(2)}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to reconcile balance" },
      { status: 400 }
    );
  }
}
