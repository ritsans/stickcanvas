import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { signOut } from "@/lib/supabase/auth"

export default async function DashbordPage() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const displayName = user.user_metadata?.display_name || user.email
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <main className="mx-auto max-w-xl space-y-6 px-6 py-12">
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* アバター画像 */}
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-200">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="アバター" fill className="object-cover" />
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
            <p className="mt-1 text-sm text-gray-600">ようこそ、{displayName}さん</p>
          </div>
        </div>

        <Link
          href="/profile"
          className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          プロフィール編集
        </Link>
      </header>

      <form action={signOut}>
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          ログアウト
        </button>
      </form>
    </main>
  )
}
