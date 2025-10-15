import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { OnboardingProvider } from "@/contexts/OnboardingContext"
import { OnboardingModal } from "@/components/onboarding/OnboardingModal"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "みつもりくん - AI・システム開発相見積もりプラットフォーム",
  description: "複数の開発会社から最適な見積もりを比較。AI・システム開発に特化した相見積もりサイト",
  keywords: ["相見積もり", "開発会社", "AI開発", "システム開発", "見積もり比較"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <OnboardingProvider>
          {children}
          <OnboardingModal />
        </OnboardingProvider>
      </body>
    </html>
  )
}
