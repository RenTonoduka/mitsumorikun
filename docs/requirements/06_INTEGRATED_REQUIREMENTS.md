# 統合要件定義書

**プロジェクト名**: AI/システム開発特化型相見積もりサイト (mitsumorikun)
**バージョン**: 1.0.0
**作成日**: 2025-10-15

---

## エグゼクティブサマリー

AI/アプリ開発/システム開発に特化した相見積もりプラットフォーム。企業（サービス提供者）と顧客（発注者）をマッチングし、一括資料請求を通じて効率的な業者選定を実現。

### 主要な価値提案
- **発注者**: 複数社への一括資料請求で時間短縮・比較検討が容易
- **企業**: 見込み顧客へのリーチ拡大・営業効率化
- **プラットフォーム**: マッチング手数料・広告収益

---

## 技術スタック

### フロントエンド
- Next.js 14+ (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- shadcn/ui

### バックエンド
- Next.js API Routes
- Prisma ORM
- Neon PostgreSQL

### 認証
- Firebase Auth または Supabase Auth

### ホスティング
- Vercel

---

## 主要機能

### P0 (最優先)
1. ユーザー登録・ログイン (AUTH-001, AUTH-003)
2. 企業登録・審査 (AUTH-002)
3. 企業一覧・検索 (COMPANY-001)
4. 企業詳細ページ (COMPANY-002)
5. 一括資料請求 (REQUEST-001)
6. リード管理ダッシュボード (COMPANY-MANAGE-001)
7. 企業ページ編集 (COMPANY-MANAGE-002)

### P1 (高優先度)
8. プロフィール管理
9. 資料請求履歴 (REQUEST-002)
10. AIレコメンデーション (MATCH-001)
11. レビュー投稿・表示 (REVIEW-001, REVIEW-002)
12. 分析レポート (COMPANY-MANAGE-003)

### P2 (中優先度)
13. マッチングスコア
14. 管理者機能 (ADMIN-001, ADMIN-002)

---

## 非機能要件サマリー

### パフォーマンス
- LCP: 2.0秒以内
- FID: 50ms以内
- Lighthouse スコア: 90点以上

### セキュリティ
- HTTPS必須
- OWASP Top 10対策
- 個人情報保護法対応

### 可用性
- 稼働率: 99.9%
- RPO: 24時間
- RTO: 4時間

---

## プロジェクトマイルストーン

### Phase 1: MVP (0-3ヶ月)
- 基本認証機能
- 企業一覧・検索
- 資料請求機能
- 管理画面（最小限）

### Phase 2: 機能拡充 (3-6ヶ月)
- AIレコメンデーション
- レビュー機能
- 分析ダッシュボード
- SEO最適化

### Phase 3: スケールアップ (6-12ヶ月)
- パフォーマンス最適化
- 大規模トラフィック対応
- 外部API連携

---

**このドキュメントは Issue #2 の要件に基づいて、Miyabi Autonomous Agent により自動生成されました。**

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
