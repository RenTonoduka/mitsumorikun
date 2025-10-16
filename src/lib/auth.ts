/**
 * NextAuth Configuration and Auth Utilities
 * Centralized auth configuration for use across the application
 */

import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma Client directly for NextAuth
const prismaForAuth = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismaForAuth) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prismaForAuth.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        session.user.role = dbUser?.role || "USER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(
  role: "USER" | "COMPANY_ADMIN" | "SYSTEM_ADMIN"
) {
  const user = await getCurrentUser();
  if (!user || user.role !== role) {
    throw new Error("Forbidden");
  }
  return user;
}
