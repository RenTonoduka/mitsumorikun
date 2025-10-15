# システム設計書

**プロジェクト名**: mitsumorikun - AI/システム開発特化型相見積もりサイト
**バージョン**: 1.0.0
**作成日**: 2025-10-15
**前提**: Issue #2 要件定義完了

---

## 1. システム概要

### 1.1 アーキテクチャ概要（C4モデル - Context）

```
┌─────────────────────────────────────────────────────────────┐
│                  一般ユーザー（発注者）                       │
│              ブラウザ（PC/スマホ）                            │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────┴────────────────────────────────────┐
│                  mitsumorikun Platform                       │
│                  (Next.js on Vercel)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Frontend   │  │ API        │  │ Auth       │            │
│  │ (Next.js)  │──│ (Routes)   │──│ (Firebase) │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│         │                │                                   │
│         └────────────────┴──────────────┐                   │
└──────────────────────────────────────────┼───────────────────┘
                                           │
                         ┌─────────────────┴──────────────────┐
                         │   Neon PostgreSQL (Database)       │
                         └────────────────────────────────────┘
                                           │
┌────────────────────────┬────────────────┴────────────────────┐
│             企業ユーザー（サービス提供者）                     │
│                  ブラウザ（PC）                               │
└───────────────────────────────────────────────────────────────┘
```

### 1.2 システム構成（C4モデル - Container）

```
┌─────────────────────────────────────────────────────────────────┐
│                      Vercel Platform                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Next.js Application (App Router)                        │   │
│  │                                                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │   │
│  │  │  Frontend    │  │  API Routes  │  │  Middleware  │  │   │
│  │  │  (RSC + CSR) │  │  (REST)      │  │  (Auth)      │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │   │
│  │         │                  │                  │          │   │
│  └─────────┼──────────────────┼──────────────────┼──────────┘   │
└────────────┼──────────────────┼──────────────────┼──────────────┘
             │                  │                  │
             │                  ▼                  ▼
             │        ┌────────────────┐  ┌────────────────┐
             │        │  Neon Postgres │  │  Firebase Auth │
             │        │  (Database)    │  │  (Auth)        │
             │        └────────────────┘  └────────────────┘
             │
             ▼
   ┌────────────────────┐
   │  Vercel Blob / S3  │
   │  (File Storage)    │
   └────────────────────┘
```

### 1.3 技術スタック詳細

| レイヤー | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| **フロントエンド** | Next.js | 14.2+ | React Framework (App Router) |
| | TypeScript | 5.8+ | 型安全性 |
| | Tailwind CSS | 3.4+ | スタイリング |
| | shadcn/ui | latest | UIコンポーネント |
| | React Hook Form | 7.x | フォーム管理 |
| | Zod | 3.x | バリデーション |
| **バックエンド** | Next.js API Routes | 14.2+ | RESTful API |
| | Prisma ORM | 5.x | データベースORM |
| | Neon Postgres | latest | データベース |
| **認証** | Firebase Auth | 10.x | 認証・認可 |
| または | Supabase Auth | latest | 認証・認可 |
| **ホスティング** | Vercel | latest | デプロイ・ホスティング |
| **ファイルストレージ** | Vercel Blob | latest | 画像・PDF保存 |
| **監視** | Vercel Analytics | latest | パフォーマンス監視 |
| | Sentry | latest | エラートラッキング |
| **開発** | Docker | latest | ローカル環境 |
| | GitHub Actions | - | CI/CD |

---

## 2. データベース設計

### 2.1 ER図（詳細版）

```
┌─────────────┐       ┌──────────────────┐       ┌──────────────┐
│    User     │       │   RequestCompany │       │   Company    │
│─────────────│       │──────────────────│       │──────────────│
│ id (PK)     │       │ id (PK)          │       │ id (PK)      │
│ email       │───┐   │ requestId (FK)   │   ┌───│ name         │
│ name        │   │   │ companyId (FK)   │   │   │ slug         │
│ company     │   │   │ status           │   │   │ logoUrl      │
│ role        │   │   │ createdAt        │   │   │ description  │
│ phone       │   │   │ updatedAt        │   │   │ rating       │
│ createdAt   │   │   └──────────────────┘   │   │ reviewCount  │
│ updatedAt   │   │            │              │   │ createdAt    │
└─────────────┘   │            │              │   │ updatedAt    │
      │           │            │              │   └──────────────┘
      │           │   ┌────────┴────────┐     │          │
      │           │   │                 │     │          │
      │           └───┤                 ├─────┘          │
      │               │                 │                │
      ▼               ▼                 ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌────────────┐  ┌──────────────┐
│   Request   │  │   Review    │  │  Favorite  │  │ CompanyUser  │
│─────────────│  │─────────────│  │────────────│  │──────────────│
│ id (PK)     │  │ id (PK)     │  │ id (PK)    │  │ id (PK)      │
│ projectName │  │ rating      │  │ userId(FK) │  │ email        │
│ description │  │ title       │  │companyId   │  │ name         │
│ budget      │  │ content     │  │ createdAt  │  │ companyId(FK)│
│ deadline    │  │ userId (FK) │  └────────────┘  │ role         │
│ techStacks  │  │companyId    │                  │ createdAt    │
│ userId (FK) │  │ createdAt   │                  │ updatedAt    │
│ status      │  │ updatedAt   │                  └──────────────┘
│ createdAt   │  └─────────────┘
│ updatedAt   │
└─────────────┘

┌──────────────────┐       ┌─────────────────────┐
│   TechStack      │       │  CompanyTechStack   │
│──────────────────│       │─────────────────────│
│ id (PK)          │───┬───│ companyId (FK)      │
│ name             │   │   │ techStackId (FK)    │
│ category         │   │   └─────────────────────┘
│ iconUrl          │   │
└──────────────────┘   │   ┌─────────────────────┐
                       └───│  CompanySpecialty   │
┌──────────────────┐       │─────────────────────│
│   Specialty      │       │ companyId (FK)      │
│──────────────────│───────│ specialtyId (FK)    │
│ id (PK)          │       └─────────────────────┘
│ name             │
└──────────────────┘
```

### 2.2 インデックス設計

| テーブル | カラム | 種類 | 理由 |
|---------|--------|------|------|
| User | email | UNIQUE | ログイン時の高速検索 |
| Company | slug | UNIQUE | URL表示用 |
| Company | name | INDEX | 検索機能 |
| Company | status | INDEX | 承認済み企業のフィルタリング |
| Request | userId | INDEX | ユーザー別資料請求一覧 |
| RequestCompany | requestId, companyId | INDEX | リレーション高速化 |
| Review | companyId | INDEX | 企業別レビュー取得 |
| Favorite | userId, companyId | UNIQUE INDEX | 重複防止 |

### 2.3 マイグレーション戦略

```bash
# Prisma Migrate使用
npx prisma migrate dev --name init
npx prisma migrate deploy  # 本番適用

# ロールバック
prisma migrate resolve --rolled-back [migration_name]
```

---

## 3. API設計

### 3.1 REST API エンドポイント一覧

#### 認証系 API

| エンドポイント | メソッド | 説明 | 認証 |
|--------------|---------|------|------|
| `/api/auth/register` | POST | ユーザー登録 | - |
| `/api/auth/login` | POST | ログイン | - |
| `/api/auth/logout` | POST | ログアウト | ✓ |
| `/api/auth/me` | GET | 現在のユーザー情報取得 | ✓ |
| `/api/auth/refresh` | POST | トークンリフレッシュ | ✓ |

#### 企業系 API

| エンドポイント | メソッド | 説明 | 認証 |
|--------------|---------|------|------|
| `/api/companies` | GET | 企業一覧取得 | - |
| `/api/companies/:slug` | GET | 企業詳細取得 | - |
| `/api/companies` | POST | 企業登録 | ✓ |
| `/api/companies/:id` | PATCH | 企業情報更新 | ✓ (企業) |
| `/api/companies/:id` | DELETE | 企業削除 | ✓ (管理者) |

#### 資料請求系 API

| エンドポイント | メソッド | 説明 | 認証 |
|--------------|---------|------|------|
| `/api/requests` | POST | 資料請求作成 | ✓ |
| `/api/requests` | GET | 資料請求一覧取得 | ✓ |
| `/api/requests/:id` | GET | 資料請求詳細取得 | ✓ |
| `/api/requests/:id` | PATCH | ステータス更新 | ✓ |

#### レビュー系 API

| エンドポイント | メソッド | 説明 | 認証 |
|--------------|---------|------|------|
| `/api/reviews` | POST | レビュー投稿 | ✓ |
| `/api/companies/:id/reviews` | GET | レビュー一覧取得 | - |
| `/api/reviews/:id` | PATCH | レビュー更新 | ✓ |
| `/api/reviews/:id` | DELETE | レビュー削除 | ✓ |

### 3.2 認証フロー

```
┌──────────┐                ┌──────────────┐              ┌────────────┐
│ Client   │                │ Next.js API  │              │  Firebase  │
└────┬─────┘                └──────┬───────┘              └─────┬──────┘
     │                             │                            │
     │ 1. POST /api/auth/login     │                            │
     ├────────────────────────────>│                            │
     │                             │ 2. Verify credentials      │
     │                             ├───────────────────────────>│
     │                             │                            │
     │                             │ 3. JWT Token               │
     │                             │<───────────────────────────┤
     │ 4. Access Token +           │                            │
     │    Refresh Token            │                            │
     │<────────────────────────────┤                            │
     │                             │                            │
     │ 5. API Request              │                            │
     │    (Bearer Token)           │                            │
     ├────────────────────────────>│                            │
     │                             │ 6. Verify Token            │
     │                             ├───────────────────────────>│
     │                             │                            │
     │ 7. Response                 │                            │
     │<────────────────────────────┤                            │
```

### 3.3 エラーハンドリング

**標準エラーレスポンス**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容に誤りがあります",
    "details": [
      {
        "field": "email",
        "message": "有効なメールアドレスを入力してください"
      }
    ]
  },
  "timestamp": "2025-10-15T10:00:00Z",
  "path": "/api/auth/register"
}
```

**HTTPステータスコード**:
- `200`: 成功
- `201`: 作成成功
- `400`: バリデーションエラー
- `401`: 認証エラー
- `403`: 権限エラー
- `404`: リソース未検出
- `429`: レートリミット超過
- `500`: サーバーエラー

---

## 4. インフラ設計

### 4.1 Vercel環境構成

| 環境 | ブランチ | URL | 用途 |
|------|---------|-----|------|
| Development | feature/* | Preview | 開発・テスト |
| Staging | develop | staging.mitsumorikun.com | ステージング |
| Production | main | mitsumorikun.com | 本番 |

### 4.2 環境変数管理

```bash
# .env.local (ローカル開発)
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_FIREBASE_API_KEY="..."
FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Vercel環境変数（本番）
DATABASE_URL="postgres://..." # Neon接続文字列
FIREBASE_ADMIN_SDK="..." # Firebase Admin SDK
SENTRY_DSN="..." # Sentryエラートラッキング
```

### 4.3 Neon PostgreSQL構成

**プラン**: Scale（本番用）
**リージョン**: Tokyo (ap-northeast-1)
**接続方法**: Connection Pooling有効
**バックアップ**: 自動（日次）

---

## 5. デプロイ設計

### 5.1 CI/CDパイプライン（GitHub Actions）

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: vercel/action@v2
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

### 5.2 デプロイフロー

```
1. Pull Request作成
   ↓
2. CI実行（TypeCheck, Lint, Test, Build）
   ↓
3. Vercel Preview Deployment
   ↓
4. コードレビュー
   ↓
5. develop マージ → Staging Deploy
   ↓
6. Staging テスト
   ↓
7. main マージ → Production Deploy
   ↓
8. 本番デプロイ完了
```

---

## 6. セキュリティ設計

### 6.1 認証・認可フロー

**JWT構造**:
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id",
    "email": "user@example.com",
    "role": "user",
    "iat": 1234567890,
    "exp": 1234571490
  }
}
```

### 6.2 OWASP Top 10対策

| 脆弱性 | 対策 |
|--------|------|
| SQLインジェクション | Prisma ORM使用（パラメータ化クエリ） |
| XSS | React自動エスケープ、CSP設定 |
| CSRF | SameSite Cookie、CSRF Token |
| 認証の不備 | Firebase Auth、JWT検証 |
| セキュリティ設定ミス | Vercel Security Headers |
| 機微なデータの露出 | 環境変数管理、暗号化 |
| アクセス制御の不備 | RBAC実装、Middleware検証 |

---

**このドキュメントは Issue #3 の要件に基づいて、Miyabi Autonomous Agent により自動生成されました。**

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
