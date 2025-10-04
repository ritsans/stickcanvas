import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getAllPosts } from "@/lib/supabase/posts"
import PostCard from "@/components/post-card"

export default async function HomePage() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  // 全ユーザーの投稿を取得
  const posts = await getAllPosts()

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">StickCanvas</h1>
          <div className="flex gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded bg-black px-4 py-2 text-sm text-white"
              >
                ダッシュボード
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded bg-black px-4 py-2 text-sm text-white"
                >
                  ログイン
                </Link>
                <Link href="/signup" className="rounded border px-4 py-2 text-sm">
                  新規登録
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* タイムライン */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        {posts.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500">まだ投稿がありません</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  id: post.id,
                  caption: post.caption,
                  image_url: post.image_url,
                  has_image: post.has_image,
                  created_at: post.created_at,
                }}
                author={{
                  screen_name: post.usernames?.screen_name || null,
                  avatar_url: post.usernames?.avatar_url || null,
                  user_id: post.usernames?.user_id || null,
                  email: post.usernames?.email || "",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_SUPABASE_URL && (
        <p className="mx-auto mt-6 max-w-2xl px-4 text-sm text-amber-600">
          環境変数が未設定です。<code>.env.local</code> に
          <code>NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY</code> を設定してください。
        </p>
      )}
    </main>
  )
}
