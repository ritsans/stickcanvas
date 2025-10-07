import { notFound } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import PostCard from "@/components/post-card"
import FollowButton from "@/components/follow-button"
import { getFollowStats, checkIsFollowing, checkIsMutualFollow } from "@/lib/supabase/follows"

type PageProps = {
  params: Promise<{ username: string }>
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username: userId } = await params
  const supabase = createClient()

  // ユーザー名とプロフィール情報を取得
  const { data: profileData } = await supabase
    .from("usernames")
    .select("id, user_id, screen_name, avatar_url, biography, email")
    .eq("user_id", userId)
    .single()

  if (!profileData) {
    notFound()
  }

  const screenName = profileData.screen_name || profileData.email || "ユーザー"
  const avatarUrl = profileData.avatar_url
  const biography = profileData.biography

  // フォロー統計を取得
  const { followingCount, followerCount } = await getFollowStats(profileData.id)

  // ログインユーザーを取得
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const isOwnProfile = currentUser?.id === profileData.id
  const isLoggedIn = !!currentUser

  // フォロー状態をチェック
  const initialIsFollowing = currentUser ? await checkIsFollowing(profileData.id) : false

  // 相互フォロー状態をチェック
  const initialIsMutualFollow = currentUser ? await checkIsMutualFollow(profileData.id) : false

  // このユーザーの投稿を取得
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("user_id", profileData.id)
    .order("created_at", { ascending: false })

  const authorData = {
    screen_name: profileData.screen_name,
    avatar_url: profileData.avatar_url,
    user_id: profileData.user_id,
    email: profileData.email,
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-12">
      {/* プロフィールヘッダー */}
      <div className="flex items-start gap-6">
        {/* アバター画像 */}
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={screenName}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{screenName}</h1>
              <p className="mt-1 text-sm text-gray-600">@{userId}</p>
            </div>
            <FollowButton
              targetAuthUserId={profileData.id}
              initialIsFollowing={initialIsFollowing}
              initialIsMutualFollow={initialIsMutualFollow}
              isOwnProfile={isOwnProfile}
              isLoggedIn={isLoggedIn}
            />
          </div>

          {/* フォロー統計 */}
          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <span className="font-bold">{followingCount}</span>
              <span className="ml-1 text-gray-600">フォロー中</span>
            </div>
            <div>
              <span className="font-bold">{followerCount}</span>
              <span className="ml-1 text-gray-600">フォロワー</span>
            </div>
          </div>
        </div>
      </div>

      {/* バイオグラフィー */}
      {biography && (
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">自己紹介</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-900">{biography}</p>
        </section>
      )}

      {/* 投稿一覧 */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold">投稿</h2>
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
