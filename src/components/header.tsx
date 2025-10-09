import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let username = null
  if (user) {
    const { data: usernameData } = await supabase
      .from("usernames")
      .select("*")
      .eq("auth_user_id", user.id)
      .single()
    username = usernameData?.user_id
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            StickCanvas
          </Link>

          <nav className="flex items-center gap-6">
            {user ? (
              <>
                <Link href="/" className="hover:text-gray-600">
                  ホーム
                </Link>
                <Link href="/dashboard" className="hover:text-gray-600">
                  投稿
                </Link>
                {username && (
                  <Link href={`/${username}`} className="hover:text-gray-600">
                    プロフィール
                  </Link>
                )}
                <form action="/api/auth/signout" method="post">
                  <Button type="submit" size="sm">
                    ログアウト
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-gray-600">
                  ログイン
                </Link>
                <Link href="/signup" className="hover:text-gray-600">
                  サインアップ
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
