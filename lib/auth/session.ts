import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  familyId: string;
  familyName: string;
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
  return user;
}

export async function requireFamilyAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Forbidden. Admin access required.");
  }
  return user;
}
