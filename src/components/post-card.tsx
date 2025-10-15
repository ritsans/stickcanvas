import Image from "next/image"
import Link from "next/link"
import ReactionPicker from "./reaction-picker"
import { getPostReactions, getUserReaction } from "@/lib/supabase/reactions"
import { createClient } from "@/lib/supabase/server"

type PostCardProps = {
  post: {
    id: string
    caption: string | null
    image_url: string | null
    has_image: boolean
    created_at: string
  }
  author: {
    screen_name: string | null
    avatar_url: string | null
    user_id: string | null
    email: string
  }
}

export default async function PostCard({ post, author }: PostCardProps) {
  // リアクションデータを取得
  const reactions = await getPostReactions(post.id)
  const userReaction = await getUserReaction(post.id)

  // 認証状態を確認
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isAuthenticated = !!user
  const screenName = author.screen_name || author.email || "ユーザー"
  const avatarUrl = author.avatar_url
  const imageUrl = post.has_image && post.image_url ? post.image_url : "/placeholder.png"

  // 投稿日時のフォーマット
  const postDate = new Date(post.created_at)
  const formattedDate = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(postDate)

  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* 投稿者情報 */}
      <div className="flex items-center gap-3 border-b border-gray-200 p-4">
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={screenName}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
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
          {author.user_id ? (
            <Link href={`/${author.user_id}`} className="font-semibold hover:underline">
              {screenName}
            </Link>
          ) : (
            <p className="font-semibold">{screenName}</p>
          )}
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
      </div>

      {/* 投稿画像 */}
      <div className="relative aspect-square w-full bg-gray-100">
        <Image
          src={imageUrl}
          alt={post.caption || "投稿画像"}
          fill
          sizes="(max-width: 672px) 100vw, 672px"
          className="object-cover"
          priority={false}
        />
      </div>

      {/* リアクション */}
      <div className="border-t border-gray-200 p-4">
        <ReactionPicker
          postId={post.id}
          initialReactions={reactions}
          userReaction={userReaction}
          isAuthenticated={isAuthenticated}
        />
      </div>

      {/* キャプション */}
      {post.caption && (
        <div className="px-4 pb-4">
          <p className="whitespace-pre-wrap text-sm">{post.caption}</p>
        </div>
      )}
    </article>
  )
}
