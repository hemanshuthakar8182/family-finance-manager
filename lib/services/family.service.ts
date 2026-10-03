import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { AddMemberInput, UpdateFamilyInput } from "@/lib/validations/family";

export async function getFamily(familyId: string) {
  return await prisma.family.findUnique({
    where: { id: familyId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatarUrl: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
      _count: {
        select: {
          transactions: true,
          categories: true,
          accounts: true,
        },
      },
    },
  });
}

export async function getFamilyMembers(familyId: string) {
  return await prisma.familyMember.findMany({
    where: { familyId, status: "ACTIVE" },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      _count: {
        select: { transactions: true },
      },
    },
    orderBy: { joinedAt: "asc" },
  });
}

export async function addMemberToFamily(familyId: string, input: AddMemberInput) {
  const email = input.email.toLowerCase();

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    user = await prisma.user.create({
      data: {
        name: input.name,
        email,
        passwordHash,
      },
    });
  }

  // Check if member already in this family
  const existingMember = await prisma.familyMember.findUnique({
    where: {
      familyId_userId: {
        familyId,
        userId: user.id,
      },
    },
  });

  if (existingMember) {
    if (existingMember.status === "INACTIVE") {
      return await prisma.familyMember.update({
        where: { id: existingMember.id },
        data: { status: "ACTIVE", role: input.role },
      });
    }
    throw new Error("This user is already a member of this family.");
  }

  return await prisma.familyMember.create({
    data: {
      familyId,
      userId: user.id,
      role: input.role,
      status: "ACTIVE",
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updateFamily(familyId: string, input: UpdateFamilyInput) {
  return await prisma.family.update({
    where: { id: familyId },
    data: {
      name: input.name.trim(),
      currency: input.currency,
    },
  });
}

export async function updateMemberRole(
  familyId: string,
  memberId: string,
  role: "ADMIN" | "MEMBER"
) {
  return await prisma.familyMember.updateMany({
    where: { id: memberId, familyId },
    data: { role },
  });
}

export async function deactivateMember(familyId: string, memberId: string) {
  // Ensure we don't deactivate the last admin
  const admins = await prisma.familyMember.count({
    where: { familyId, role: "ADMIN", status: "ACTIVE" },
  });

  const target = await prisma.familyMember.findFirst({
    where: { id: memberId, familyId },
  });

  if (target?.role === "ADMIN" && admins <= 1) {
    throw new Error("Cannot deactivate the only Family Admin.");
  }

  return await prisma.familyMember.updateMany({
    where: { id: memberId, familyId },
    data: { status: "INACTIVE" },
  });
}
