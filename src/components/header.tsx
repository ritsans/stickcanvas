import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-200 hover:opacity-80 transition-opacity">
                      {user.user_metadata?.avatar_url ? (
                        <Image
                          src={user.user_metadata.avatar_url}
                          alt="アバター"
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
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      {username && (
                        <DropdownMenuItem asChild>
                          <Link href={`/${username}`} className="cursor-pointer">
                            プロフィール
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        ダッシュボード
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        プロフィール編集
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/api/auth/signout" className="cursor-pointer">
                        ログアウト
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
