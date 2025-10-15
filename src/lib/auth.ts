import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireRole(role: "USER" | "COMPANY_ADMIN" | "SYSTEM_ADMIN") {
  const user = await getCurrentUser()
  if (!user || user.role !== role) {
    throw new Error("Forbidden")
  }
  return user
}
