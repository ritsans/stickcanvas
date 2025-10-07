import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { getFollowerUsers } from "@/lib/supabase/follows"

export default async function FollowersPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const result = await getFollowerUsers()

  if ("error" in result) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4">
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ← ダッシュボードに戻る
            </Link>
          </div>
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-red-600">{result.error}</p>
          </div>
        </div>
      </div>
    )
  }

  const { users } = result

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4">
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            ← ダッシュボードに戻る
          </Link>
        </div>

        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">フォロワー</h1>
          <p className="mt-2 text-gray-600">
            {users.length}人のユーザーにフォローされています
          </p>
        </div>

        {users.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-600">まだフォロワーがいません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <Link
                key={user.authUserId}
                href={`/${user.userId}`}
                className="block rounded-lg bg-white p-6 shadow transition hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <Image
                    src={user.avatarUrl || "/placeholder.png"}
                    alt={user.displayName || user.userId}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold">
                      {user.displayName || user.userId}
                    </h2>
                    <p className="text-sm text-gray-600">@{user.userId}</p>
                    {user.biography && (
                      <p className="mt-2 text-sm text-gray-700 line-clamp-2">{user.biography}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
