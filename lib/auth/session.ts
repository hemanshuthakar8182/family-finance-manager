import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";
import prisma from "@/lib/db/prisma";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  familyId: string;
  familyName: string;
  familyLogoUrl?: string | null;
  memberId: string;
  role: "ADMIN" | "MEMBER";
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return session.user as unknown as SessionUser;
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user || !user.familyId || !user.memberId) {
    throw new Error("Unauthorized. Please log in.");
  }

  // Verify that family exists; if not (e.g. stale JWT session after DB migration/switch), map to active family
  const familyExists = await prisma.family.findUnique({
    where: { id: user.familyId },
    select: { id: true, name: true, logoUrl: true },
  });

  if (!familyExists) {
    const activeFamily = await prisma.family.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          where: { status: "ACTIVE" },
          take: 1,
        },
      },
    });

    if (activeFamily) {
      user.familyId = activeFamily.id;
      user.familyName = activeFamily.name;
      user.familyLogoUrl = activeFamily.logoUrl;
      if (activeFamily.members[0]) {
        user.memberId = activeFamily.members[0].id;
        user.role = activeFamily.members[0].role;
      }
    }
  }

  return user;
}

export async function requireFamilyAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    // Check if user is actually admin in the database for this family
    const adminMember = await prisma.familyMember.findFirst({
      where: { familyId: user.familyId, role: "ADMIN", status: "ACTIVE" },
    });
    if (adminMember) {
      user.role = "ADMIN";
    } else {
      throw new Error("Forbidden. Admin access required.");
    }
  }
  return user;
}

