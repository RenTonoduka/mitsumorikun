# Google OAuth セットアップガイド

このガイドでは、みつもりくんでGoogleログインを有効にするための手順を説明します。

## 前提条件

- Google Cloud Platform (GCP) アカウント
- プロジェクトが作成済み

## 手順

### 1. Google Cloud Console にアクセス

https://console.cloud.google.com/ にアクセスし、プロジェクトを選択します。

### 2. OAuth 同意画面の設定

1. 左メニューから **APIs & Services** > **OAuth consent screen** を選択
2. **User Type** で **External** を選択し、**CREATE** をクリック
3. 以下の情報を入力:
   - **App name**: みつもりくん
   - **User support email**: あなたのメールアドレス
   - **Developer contact information**: あなたのメールアドレス
4. **SAVE AND CONTINUE** をクリック
5. Scopes ページはそのまま **SAVE AND CONTINUE**
6. Test users ページで開発用のGoogleアカウントを追加（任意）
7. **SAVE AND CONTINUE** をクリック

### 3. OAuth 認証情報の作成

1. 左メニューから **APIs & Services** > **Credentials** を選択
2. **+ CREATE CREDENTIALS** > **OAuth client ID** をクリック
3. 以下を設定:
   - **Application type**: Web application
   - **Name**: みつもりくん Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     http://localhost:3001
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/api/auth/callback/google
     http://localhost:3001/api/auth/callback/google
     ```
4. **CREATE** をクリック
5. 表示される **Client ID** と **Client Secret** をコピー

### 4. 環境変数の設定

プロジェクトルートの `.env` ファイルに以下を追加:

```bash
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret"
```

### 5. 開発サーバーの再起動

```bash
npm run dev
```

## トラブルシューティング

### エラー: redirect_uri_mismatch

**原因**: Google Cloud Console で設定したリダイレクトURIと、アプリケーションからのリクエストが一致していない

**解決方法**:
1. エラーメッセージに表示されているリダイレクトURIを確認
2. Google Cloud Console の認証情報設定で、そのURIを **Authorized redirect URIs** に追加
3. 設定を保存して、数分待ってから再試行

### エラー: OAuthSignin

**原因**:
- Client ID または Client Secret が未設定
- Client ID または Client Secret が間違っている

**解決方法**:
1. `.env` ファイルを確認
2. Google Cloud Console で認証情報を再確認
3. 環境変数を正しく設定
4. 開発サーバーを再起動

### エラー: 403 access_denied

**原因**: OAuth 同意画面が「Testing」モードで、テストユーザーとして追加されていないアカウントでログインしようとしている

**解決方法**:
1. Google Cloud Console の **OAuth consent screen** にアクセス
2. **Test users** セクションで、使用するGoogleアカウントを追加
3. または、アプリを **Publishing status: In production** に変更（推奨しない）

## 本番環境への展開

本番環境では、以下の追加設定が必要です:

1. **Authorized JavaScript origins** に本番ドメインを追加:
   ```
   https://mitsumorikun.com
   ```

2. **Authorized redirect URIs** に本番コールバックURLを追加:
   ```
   https://mitsumorikun.com/api/auth/callback/google
   ```

3. `.env.production` ファイルに本番用の環境変数を設定:
   ```bash
   NEXTAUTH_URL="https://mitsumorikun.com"
   NEXT_PUBLIC_BASE_URL="https://mitsumorikun.com"
   ```

## セキュリティ上の注意

⚠️ **重要**:

- `.env` ファイルは **絶対に** Git にコミットしないでください
- `.env` は `.gitignore` に含まれていることを確認してください
- Client Secret は機密情報です。公開リポジトリに含めないでください
- 本番環境では必ず HTTPS を使用してください

## 参考リンク

- [NextAuth.js Google Provider Documentation](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

🔒 このドキュメントには機密情報は含まれていません。設定手順のみを記載しています。
