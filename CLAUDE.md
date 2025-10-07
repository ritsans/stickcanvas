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
│   │   ├── page.tsx         # 自分の投稿一覧・投稿フォーム表示
│   │   └── post-form.tsx    # 投稿フォームコンポーネント
│   ├── profile/              # プロフィール編集ページ + フォーム
│   ├── [username]/           # ユーザープロフィール公開ページ（動的ルート）
│   ├── followings/           # フォローリスト（自分がフォローしているユーザー）
│   ├── followers/            # フォロワーリスト（自分をフォローしているユーザー）
│   ├── forgot-password/      # パスワードリセット申請ページ + フォーム
│   ├── reset-password/       # 新パスワード設定ページ + フォーム
│   ├── reset-password-sent/  # リセットメール送信完了ページ
│   └── page.tsx              # ホームページ（全ユーザーの投稿タイムライン）
├── auth/
│   └── callback/             # Supabase認証コールバック処理
├── components/
│   ├── post-card.tsx         # 投稿表示コンポーネント
│   └── follow-button.tsx     # フォローボタンコンポーネント
└── lib/
    ├── supabase/
    │   ├── client.ts         # ブラウザ用Supabaseクライアント
    │   ├── server.ts         # サーバー用Supabaseクライアント (SSR対応)
    │   ├── auth.ts           # 認証関連のServer Actions
    │   ├── posts.ts          # 投稿関連のServer Actions
    │   └── follows.ts        # フォロー関連のServer Actions
    └── validations/
        ├── auth.ts           # Zod検証スキーマ（認証フォーム用）
        └── post.ts           # Zod検証スキーマ（投稿フォーム用）
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
   - `updateAllProfile()` - プロフィール一括更新（アバター、ユーザーID、表示名、自己紹介） → `/profile`にリダイレクト
   - `updateUsername()` - ユーザーID更新（重複チェック付き） → `/profile`にリダイレクト
   - `uploadAvatar()` - アバター画像アップロード（5MB以下、古い画像は自動削除） → `/dashboard`にリダイレクト
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

5. **プロフィール機能**
   - `/profile` - プロフィール編集（認証必須）
   - アバター画像アップロード（5MB制限、画像形式のみ）
   - ユーザーID設定（3〜20文字、半角英数字+アンダースコア、重複チェック）
   - 表示名・自己紹介の編集
   - `usernames`テーブルと`user_metadata`の同期更新
   - `/[username]` - ユーザープロフィール公開ページ（動的ルート、ユーザーID基準）

6. **投稿機能** (`src/lib/supabase/posts.ts`)
   - `createPost()` - 投稿作成（画像＋キャプションまたはテキストのみ）
     - 画像バリデーション（5MB以下、画像形式のみ）
     - `post-images`バケットにアップロード
     - 画像がない場合は`/placeholder.png`を表示
     - `/dashboard`にリダイレクト
   - `deletePost()` - 投稿削除（所有者のみ可能）
     - 画像も`post-images`バケットから削除
   - `getAllPosts()` - 全ユーザーの投稿取得（タイムライン用）
     - `posts`テーブルから全投稿を新しい順で取得
     - `usernames`テーブルから投稿者情報を取得（`auth_user_id`で紐付け）
     - 投稿とユーザー情報をマッピングして返却

7. **タイムライン機能**
   - `/`（ホームページ）で全ユーザーの投稿を時系列表示
   - ログイン/未ログインどちらでも閲覧可能
   - 各投稿にユーザー名・アバター・投稿日時を表示
   - ユーザー名クリックで`/[username]`へ遷移

8. **フォロー機能** (`src/lib/supabase/follows.ts`)
   - `followUser()` - フォロー
   - `unfollowUser()` - アンフォロー
   - `getFollowStats()` - フォロー数・フォロワー数取得
   - `checkIsFollowing()` - フォロー状態確認
   - `checkIsMutualFollow()` - 相互フォロー確認
   - `checkIsFollowedBy()` - 相手が自分をフォローしているか確認
   - `getFollowingUsers()` - フォローリスト取得（自分がフォローしているユーザー）
   - `getFollowerUsers()` - フォロワーリスト取得（自分をフォローしているユーザー）
   - **実装方針**:
     - フォロー数・フォロワー数は誰でも閲覧可能
     - フォローリスト・フォロワーリストは本人のみ閲覧可能（`/followings`, `/followers`）
     - 相互フォロー関係のみバッジで明示的に表示
     - 目的: 作品投稿の心理的ハードルを下げつつ、適度な繋がりを感じられるようにする
   - **フォローボタン** (`src/components/follow-button.tsx`)
     - フォロー後にリアルタイムで相互フォローバッジを表示
     - 自分のプロフィールでは非表示
     - 未ログイン時は無効化
   - **リスト取得の仕組み**:
     - 2段階クエリでデータ取得（`follows`テーブルと`usernames`テーブルを直接結合できないため）
     - フォローリスト: `follower_id = user.id`でフィルタ → `following_id`を取得
     - フォロワーリスト: `following_id = user.id`でフィルタ → `follower_id`を取得
     - `usernames`テーブルのカラム名は`screen_name`（`display_name`ではない）

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

3. **Storage → avatars バケット**
   - ユーザーアバター画像の保存先
   - パス構造: `{user_id}/{timestamp}.{ext}`
   - 古い画像は自動削除される仕組み

4. **Storage → post-images バケット**
   - 投稿画像の保存先
   - パス構造: `{user_id}/{post_id}/{timestamp}.{ext}`

5. **Database → usernames テーブル**
   - スキーマ:
     - `id` (uuid, pk)
     - `user_id` (text, unique) - プロフィールURL用のユーザー名（例: `potato`, `neko`）
     - `auth_user_id` (uuid, unique, fk to auth.users.id) - 認証システムとの紐付け
     - `email`, `screen_name`, `avatar_url`, `biography`
   - ユーザーIDの重複チェックとプロフィール情報の同期に使用
   - `auth_user_id`で`posts.user_id`と紐付けて投稿者情報を取得
   - **注意**: 表示名のカラム名は`screen_name`（`display_name`ではない）

6. **Database → posts テーブル**
   - スキーマ: `id` (uuid, pk), `user_id` (uuid, fk), `caption` (text), `image_url` (text), `has_image` (boolean), `created_at`, `updated_at`
   - RLSポリシー: 自分の投稿は全操作可能、全ユーザーが閲覧可能
   - マイグレーションファイル: `supabase/migrations/create_posts_table.sql`

7. **Database → follows テーブル**
   - スキーマ: `id` (uuid, pk), `follower_id` (uuid, fk to auth.users.id), `following_id` (uuid, fk to auth.users.id), `created_at`
   - ユニーク制約: `(follower_id, following_id)`
   - CHECK制約: `follower_id != following_id`（自己フォロー禁止）
   - インデックス: `follower_id`, `following_id`
   - RLSポリシー: 誰でも閲覧可能、ログインユーザーは自分のフォロー/アンフォロー操作が可能
   - マイグレーションファイル: `supabase/migrations/create_follows_table.sql`

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

3. **バリデーション**
   - Zodスキーマで入力検証
   - 認証フォーム（`src/lib/validations/auth.ts`）
     - メールアドレス: `.pipe(z.email())`でチェーン検証
     - パスワード: 8文字以上
     - ユーザーID: 3〜20文字、半角英数字+アンダースコア（`/^[a-z0-9_]{3,20}$/`）
   - 投稿フォーム（`src/lib/validations/post.ts`）
     - キャプション: 最大2000文字

4. **画像アップロード**
   - FormDataから`File`オブジェクト取得
   - サイズ・形式チェック後、Supabase Storageにアップロード
   - 古いファイルは`remove()`で削除してから新規アップロード
   - パブリックURLを取得して`user_metadata`に保存

5. **データ同期**
   - ユーザープロフィール情報は`auth.users.user_metadata`と`usernames`テーブル両方に保存
   - `updateAllProfile()`で一括更新、両者を同期
   - ユーザーID変更時は旧URLと新URLの両方で`revalidatePath()`を実行

6. **投稿とユーザー情報の紐付け**
   - `posts.user_id` (UUID) → `auth.users.id`を参照
   - `usernames.auth_user_id` (UUID) → `auth.users.id`を参照
   - タイムライン表示時は`posts.user_id`と`usernames.auth_user_id`で結合
   - `usernames.user_id` (TEXT)はプロフィールURL用（例: `/potato`）

7. **Next.js 15対応**
   - 動的ルートの`params`は`Promise`型
   - 使用前に必ず`await`すること（例: `const { username } = await params`）
