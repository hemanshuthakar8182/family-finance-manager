import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { AddMemberInput, UpdateFamilyInput } from "@/lib/validations/family";

export async function getFamily(familyId: string) {
  let family = null;
  if (familyId) {
    family = await prisma.family.findUnique({
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

  if (!family) {
    family = await prisma.family.findFirst({
      orderBy: { createdAt: "desc" },
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

  return family;
}

export async function getFamilyMembers(familyId: string) {
  let members = await prisma.familyMember.findMany({
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

  if (members.length === 0) {
    const fallbackFamily = await prisma.family.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (fallbackFamily) {
      members = await prisma.familyMember.findMany({
        where: { familyId: fallbackFamily.id, status: "ACTIVE" },
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
  }

  return members;
}

export async function addMemberToFamily(familyId: string, input: AddMemberInput) {
  let targetFamilyId = familyId;
  const familyExists = await prisma.family.findUnique({ where: { id: familyId } });
  if (!familyExists) {
    const fallback = await prisma.family.findFirst({ orderBy: { createdAt: "desc" } });
    if (!fallback) throw new Error("Family record not found.");
    targetFamilyId = fallback.id;
  }

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
        familyId: targetFamilyId,
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
      familyId: targetFamilyId,
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
  let targetId = familyId;
  let existing = null;

  if (familyId) {
    existing = await prisma.family.findUnique({
      where: { id: familyId },
    });
  }

  if (!existing) {
    const fallbackFamily = await prisma.family.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (!fallbackFamily) {
      throw new Error("No family record found to update.");
    }
    targetId = fallbackFamily.id;
  }

  return await prisma.family.update({
    where: { id: targetId },
    data: {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.currency ? { currency: input.currency } : {}),
      ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
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
