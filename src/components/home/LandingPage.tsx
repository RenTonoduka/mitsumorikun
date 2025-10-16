"use client"

import React from "react"
import Link from "next/link"
import { ArrowRight, Check, Star, Building2, Users, Zap, Shield, TrendingUp, MessageSquare } from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-indigo-600 to-violet-600 px-4 py-20 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        <div className="container relative mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
              最適な開発会社を
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                AIが自動マッチング
              </span>
            </h1>
            <p className="mb-8 text-xl text-cyan-100 md:text-2xl">
              複数の開発会社から見積もりを比較。AI・システム開発に特化した相見積もりプラットフォーム
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/requests/new"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-indigo-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                無料で見積依頼
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/companies/new"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white hover:text-indigo-600"
              >
                企業として登録
              </Link>
            </div>
            <p className="mt-6 text-sm text-cyan-200">
              ✓ 完全無料 ✓ 最短1分で登録 ✓ AIが最適な企業を提案
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-200 bg-gray-50 py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div>
              <div className="mb-2 text-4xl font-bold text-indigo-600">500+</div>
              <div className="text-gray-600">登録企業数</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-cyan-600">1,200+</div>
              <div className="text-gray-600">マッチング実績</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-emerald-600">98%</div>
              <div className="text-gray-600">満足度</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-violet-600">平均3日</div>
              <div className="text-gray-600">マッチング期間</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">みつもりくんの特徴</h2>
            <p className="text-xl text-gray-600">AIが最適な開発会社を自動でマッチング</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl bg-gradient-to-br from-cyan-50 to-indigo-50 p-8 transition-all hover:shadow-xl">
              <div className="mb-4 inline-flex rounded-full bg-cyan-100 p-4">
                <Zap className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">AIマッチング</h3>
              <p className="text-gray-600">
                技術スタック、予算、納期を分析し、最適な開発会社を自動でマッチング。100点満点でスコアリングします。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-8 transition-all hover:shadow-xl">
              <div className="mb-4 inline-flex rounded-full bg-indigo-100 p-4">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">安心の審査制</h3>
              <p className="text-gray-600">
                登録企業は厳格な審査を通過した優良企業のみ。過去の実績やレビューで信頼性を確認できます。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-cyan-50 p-8 transition-all hover:shadow-xl">
              <div className="mb-4 inline-flex rounded-full bg-emerald-100 p-4">
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">完全無料</h3>
              <p className="text-gray-600">
                見積依頼から契約まで、すべての機能を完全無料で利用可能。隠れた費用は一切ありません。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">ご利用の流れ</h2>
            <p className="text-xl text-gray-600">3ステップで最適な開発会社が見つかります</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-500 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">プロジェクト登録</h3>
              <p className="text-gray-600">
                プロジェクトの概要、予算、希望する技術スタックを入力。最短1分で完了します。
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">AIマッチング</h3>
              <p className="text-gray-600">
                AIが最適な開発会社を自動選定。マッチ度の高い順に提案を受け取れます。
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">比較・契約</h3>
              <p className="text-gray-600">
                複数の見積もりを比較し、最適な開発会社を選択。そのまま契約手続きに進めます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">お客様の声</h2>
            <p className="text-xl text-gray-600">実際にご利用いただいた企業様からの評価</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Testimonial 1 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-6 text-gray-700">
                「AIマッチングで希望通りの開発会社が見つかりました。3社から提案を受け、価格と実績を比較して最適な選択ができました。」
              </p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-400" />
                <div>
                  <div className="font-bold text-gray-900">山田太郎様</div>
                  <div className="text-sm text-gray-500">株式会社テックスタート 代表取締役</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-4 flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="mb-6 text-gray-700">
                「完全無料で利用でき、マッチングも早い。見積もり比較が簡単で、開発パートナー探しの時間を大幅に短縮できました。」
              </p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400" />
                <div>
                  <div className="font-bold text-gray-900">佐藤花子様</div>
                  <div className="text-sm text-gray-500">合同会社イノベート プロジェクトマネージャー</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-cyan-600 via-indigo-600 to-violet-600 py-20 text-white">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">今すぐ無料で始めましょう</h2>
          <p className="mb-8 text-xl text-cyan-100">
            最短1分で登録完了。AIが最適な開発会社をご提案します。
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/requests/new"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-indigo-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              無料で見積依頼
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/companies/new"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white px-8 py-4 text-lg font-bold text-white transition-all hover:bg-white hover:text-indigo-600"
            >
              企業として登録
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-cyan-200">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              完全無料
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              クレジットカード不要
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              最短1分で登録
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-white">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-xl font-bold">みつもりくん</h3>
              <p className="text-gray-400">
                AI・システム開発に特化した相見積もりプラットフォーム
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-bold">サービス</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/requests/new" className="hover:text-white">
                    見積依頼
                  </Link>
                </li>
                <li>
                  <Link href="/companies/new" className="hover:text-white">
                    企業登録
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold">会社情報</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    会社概要
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    プライバシーポリシー
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold">お問い合わせ</h4>
              <p className="text-gray-400">support@mitsumorikun.com</p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 みつもりくん. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
