import { notFound } from "next/navigation"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"

type PageProps = {
  params: { username: string }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username: userId } = params
  const supabase = createClient()

  // ユーザー名とプロフィール情報を取得
  const { data: profileData } = await supabase
    .from("usernames")
    .select("id, user_id, display_name, avatar_url, biography, email")
    .eq("user_id", userId)
    .single()

  if (!profileData) {
    notFound()
  }

  const displayName = profileData.display_name || profileData.email || "ユーザー"
  const avatarUrl = profileData.avatar_url
  const biography = profileData.biography

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-6 py-12">
      {/* プロフィールヘッダー */}
      <div className="flex items-start gap-6">
        {/* アバター画像 */}
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
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
          <h1 className="text-3xl font-bold">{displayName}</h1>
          <p className="mt-1 text-sm text-gray-600">@{userId}</p>
        </div>
      </div>

      {/* バイオグラフィー */}
      {biography && (
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-700">自己紹介</h2>
          <p className="whitespace-pre-wrap text-sm text-gray-900">{biography}</p>
        </section>
      )}

      {/* 今後追加予定のコンテンツエリア */}
      <section className="rounded-lg border border-gray-200 p-6">
        <p className="text-center text-sm text-gray-500">
          作品やアクティビティはまだありません
        </p>
      </section>
    </main>
  )
}
