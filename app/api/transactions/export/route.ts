import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { format } from "date-fns";
import { Prisma } from "@prisma/client";

function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type");
    const categoryId = searchParams.get("categoryId");
    const accountId = searchParams.get("accountId");
    const memberId = searchParams.get("memberId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    const where: Prisma.TransactionWhereInput = {
      familyId: user.familyId,
    };

    if (type && type !== "ALL") {
      where.type = type as any;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (accountId) {
      where.accountId = accountId;
    }
    // RBAC: Non-admin members can strictly only export their own transactions
    if (user.role !== "ADMIN") {
      where.memberId = user.memberId;
    } else if (memberId) {
      where.memberId = memberId;
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        where.date.lte = e;
      }
    }
    if (search) {
      const q = search.trim();
      where.OR = [
        { description: { contains: q } },
        { notes: { contains: q } },
        { category: { name: { contains: q } } },
        { account: { name: { contains: q } } },
        { member: { user: { name: { contains: q } } } },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      include: {
        category: true,
        account: true,
        member: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    const headers = [
      "Date",
      "Time",
      "Type",
      "Category",
      "Amount (INR)",
      "Account",
      "Logged By",
      "Description",
      "Notes",
    ];

    const rows = transactions.map((t) => {
      const d = new Date(t.date);
      return [
        escapeCSV(format(d, "yyyy-MM-dd")),
        escapeCSV(format(d, "HH:mm:ss")),
        escapeCSV(t.type),
        escapeCSV(t.category?.name || "Uncategorized"),
        escapeCSV(t.amount.toString()),
        escapeCSV(t.account?.name || "Unassigned"),
        escapeCSV(t.member?.user?.name || "Member"),
        escapeCSV(t.description || ""),
        escapeCSV(t.notes || ""),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");

    const filename = `family_transactions_${format(new Date(), "yyyyMMdd_HHmm")}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to export CSV" },
      { status: 500 }
    );
  }
}
