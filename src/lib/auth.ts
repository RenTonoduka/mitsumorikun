/**
 * NextAuth Configuration and Auth Utilities
 * Centralized auth configuration for use across the application
 */

import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

// Global Prisma instance for NextAuth to avoid multiple connections
const globalForPrisma = globalThis as unknown as {
  prismaForAuth: PrismaClient | undefined;
};

const prismaForAuth =
  globalForPrisma.prismaForAuth ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaForAuth = prismaForAuth;
}

console.log("[Auth] PrismaClient initialized for NextAuth:", !!prismaForAuth);
console.log("[Auth] DATABASE_URL exists:", !!process.env.DATABASE_URL);

export const authOptions: NextAuthOptions = {
  // Using JWT strategy instead of database adapter to avoid App Router compatibility issues
  // adapter: PrismaAdapter(prismaForAuth) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Create or update user in database on sign in
      if (account && profile) {
        try {
          const existingUser = await prismaForAuth.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            await prismaForAuth.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
                role: "USER",
              },
            });
          }
        } catch (error) {
          console.error("[Auth] SignIn callback error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        const dbUser = await prismaForAuth.user.findUnique({
          where: { email: user.email! },
          select: { id: true, role: true },
        });

        return {
          ...token,
          id: dbUser?.id,
          role: dbUser?.role || "USER",
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || "USER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
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
