import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUserCredentials } from "@/lib/services/auth.service";

import prisma from "@/lib/db/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password");
        }

        const user = await verifyUserCredentials(
          credentials.email,
          credentials.password
        );

        if (!user) {
          throw new Error("Invalid email or password");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const u = user as any;
        token.id = u.id;
        token.name = u.name;
        token.email = u.email;
        token.familyId = u.familyId;
        token.familyName = u.familyName;
        token.familyLogoUrl = u.familyLogoUrl;
        token.memberId = u.memberId;
        token.role = u.role;
      } else if (token.id) {
        // Keep name, email, and family info synchronized with the database
        try {
          const freshUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { name: true, email: true },
          });
          if (freshUser) {
            token.name = freshUser.name;
            token.email = freshUser.email;
          }
        } catch {
          // Ignore transient DB errors
        }
      }
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
        if (session.familyId) token.familyId = session.familyId;
        if (session.familyName) token.familyName = session.familyName;
        if (session.familyLogoUrl !== undefined) token.familyLogoUrl = session.familyLogoUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email;
        (session.user as any).id = token.id;
        (session.user as any).familyId = token.familyId;
        (session.user as any).familyName = token.familyName;
        (session.user as any).familyLogoUrl = token.familyLogoUrl;
        (session.user as any).memberId = token.memberId;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
