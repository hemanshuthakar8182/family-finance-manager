import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { transactionSchema, transactionFilterSchema } from "@/lib/validations/transaction";
import { createTransaction, getTransactions } from "@/lib/services/transaction.service";

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const queryParams: any = {};
    if (searchParams.get("search")) queryParams.search = searchParams.get("search");
    if (searchParams.get("type")) queryParams.type = searchParams.get("type");
    if (searchParams.get("categoryId")) queryParams.categoryId = searchParams.get("categoryId");
    if (searchParams.get("accountId")) queryParams.accountId = searchParams.get("accountId");
    if (searchParams.get("memberId")) queryParams.memberId = searchParams.get("memberId");
    if (searchParams.get("startDate")) queryParams.startDate = searchParams.get("startDate");
    if (searchParams.get("endDate")) queryParams.endDate = searchParams.get("endDate");
    if (searchParams.get("minAmount")) queryParams.minAmount = searchParams.get("minAmount");
    if (searchParams.get("maxAmount")) queryParams.maxAmount = searchParams.get("maxAmount");
    if (searchParams.get("page")) queryParams.page = searchParams.get("page");
    if (searchParams.get("limit")) queryParams.limit = searchParams.get("limit");

    const validatedFilters = transactionFilterSchema.parse(queryParams);

    // RBAC: Non-admin members can strictly only view their own transactions
    if (user.role !== "ADMIN") {
      validatedFilters.memberId = user.memberId;
    }

    const data = await getTransactions(user.familyId, validatedFilters);

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: error.message?.includes("Unauthorized") ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const validated = transactionSchema.parse(body);

    const transaction = await createTransaction(user.familyId, user.memberId, validated);

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create transaction" },
      { status: 400 }
    );
  }
}
