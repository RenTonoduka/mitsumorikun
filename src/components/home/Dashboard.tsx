"use client"

import Link from "next/link"
import { Building2, FileText, HelpCircle } from "lucide-react"
import { useOnboarding } from "@/contexts/OnboardingContext"

export function Dashboard() {
  const { startOnboarding, isCompleted } = useOnboarding()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-6xl font-bold text-transparent">
            みつもりくん
          </h1>
          <p className="mb-2 text-2xl font-semibold text-gray-800">
            AI・システム開発相見積もりプラットフォーム
          </p>
          <p className="text-gray-600">
            複数の開発会社から最適な見積もりを比較。AIが自動マッチング
          </p>
        </div>

        {/* Action Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Company Registration */}
          <Link
            href="/companies/new"
            id="company-register-link"
            className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-3 group-hover:bg-blue-200">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">企業登録</h2>
            </div>
            <p className="text-gray-600">
              開発会社として登録し、プロジェクト依頼を受け取りましょう
            </p>
          </Link>

          {/* Create Request */}
          <Link
            href="/requests/new"
            id="create-request-link"
            className="group rounded-2xl bg-white p-8 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-3 group-hover:bg-purple-200">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">見積依頼</h2>
            </div>
            <p className="text-gray-600">
              プロジェクトの見積もりを複数の開発会社に依頼
            </p>
          </Link>
        </div>

        {/* Onboarding Trigger */}
        {isCompleted && (
          <div className="text-center">
            <button
              onClick={startOnboarding}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-md transition-all hover:shadow-lg"
            >
              <HelpCircle className="h-4 w-4" />
              使い方ガイドを見る
            </button>
          </div>
        )}

        {/* Features */}
        <div className="mt-12 grid gap-4 text-center md:grid-cols-3">
          <div className="rounded-lg bg-white/60 p-6 backdrop-blur-sm">
            <div className="mb-2 text-3xl font-bold text-blue-600">AI</div>
            <p className="text-sm text-gray-700">自動マッチング</p>
          </div>
          <div className="rounded-lg bg-white/60 p-6 backdrop-blur-sm">
            <div className="mb-2 text-3xl font-bold text-purple-600">100%</div>
            <p className="text-sm text-gray-700">無料で利用可能</p>
          </div>
          <div className="rounded-lg bg-white/60 p-6 backdrop-blur-sm">
            <div className="mb-2 text-3xl font-bold text-pink-600">⭐</div>
            <p className="text-sm text-gray-700">レビューシステム</p>
          </div>
        </div>
      </div>
    </main>
  )
}
