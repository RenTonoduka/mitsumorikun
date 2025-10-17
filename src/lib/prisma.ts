import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Debug: Verify Prisma client initialization
if (process.env.NODE_ENV === "development") {
  console.log("[Prisma] Client initialized:", !!prisma)
  console.log("[Prisma] DATABASE_URL set:", !!process.env.DATABASE_URL)
}
