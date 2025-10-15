import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LandingPage } from "@/components/home/LandingPage"
import { Dashboard } from "@/components/home/Dashboard"

export default async function Home() {
  // Get user session to determine if logged in
  const session = await getServerSession(authOptions)

  // Show Landing Page for non-authenticated users
  if (!session) {
    return <LandingPage />
  }

  // Show Dashboard for authenticated users
  return <Dashboard />
}
