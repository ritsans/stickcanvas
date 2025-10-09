import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/lib/supabase/auth"
import PostCard from "@/components/post-card"
import { Button } from "@/components/ui/button"

export default async function DashbordPage() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const screenName = user.user_metadata?.screen_name || user.email
  const avatarUrl = user.user_metadata?.avatar_url

  // 自分の投稿を取得
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // ユーザー情報を取得
  const { data: userInfo } = await supabase
    .from("usernames")
    .select("user_id")
    .eq("id", user.id)
    .maybeSingle()

  const authorData = {
    screen_name: user.user_metadata?.screen_name || null,
    avatar_url: user.user_metadata?.avatar_url || null,
    user_id: userInfo?.user_id || null,
    email: user.email || "",
  }

  return (
    <main className="mx-auto max-w-xl space-y-6 px-6 py-12">
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* アバター画像 */}
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-200">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="アバター"
                fill
                priority
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold">ダッシュボード</h1>
            <p className="mt-1 text-sm text-gray-600">ようこそ、{screenName}さん</p>
          </div>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/profile">プロフィール編集</Link>
        </Button>
      </header>

      <form action={signOut}>
        <Button type="submit">ログアウト</Button>
      </form>

      {/* 投稿一覧 */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold">あなたの投稿</h2>
        {posts && posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} author={authorData} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-sm text-gray-500">まだ投稿がありません</p>
          </div>
        )}
      </section>
    </main>
  )
}
