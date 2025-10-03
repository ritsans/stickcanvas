import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ProfileForm from "./profile-form"

export default async function ProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const { data: usernameRow } = await supabase
    .from("usernames")
    .select("username")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <main className="mx-auto max-w-xl space-y-6 px-6 py-12">
      <header>
        <h1 className="text-3xl font-bold">プロフィール編集</h1>
        <p className="mt-2 text-sm text-gray-600">
          アバター、ユーザーID、表示名、自己紹介を一括で設定できます
        </p>
      </header>

      <ProfileForm user={user} username={usernameRow?.username || null} />
    </main>
  )
}
