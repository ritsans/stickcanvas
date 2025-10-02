# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15アプリケーション（App Router使用）。Supabase認証を統合したWebアプリケーション。Turbopackを使用して開発・ビルドを高速化。

- 現在、**フロントエンドプログラム学習目的** でプロジェクトを進めています。基本的な動きが完成した後にアプリケーション開発に取り組みます。

## Commands

### Development

```bash
pnpm dev          # 開発サーバー起動 (Turbopack使用、http://localhost:3000)
pnpm build        # プロダクションビルド (Turbopack使用)
pnpm start        # プロダクションサーバー起動
```

### Code Quality

```bash
pnpm lint         # ESLintでコードチェック
pnpm lint:fix     # ESLintで自動修正
pnpm format       # Prettierでコード整形
pnpm format:check # Prettierでフォーマット確認
```

## Architecture

### Directory Structure

```
src/
├── app/                       # Next.js App Router
│   ├── login/                # ログインページ + フォームコンポーネント
│   ├── signup/               # サインアップページ + フォームコンポーネント
│   ├── check-email/          # メール確認ページ
│   ├── dashboard/            # ダッシュボード（認証後）
│   ├── forgot-password/      # パスワードリセット申請ページ + フォーム
│   ├── reset-password/       # 新パスワード設定ページ + フォーム
│   ├── reset-password-sent/  # リセットメール送信完了ページ
│   └── page.tsx              # ホームページ
├── auth/
│   └── callback/             # Supabase認証コールバック処理
└── lib/
    └── supabase/
        ├── client.ts         # ブラウザ用Supabaseクライアント
        ├── server.ts         # サーバー用Supabaseクライアント (SSR対応)
        └── auth.ts           # 認証関連のServer Actions
```

### Authentication Flow

1. **Supabaseクライアント作成**
   - `src/lib/supabase/client.ts` - クライアントコンポーネント用（`createBrowserClient`）
   - `src/lib/supabase/server.ts` - サーバーコンポーネント/API用（`createServerClient`）
   - **重要**: Fluid compute環境を考慮し、サーバークライアントはグローバル変数ではなく関数内で毎回作成すること

2. **認証アクション** (`src/lib/supabase/auth.ts`)
   - `signIn()` - パスワードでサインイン → `/dashboard`にリダイレクト
   - `signUp()` - ユーザー登録 → `/check-email`にリダイレクト
   - `signOut()` - サインアウト → `/`にリダイレクト
   - `requestPasswordReset()` - パスワードリセットメール送信 → `/reset-password-sent`にリダイレクト
   - `resetPassword()` - 新しいパスワードで更新 → `/dashboard`にリダイレクト
   - すべてServer Actionsとして実装（`"use server"`）

3. **コールバック処理** (`src/auth/callback/route.ts`)
   - メール確認後のOAuthコードをセッションに変換
   - 成功時は`/dashboard`にリダイレクト、失敗時は`/login`にエラーパラメータ付きでリダイレクト

4. **パスワードリセットフロー**
   - ログインページ → "パスワードをお忘れですか？" リンク
   - `/forgot-password` - メールアドレス入力
   - Supabaseがリセットリンク付きメールを送信
   - `/reset-password-sent` - 送信完了通知
   - メール内リンクをクリック → `/reset-password`
   - 新しいパスワードを設定 → `/dashboard`

### Environment Variables

必須の環境変数（`.env.local`に設定）:

- `NEXT_PUBLIC_SUPABASE_URL` - SupabaseプロジェクトURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase匿名キー
- `NEXT_PUBLIC_SITE_URL` - サイトのベースURL（本番環境用、開発時は省略可）

### Supabase Configuration

**Supabase Dashboard設定項目**:

1. **Authentication → Email Templates**
   - パスワードリセットメールのテンプレート設定

2. **Authentication → URL Configuration → Redirect URLs**
   - 開発: `http://localhost:3000/reset-password`
   - 本番: `https://yourdomain.com/reset-password`
   - これらのURLを許可リストに追加すること

### TypeScript Configuration

- Path alias: `@/*` → `src/*`
- Strict mode有効
- Target: ES2022

### Code Style

- **Prettier設定**:
  - セミコロンなし (`"semi": false`)
  - ダブルクォート使用 (`"singleQuote": false`)
  - 末尾カンマあり (`"trailingComma": "all"`)
  - 行幅100文字 (`"printWidth": 100`)

- **ESLint**: Next.js推奨設定 + Prettier統合

### Key Patterns

1. **Server Actionsパターン**
   - フォーム送信は`useFormState`/`useActionState`フックで処理
   - エラーハンドリングは`{ error: string }`オブジェクトを返す
   - 成功時は`revalidatePath()`でキャッシュ無効化後に`redirect()`

2. **Supabaseクライアント使い分け**
   - Client Component → `@/lib/supabase/client`
   - Server Component/API → `@/lib/supabase/server`
   - 毎回新しいクライアントインスタンスを作成（特にサーバー側）
