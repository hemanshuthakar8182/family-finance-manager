import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { RegisterInput } from "@/lib/validations/auth";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/lib/constants/categories";
import { DEFAULT_ACCOUNTS } from "@/lib/constants/accounts";

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  // Run in a single transaction: create User, Family, FamilyMember (ADMIN), default Categories & Accounts
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
      },
    });

    const family = await tx.family.create({
      data: {
        name: input.familyName,
        currency: "INR",
      },
    });

    const member = await tx.familyMember.create({
      data: {
        familyId: family.id,
        userId: user.id,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    // Seed default categories
    const categoriesData = [
      ...DEFAULT_EXPENSE_CATEGORIES.map((cat) => ({
        familyId: family.id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      })),
      ...DEFAULT_INCOME_CATEGORIES.map((cat) => ({
        familyId: family.id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      })),
    ];

    await tx.category.createMany({
      data: categoriesData,
    });

    // Seed default accounts
    const accountsData = DEFAULT_ACCOUNTS.map((acc) => ({
      familyId: family.id,
      name: acc.name,
      type: acc.type,
      openingBalance: acc.openingBalance,
      currentBalance: acc.openingBalance,
    }));

    await tx.account.createMany({
      data: accountsData,
    });

    return { user, family, member };
  });

  return result;
}

export async function verifyUserCredentials(email: string, passwordPlain: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      memberships: {
        where: { status: "ACTIVE" },
        include: {
          family: true,
        },
      },
    },
  });

  if (!user) return null;

  const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isValid) return null;

  const primaryMembership = user.memberships[0] || null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    familyId: primaryMembership?.familyId || null,
    familyName: primaryMembership?.family.name || null,
    memberId: primaryMembership?.id || null,
    role: primaryMembership?.role || null,
  };
}
