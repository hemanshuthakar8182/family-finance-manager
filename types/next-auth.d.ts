import type { NextApiRequest, NextApiResponse } from "next";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      avatarUrl?: string | null;
      familyId?: string | null;
      familyName?: string | null;
      memberId?: string | null;
      role?: "ADMIN" | "MEMBER" | null;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    familyId?: string | null;
    familyName?: string | null;
    memberId?: string | null;
    role?: "ADMIN" | "MEMBER" | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    familyId?: string | null;
    familyName?: string | null;
    memberId?: string | null;
    role?: "ADMIN" | "MEMBER" | null;
  }
}
